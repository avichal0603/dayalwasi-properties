// ============================================
// Dayalwasi Properties — Properties Hook
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, uploadImage, deleteImage, getImageUrl } from '@/lib/supabase';
import { calcPricePerGaj, gajToSqft } from '@/lib/utils';
import type { Property, PropertyFormData } from '@/lib/types';

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
      setProperties(data || []);
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

    if (error) {
      console.error('Fetch property error:', error);
      return null;
    }
    return data;
  }, []);

  const createProperty = useCallback(
    async (formData: PropertyFormData, imageFiles: File[]): Promise<Property | null> => {
      const area_sqft = gajToSqft(formData.area_gaj);
      const price_per_gaj = calcPricePerGaj(formData.price, formData.area_gaj);

      // First create the property to get an ID
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...formData,
          area_sqft,
          price_per_gaj,
          images: [],
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Create error:', error);
        return null;
      }

      // Upload images
      if (imageFiles.length > 0) {
        const imagePaths: string[] = [];
        for (const file of imageFiles) {
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
            setProperties((prev) => [updated, ...prev]);
            return updated;
          }
        }
      }

      setProperties((prev) => [data, ...prev]);
      return data;
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

      // Handle new image uploads
      let newImagePaths: string[] = [];
      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const path = await uploadImage(file, id);
          if (path) newImagePaths.push(path);
        }
      }

      // Get current property for existing images
      const current = properties.find((p) => p.id === id);
      const existingImages = current
        ? current.images.filter((img) => !removedImages?.includes(img))
        : [];

      const updateData: Record<string, unknown> = { ...formData };
      if (formData.area_gaj) {
        updateData.area_sqft = gajToSqft(formData.area_gaj);
      }
      if (formData.price && formData.area_gaj) {
        updateData.price_per_gaj = calcPricePerGaj(formData.price, formData.area_gaj);
      }
      if (newImageFiles || removedImages) {
        updateData.images = [...existingImages, ...newImagePaths];
      }

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Update error:', error);
        return null;
      }

      setProperties((prev) => prev.map((p) => (p.id === id ? data : p)));
      return data;
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
