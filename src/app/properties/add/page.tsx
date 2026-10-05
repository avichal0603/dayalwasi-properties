"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { ImageUpload } from "@/components/properties/ImageUpload";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFormData } from "@/lib/types";
import { uploadImage } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AddPropertyPage() {
  const router = useRouter();
  const { createProperty } = useProperties();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create property first to get ID
      const newProperty = await createProperty(data);
      
      // 2. Upload images if any
      if (images.length > 0 && newProperty) {
        toast.loading("Uploading images...", { id: "upload" });
        const uploadedUrls: string[] = [];
        
        for (const file of images) {
          const url = await uploadImage(file, newProperty.id);
          if (url) {
            uploadedUrls.push(url);
          }
        }
        
        toast.success("Images uploaded", { id: "upload" });
      } else {
        toast.success("Property created successfully");
      }
      
      router.push(`/properties/${newProperty?.id || ''}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create property");
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container max-w-5xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/properties" className="text-brown-500 hover:text-gold-600 transition-colors mr-4 p-2 bg-white rounded-full shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-brown-900">Add New Property</h1>
            <p className="text-brown-500 mt-1">Enter the details for the new listing</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6">
            <h2 className="section-title mb-4">Property Images</h2>
            <ImageUpload images={images} onImagesChange={setImages} />
          </div>

          <PropertyForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </div>
    </DashboardLayout>
  );
}
