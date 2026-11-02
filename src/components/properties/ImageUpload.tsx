"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { compressImages } from "@/lib/imageCompression";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
}

export function ImageUpload({ images, onImagesChange, existingImages = [], onRemoveExisting }: ImageUploadProps) {
  const [compressing, setCompressing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remainingSlots = 10 - (images.length + existingImages.length);
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      if (filesToAdd.length > 0) {
        setCompressing(true);
        try {
          // Compress large photos to lightweight crisp web photos
          const optimized = await compressImages(filesToAdd);
          onImagesChange([...images, ...optimized]);
        } catch (e) {
          console.error("Compression error, using original files:", e);
          onImagesChange([...images, ...filesToAdd]);
        } finally {
          setCompressing(false);
        }
      }
    },
    [images, existingImages.length, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxFiles: 10,
    disabled: compressing,
  });

  const removeNewImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const totalImages = images.length + existingImages.length;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out
          ${
            isDragActive
              ? "border-gold-500 bg-gold-50"
              : "border-beige-300 hover:border-gold-400 bg-beige-50 hover:bg-beige-100"
          }
        `}
      >
        <input {...getInputProps()} />
        {compressing ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-3" />
            <p className="text-sm font-semibold text-brown-800">Optimizing images for instant upload...</p>
            <p className="text-xs text-brown-500 mt-1">Compressing photos to save storage & data</p>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto w-12 h-12 text-gold-400 mb-3" />
            <p className="text-brown-700 font-medium">
              {isDragActive
                ? "Drop images here..."
                : "Drop images here or click to browse"}
            </p>
            <p className="text-sm text-brown-500 mt-1.5">
              Accepts JPEG, PNG, WEBP (Max 10 images)
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-gold-100/70 text-gold-800 rounded-full text-[11px] font-medium border border-gold-200">
              <Sparkles className="w-3 h-3 text-gold-600" />
              <span>Smart Compression Active: 10MB photos auto-reduced to ~100KB</span>
            </div>
            <p className="text-xs text-brown-400 mt-2">
              {totalImages} / 10 selected
            </p>
          </>
        )}
      </div>

      {(images.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-beige-200">
              <Image src={url} alt={`Existing ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => onRemoveExisting && onRemoveExisting(index)}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {images.map((file, index) => (
            <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gold-200">
              <Image src={URL.createObjectURL(file)} alt={`New ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
