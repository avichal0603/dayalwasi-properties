// ============================================
// Dayalwasi Properties — Properties Hook
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, uploadImage, deleteImage, getImageUrl } from '@/lib/supabase';
import { calcPricePerGaj, gajToSqft } from '@/lib/utils';
import { compressImages } from '@/lib/imageCompression';
import type { Property, PropertyFormData } from '@/lib/types';

function parseProperty(p: any): Property {
  let drive_url = p.drive_url || null;
  let notes = p.notes;
  if (!drive_url && notes) {
    const match = notes.match(/\[Drive:\s*(https?:\/\/[^\]]+)\]/i);
    if (match) {
      drive_url = match[1].trim();
      notes = notes.replace(/\[Drive:\s*(https?:\/\/[^\]]+)\]/i, '').trim();
    }
  }
  return {
    ...p,
    drive_url,
    notes,
  };
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      const parsed = (data || []).map(parseProperty);
      setProperties(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const getProperty = useCallback(async (id: string): Promise<Property | null> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Fetch property error:', error);
      return null;
    }
    return parseProperty(data);
  }, []);

  const createProperty = useCallback(
    async (formData: PropertyFormData, imageFiles: File[]): Promise<Property | null> => {
      const area_sqft = gajToSqft(formData.area_gaj);
      const price_per_gaj = calcPricePerGaj(formData.price, formData.area_gaj);

      // Embed drive_url in notes as robust fallback if column is not yet migrated in Supabase
      let notes = formData.notes || '';
      if (formData.drive_url) {
        notes = `${notes}\n[Drive: ${formData.drive_url}]`.trim();
      }

      const insertPayload: Record<string, any> = {
        ...formData,
        notes,
        area_sqft,
        price_per_gaj,
        images: [],
      };

      // First create the property to get an ID
      let { data, error } = await supabase
        .from('properties')
        .insert(insertPayload)
        .select()
        .single();

      // If drive_url column does not exist yet in Supabase, retry without it
      if (error && (error.code === '42703' || error.message?.includes('drive_url'))) {
        delete insertPayload.drive_url;
        const retry = await supabase
          .from('properties')
          .insert(insertPayload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error || !data) {
        console.error('Create error:', error);
        return null;
      }

      // Auto-compress and upload images
      if (imageFiles.length > 0) {
        const compressedFiles = await compressImages(imageFiles);
        const imagePaths: string[] = [];
        for (const file of compressedFiles) {
          const path = await uploadImage(file, data.id);
          if (path) imagePaths.push(path);
        }

        // Update property with image paths
        if (imagePaths.length > 0) {
          const { data: updated } = await supabase
            .from('properties')
            .update({ images: imagePaths })
            .eq('id', data.id)
            .select()
            .single();

          if (updated) {
            const parsedUpdated = parseProperty(updated);
            setProperties((prev) => [parsedUpdated, ...prev]);
            return parsedUpdated;
          }
        }
      }

      const parsedData = parseProperty(data);
      setProperties((prev) => [parsedData, ...prev]);
      return parsedData;
    },
    []
  );

  const updateProperty = useCallback(
    async (
      id: string,
      formData: Partial<PropertyFormData>,
      newImageFiles?: File[],
      removedImages?: string[]
    ): Promise<Property | null> => {
      // Handle image deletions
      if (removedImages && removedImages.length > 0) {
        for (const path of removedImages) {
          await deleteImage(path);
        }
      }

      // Auto-compress and upload new images
      let newImagePaths: string[] = [];
      if (newImageFiles && newImageFiles.length > 0) {
        const compressedFiles = await compressImages(newImageFiles);
        for (const file of compressedFiles) {
          const path = await uploadImage(file, id);
          if (path) newImagePaths.push(path);
        }
      }

      // Get current property for existing images
      const current = properties.find((p) => p.id === id);
      const existingImages = current
        ? current.images.filter((img) => !removedImages?.includes(img))
        : [];

      let notes = formData.notes ?? current?.notes ?? '';
      if (formData.drive_url) {
        notes = `${notes}\n[Drive: ${formData.drive_url}]`.trim();
      }

      const updateData: Record<string, any> = { ...formData, notes };
      if (formData.area_gaj) {
        updateData.area_sqft = gajToSqft(formData.area_gaj);
      }
      if (formData.price && formData.area_gaj) {
        updateData.price_per_gaj = calcPricePerGaj(formData.price, formData.area_gaj);
      }
      if (newImageFiles || removedImages) {
        updateData.images = [...existingImages, ...newImagePaths];
      }

      let { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error && (error.code === '42703' || error.message?.includes('drive_url'))) {
        delete updateData.drive_url;
        const retry = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error || !data) {
        console.error('Update error:', error);
        return null;
      }

      const parsedData = parseProperty(data);
      setProperties((prev) => prev.map((p) => (p.id === id ? parsedData : p)));
      return parsedData;
    },
    [properties]
  );

  const deleteProperty = useCallback(async (id: string): Promise<boolean> => {
    // Delete images from storage first
    const property = properties.find((p) => p.id === id);
    if (property?.images?.length) {
      for (const path of property.images) {
        await deleteImage(path);
      }
    }

    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    setProperties((prev) => prev.filter((p) => p.id !== id));
    return true;
  }, [properties]);

  const getColonies = useCallback((): string[] => {
    const colonies = new Set(properties.map((p) => p.colony));
    return Array.from(colonies).sort();
  }, [properties]);

  return {
    properties,
    loading,
    error,
    fetchProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    getColonies,
    getImageUrl,
  };
}
