"use client";

import Image from "next/image";
import { Property } from "@/lib/types";
import { Building2, MapPin, Ruler, Compass } from "lucide-react";
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
  const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;

  return (
    <div
      onClick={onClick}
      className="premium-card gold-glow cursor-pointer flex flex-col group h-full btn-press"
    >
      <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-br from-beige-100 to-beige-200 flex items-center justify-center">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={property.title || "Property Image"}
            fill
            className="object-cover card-image"
          />
        ) : (
          <Building2 className="w-12 h-12 text-gold-300" />
        )}
        
        {property.availability && (
          <div
            className={cn(
              "absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full shadow-sm",
              AVAILABILITY_COLORS[property.availability as keyof typeof AVAILABILITY_COLORS] || "bg-gray-100 text-gray-800"
            )}
          >
            {AVAILABILITY_LABELS[property.availability as keyof typeof AVAILABILITY_LABELS] || property.availability}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-lg text-brown-900 mb-2 line-clamp-1">
          {property.title}
        </h3>

        <div className="space-y-2 mb-4 text-sm text-brown-700 flex-grow">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gold-500 flex-shrink-0" />
            <span className="truncate">{property.colony}</span>
          </div>
          <div className="flex items-center">
            <Ruler className="w-4 h-4 mr-2 text-gold-500 flex-shrink-0" />
            <span>{property.area_gaj} Gaj</span>
          </div>
          {property.facing && (
            <div className="flex items-center">
              <Compass className="w-4 h-4 mr-2 text-gold-500 flex-shrink-0" />
              <span>{property.facing} Facing</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-beige-200 flex items-center justify-between">
          <div className="text-xl font-bold text-gold-600">
            {formatPrice(property.price)}
          </div>
          <div className="badge bg-beige-100 text-brown-800 border border-beige-200">
            {PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS] || property.property_type}
          </div>
        </div>
      </div>
    </div>
  );
}
