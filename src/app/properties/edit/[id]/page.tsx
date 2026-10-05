"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { ImageUpload } from "@/components/properties/ImageUpload";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFormData, Property } from "@/lib/types";
import { uploadImage, deleteImage } from "@/lib/supabase";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { getProperty, updateProperty, deleteProperty } = useProperties();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProperty(id);
        if (data) {
          setProperty(data);
          setExistingImages(data.images || []);
        } else {
          toast.error("Property not found");
          router.push("/properties");
        }
      } catch (err) {
        toast.error("Failed to load property");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, getProperty, router]);

  const handleRemoveExistingImage = async (index: number) => {
    const urlToRemove = existingImages[index];
    try {
      // Opt: Delete from storage immediately or wait for form submit
      // We will delete immediately for simplicity
      await deleteImage(urlToRemove);
      
      const updatedImages = [...existingImages];
      updatedImages.splice(index, 1);
      setExistingImages(updatedImages);
      
      // Update the property record
      await updateProperty(id, { images: updatedImages });
      toast.success("Image removed");
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      let finalImageUrls = [...existingImages];
      
      if (newImages.length > 0) {
        toast.loading("Uploading new images...", { id: "upload" });
        for (const file of newImages) {
          const url = await uploadImage(file, id);
          if (url) {
            finalImageUrls.push(url);
          }
        }
        toast.success("Images uploaded", { id: "upload" });
      }

      const updateData = {
        ...data,
        images: finalImageUrls,
      };

      await updateProperty(id, updateData);
      toast.success("Property updated successfully");
      router.push(`/properties/${id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update property");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await deleteProperty(id);
      toast.success("Property deleted successfully");
      router.push("/properties");
    } catch (err) {
      toast.error("Failed to delete property");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container animate-pulse flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin mb-4"></div>
          <p className="text-brown-500 font-medium">Loading property data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) return null;

  return (
    <DashboardLayout>
      <div className="page-container max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center">
            <Link href={`/properties/${id}`} className="text-brown-500 hover:text-gold-600 transition-colors mr-4 p-2 bg-white rounded-full shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-brown-900">Edit Property</h1>
              <p className="text-brown-500 mt-1 truncate max-w-md">{property.title}</p>
            </div>
          </div>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting || isSubmitting} 
            className="btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center bg-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Property"}
          </button>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6">
            <h2 className="section-title mb-4">Property Images</h2>
            <ImageUpload 
              images={newImages} 
              onImagesChange={setNewImages} 
              existingImages={existingImages}
              onRemoveExisting={handleRemoveExistingImage}
            />
          </div>

          <PropertyForm 
            initialData={property} 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
