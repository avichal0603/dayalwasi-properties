"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { ImageUpload } from "@/components/properties/ImageUpload";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFormData } from "@/lib/types";
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
      const newProperty = await createProperty(data, images);
      
      if (newProperty) {
        toast.success("Property created successfully");
        router.push(`/properties/${newProperty.id}`);
      } else {
        toast.error("Failed to create property");
      }
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
