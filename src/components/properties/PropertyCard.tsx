"use client";

import { useState } from "react";
import Image from "next/image";
import { Property } from "@/lib/types";
import { Building2, MapPin, Ruler, Compass, FolderOpen } from "lucide-react";
import {
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
  PROPERTY_TYPE_LABELS,
  formatPrice,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);
  const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;

  return (
    <div
      onClick={onClick}
      className="premium-card gold-glow cursor-pointer flex flex-col group h-full btn-press"
    >
      <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-br from-beige-100 to-beige-200 flex items-center justify-center">
        {firstImage && !imgError ? (
          <Image
            src={firstImage}
            alt={property.title || "Property Image"}
            fill
            className="object-cover card-image"
            onError={() => setImgError(true)}
          />
        ) : (
          <Building2 className="w-12 h-12 text-gold-300" />
        )}
        
        {property.availability && (
          <div
            className={cn(
              "absolute top-3 right-3 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] font-semibold rounded-full shadow-sm backdrop-blur-sm",
              property.availability === 'available'
                ? "bg-olive-100/95 text-olive-900 border border-olive-300/60"
                : (AVAILABILITY_COLORS[property.availability as keyof typeof AVAILABILITY_COLORS] || "bg-gray-100 text-gray-800")
            )}
          >
            {AVAILABILITY_LABELS[property.availability as keyof typeof AVAILABILITY_LABELS] || property.availability}
          </div>
        )}

        {property.drive_url && (
          <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold rounded-full shadow-sm bg-white/95 text-amber-900 border border-amber-300 flex items-center gap-1 backdrop-blur-sm">
            <FolderOpen className="w-3 h-3 text-amber-600" />
            <span>Drive HD</span>
          </div>
        )}
      </div>

      <div className="p-3.5 sm:p-5 flex flex-col flex-grow min-w-0">
        <h3 className="font-display font-bold text-base sm:text-lg text-brown-900 mb-2 line-clamp-2 break-words leading-snug">
          {property.title}
        </h3>

        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm text-brown-700 flex-grow min-w-0">
          <div className="flex items-center min-w-0">
            <MapPin className="w-4 h-4 mr-2 text-gold-500 shrink-0" />
            <span className="truncate">{property.colony}</span>
          </div>
          <div className="flex items-center min-w-0">
            <Ruler className="w-4 h-4 mr-2 text-gold-500 shrink-0" />
            <span>{property.area_gaj} गज</span>
          </div>
          {property.facing && (
            <div className="flex items-center min-w-0">
              <Compass className="w-4 h-4 mr-2 text-gold-500 shrink-0" />
              <span className="capitalize">{property.facing} Facing</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-beige-200/80 flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="text-base sm:text-lg font-display font-bold text-gold-600 truncate">
            {formatPrice(property.price)}
          </div>
          <div className="badge bg-beige-100 text-brown-800 border border-beige-300 text-[10px] sm:text-xs shrink-0">
            {PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS] || property.property_type}
          </div>
        </div>
      </div>
    </div>
  );
}
