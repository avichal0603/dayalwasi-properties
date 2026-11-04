"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/types";
import {
  Building2,
  MapPin,
  FolderOpen,
  ArrowRight,
  Share2,
} from "lucide-react";
import {
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
  PROPERTY_TYPE_LABELS,
  FACING_LABELS,
  formatPrice,
  formatArea,
} from "@/lib/constants";
import { calcPricePerGaj, generateShareText, cn } from "@/lib/utils";

interface PropertyTableProps {
  properties: Property[];
  onRowClick: (propertyId: string) => void;
}

export function PropertyTable({ properties, onRowClick }: PropertyTableProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleShare = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    const text = generateShareText(property);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="w-full space-y-3">
      {/* Desktop / Tablet Table View (Hidden on small mobile) */}
      <div className="hidden md:block glass-card overflow-hidden border border-gold-200/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-beige-200/80 bg-beige-100/60 text-[11px] font-bold text-brown-600 uppercase tracking-wider">
                <th scope="col" className="py-3.5 px-4">Property</th>
                <th scope="col" className="py-3.5 px-4">Colony</th>
                <th scope="col" className="py-3.5 px-4">Type & Facing</th>
                <th scope="col" className="py-3.5 px-4">Status</th>
                <th scope="col" className="py-3.5 px-4">Area</th>
                <th scope="col" className="py-3.5 px-4">Price</th>
                <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200/70 text-sm">
              {properties.map((property) => {
                const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;
                const hasImgError = imgErrors[property.id];
                const ppg = property.price_per_gaj || calcPricePerGaj(property.price, property.area_gaj);

                return (
                  <tr
                    key={property.id}
                    onClick={() => onRowClick(property.id)}
                    className="hover:bg-gold-50/50 transition-colors cursor-pointer group"
                  >
                    {/* Property Thumbnail & Title */}
                    <td className="py-3 px-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-beige-100 border border-beige-200 flex items-center justify-center">
                          {firstImage && !hasImgError ? (
                            <Image
                              src={firstImage}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={() =>
                                setImgErrors((prev) => ({ ...prev, [property.id]: true }))
                              }
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-gold-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-brown-900 group-hover:text-gold-700 transition-colors truncate">
                            {property.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {property.bhk && (
                              <span className="text-xs text-brown-500 font-medium">{property.bhk} BHK</span>
                            )}
                            {property.drive_url && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gold-700 bg-gold-50 border border-gold-300 px-1.5 py-0.2 rounded">
                                <FolderOpen className="w-2.5 h-2.5" />
                                Drive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Colony */}
                    <td className="py-3 px-4 text-brown-700 min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <span className="truncate">{property.colony}</span>
                      </div>
                    </td>

                    {/* Type & Facing */}
                    <td className="py-3 px-4 text-brown-700 min-w-[140px]">
                      <span className="badge bg-beige-100 text-brown-800 border border-beige-300 text-[11px] font-medium mr-1.5">
                        {PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS] || property.property_type}
                      </span>
                      {property.facing && (
                        <span className="text-xs text-brown-500 capitalize">
                          {FACING_LABELS[property.facing as keyof typeof FACING_LABELS] || property.facing}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 min-w-[110px]">
                      <span
                        className={cn(
                          "inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shadow-2xs",
                          property.availability === "available"
                            ? "bg-olive-100 text-olive-800 border-olive-300"
                            : AVAILABILITY_COLORS[property.availability as keyof typeof AVAILABILITY_COLORS] ||
                                "bg-beige-100 text-brown-800 border-beige-300"
                        )}
                      >
                        {AVAILABILITY_LABELS[property.availability as keyof typeof AVAILABILITY_LABELS] || property.availability}
                      </span>
                    </td>

                    {/* Area */}
                    <td className="py-3 px-4 min-w-[150px]">
                      <span className="text-sm font-semibold text-brown-900 block">
                        {property.area_gaj} Gaj
                      </span>
                      <span className="text-xs text-brown-500">
                        {property.area_sqft ? `${property.area_sqft.toLocaleString('en-IN')} sq ft` : `${(property.area_gaj * 9).toLocaleString('en-IN')} sq ft`}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 min-w-[140px]">
                      <span className="font-display font-bold text-base text-gold-700 block">
                        {formatPrice(property.price)}
                      </span>
                      {ppg > 0 && (
                        <span className="text-[11px] text-brown-500">
                          ₹{ppg.toLocaleString("en-IN")}/Gaj
                        </span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 text-right min-w-[100px]">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleShare(e, property)}
                          className="p-1.5 rounded-lg text-brown-500 hover:text-gold-700 hover:bg-gold-100 transition-colors"
                          title="Share via WhatsApp"
                          aria-label="Share property on WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/properties/${property.id}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-brown-700 hover:text-gold-800 hover:bg-gold-100 transition-colors"
                          title="View Details"
                          aria-label="View property details"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Compact List View (Clean horizontal rows with min 48px tap targets) */}
      <div className="block md:hidden space-y-2.5">
        {properties.map((property) => {
          const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;
          const hasImgError = imgErrors[property.id];

          return (
            <div
              key={property.id}
              onClick={() => onRowClick(property.id)}
              className="glass-card p-3 flex items-center gap-3 active:scale-[0.99] transition-all cursor-pointer border border-gold-200/60 shadow-2xs"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-beige-100 border border-beige-200 flex items-center justify-center">
                {firstImage && !hasImgError ? (
                  <Image
                    src={firstImage}
                    alt={property.title}
                    fill
                    className="object-cover"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [property.id]: true }))
                    }
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-gold-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-semibold text-brown-900 text-sm truncate">
                    {property.title}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.2 text-[10px] font-semibold rounded-full border",
                      property.availability === "available"
                        ? "bg-olive-100 text-olive-800 border-olive-300"
                        : AVAILABILITY_COLORS[property.availability as keyof typeof AVAILABILITY_COLORS] ||
                            "bg-beige-100 text-brown-800 border-beige-300"
                    )}
                  >
                    {AVAILABILITY_LABELS[property.availability as keyof typeof AVAILABILITY_LABELS] || property.availability}
                  </span>
                </div>

                <div className="flex items-center text-xs text-brown-600 gap-2 mb-1">
                  <span className="truncate">{property.colony}</span>
                  <span>•</span>
                  <span>{formatArea(property.area_gaj, property.area_sqft)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-gold-700">
                    {formatPrice(property.price)}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, property)}
                      className="p-1 rounded text-brown-500 hover:text-gold-700"
                      aria-label="Share property on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-gold-600" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}