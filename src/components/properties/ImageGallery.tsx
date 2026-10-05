"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  getImageUrl?: (path: string) => string;
}

export function ImageGallery({ images, getImageUrl }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const displayImages = images.map(img => getImageUrl ? getImageUrl(img) : img);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-beige-100 rounded-xl flex flex-col items-center justify-center text-brown-400">
        <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No images available</p>
      </div>
    );
  }

  const currentImage = displayImages[currentIndex];

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-black group">
          <Image
            src={currentImage}
            alt={`Property image ${currentIndex + 1}`}
            fill
            className="object-contain transition-opacity duration-300"
          />
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold-200">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative w-24 aspect-square flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                  idx === currentIndex ? "border-gold-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center">
            <Image
              src={currentImage}
              alt={`Fullscreen property image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-2 rounded-full font-medium">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
}
