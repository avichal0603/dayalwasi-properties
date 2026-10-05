"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ImageGallery } from "@/components/properties/ImageGallery";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/lib/types";
import {
  formatPrice,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
  CONSTRUCTION_LABELS,
  PROPERTY_TYPE_LABELS,
  REGISTRY_LABELS,
  FACING_LABELS,
  formatPriceINR,
} from "@/lib/constants";
import { gajToSqft, calcPricePerGaj, generateShareText } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Ruler,
  Compass,
  Phone,
  Share2,
  Map,
  Home,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProperty, deleteProperty } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    async function load() {
      try {
        const data = await getProperty(id);
        setProperty(data);
      } catch (err) {
        toast.error("Failed to load property");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, getProperty]);

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

  const handleShare = () => {
    if (!property) return;
    const text = generateShareText(property);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container animate-pulse">
          <div className="h-8 bg-beige-200 rounded w-1/4 mb-6" />
          <div className="w-full aspect-[21/9] bg-beige-200 rounded-xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-beige-200 rounded-xl" />
              <div className="h-64 bg-beige-200 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-beige-200 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="page-container text-center py-20">
          <h2 className="text-2xl font-bold text-brown-900 mb-4">Property not found</h2>
          <Link href="/properties" className="btn-gold inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const sqft = gajToSqft(property.area_gaj);
  const pricePerGaj = calcPricePerGaj(property.price, property.area_gaj);

  return (
    <DashboardLayout>
      <div className="page-container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Link href="/properties" className="text-brown-500 hover:text-gold-600 flex items-center transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Properties
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="btn-outline flex items-center bg-white">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <Link href={`/properties/edit/${property.id}`} className="btn-outline flex items-center bg-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button onClick={handleDelete} disabled={isDeleting} className="btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center bg-white">
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${AVAILABILITY_COLORS[property.availability as keyof typeof AVAILABILITY_COLORS] || "bg-gray-100 text-gray-800"}`}>
              {AVAILABILITY_LABELS[property.availability as keyof typeof AVAILABILITY_LABELS] || property.availability}
            </span>
            <span className="badge bg-gold-100 text-gold-800 border-gold-200">
              {PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS] || property.property_type}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brown-900 mb-2">
            {property.title}
          </h1>
          <div className="flex items-center text-brown-600">
            <MapPin className="w-5 h-5 mr-2 text-gold-500" />
            <span className="text-lg">{property.colony}{property.city ? `, ${property.city}` : ''}</span>
          </div>
        </div>

        <div className="mb-8">
          <ImageGallery images={property.images || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <section className="glass-card p-6">
              <h2 className="section-title flex items-center mb-6">
                <Home className="w-5 h-5 mr-2 text-gold-500" />
                Property Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-brown-500 mb-1">Area</p>
                  <p className="font-semibold text-brown-900">{property.area_gaj} Gaj</p>
                  <p className="text-xs text-brown-400">{sqft.toFixed(2)} Sq Ft</p>
                </div>
                {property.bhk && (
                  <div>
                    <p className="text-sm text-brown-500 mb-1">BHK</p>
                    <p className="font-semibold text-brown-900">{property.bhk} BHK</p>
                  </div>
                )}
                {property.facing && (
                  <div>
                    <p className="text-sm text-brown-500 mb-1">Facing</p>
                    <p className="font-semibold text-brown-900">{FACING_LABELS[property.facing as keyof typeof FACING_LABELS] || property.facing}</p>
                  </div>
                )}
                {property.construction_status && (
                  <div>
                    <p className="text-sm text-brown-500 mb-1">Status</p>
                    <p className="font-semibold text-brown-900">{CONSTRUCTION_LABELS[property.construction_status as keyof typeof CONSTRUCTION_LABELS] || property.construction_status}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Detailed Dimensions & Features */}
            <section className="glass-card p-6">
              <h2 className="section-title flex items-center mb-6">
                <Ruler className="w-5 h-5 mr-2 text-gold-500" />
                Dimensions & Features
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div className="flex justify-between border-b border-beige-200 pb-2">
                  <span className="text-brown-500">Dimensions</span>
                  <span className="font-medium text-brown-900">
                    {property.plot_length && property.plot_breadth 
                      ? `${property.plot_length} x ${property.plot_breadth} ft` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-beige-200 pb-2">
                  <span className="text-brown-500">Road Width</span>
                  <span className="font-medium text-brown-900">{property.road_width ? `${property.road_width} ft` : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-beige-200 pb-2">
                  <span className="text-brown-500">Floors</span>
                  <span className="font-medium text-brown-900">{property.floors || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-beige-200 pb-2">
                  <span className="text-brown-500">Bathrooms</span>
                  <span className="font-medium text-brown-900">{property.bathrooms || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-beige-200 pb-2">
                  <span className="text-brown-500">Corner Plot</span>
                  <span className="font-medium text-brown-900">{property.corner_plot ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between border-b border-beige-200 pb-2">
                  <span className="text-brown-500">Parking</span>
                  <span className="font-medium text-brown-900">
                    {property.parking ? (property.parking_type === 'covered' ? 'Covered' : 'Open') : 'No'}
                  </span>
                </div>
              </div>
            </section>

            {/* Notes Section */}
            {property.notes && (
              <section className="glass-card p-6">
                <h2 className="section-title flex items-center mb-4">
                  <Info className="w-5 h-5 mr-2 text-gold-500" />
                  Additional Notes
                </h2>
                <div className="whitespace-pre-wrap text-brown-700 bg-beige-50 p-4 rounded-lg border border-beige-200">
                  {property.notes}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {/* Financial Section */}
            <section className="glass-card p-6 border-2 border-gold-200 bg-gradient-to-b from-white to-beige-50">
              <h2 className="text-lg font-display font-bold text-brown-900 mb-6 border-b border-gold-100 pb-4">Financial Details</h2>
              <div className="mb-6">
                <div className="text-3xl font-bold text-gold-600 mb-1">
                  {formatPrice(property.price)}
                </div>
                <div className="text-sm text-brown-500 flex justify-between">
                  <span>{formatPriceINR(property.price)}</span>
                  <span>₹{formatPriceINR(pricePerGaj)} / Gaj</span>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gold-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-brown-600">Registry Status</span>
                  <span className="font-medium text-brown-900">{REGISTRY_LABELS[property.registry_status as keyof typeof REGISTRY_LABELS] || property.registry_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-600">Loan Available</span>
                  <span className="font-medium text-brown-900">{property.loan_available ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </section>

            {/* Owner Details */}
            {(property.owner_name || property.owner_contact) && (
              <section className="glass-card p-6">
                <h2 className="text-lg font-display font-bold text-brown-900 mb-4">Owner Details</h2>
                <div className="space-y-4">
                  {property.owner_name && (
                    <div>
                      <p className="text-xs text-brown-500 uppercase tracking-wider mb-1">Name</p>
                      <p className="font-medium text-brown-900">{property.owner_name}</p>
                    </div>
                  )}
                  {property.owner_contact && (
                    <div>
                      <p className="text-xs text-brown-500 uppercase tracking-wider mb-1">Contact</p>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-brown-900">{property.owner_contact}</p>
                        <a href={`tel:${property.owner_contact}`} className="p-2 bg-beige-100 rounded-full text-gold-600 hover:bg-beige-200 transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Location Details */}
            <section className="glass-card p-6">
              <h2 className="text-lg font-display font-bold text-brown-900 mb-4">Location</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-brown-500">Colony</span>
                  <span className="font-medium text-brown-900">{property.colony}</span>
                </div>
                {property.address && (
                  <div className="flex justify-between text-right">
                    <span className="text-brown-500 mr-4">Address</span>
                    <span className="font-medium text-brown-900">{property.address}</span>
                  </div>
                )}
                {property.city && (
                  <div className="flex justify-between">
                    <span className="text-brown-500">City</span>
                    <span className="font-medium text-brown-900">{property.city}</span>
                  </div>
                )}
              </div>

              {(property.latitude && property.longitude) ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full flex items-center justify-center bg-white"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Get Directions
                </a>
              ) : (
                <div className="p-4 bg-beige-50 rounded-lg text-center text-brown-500 text-sm border border-beige-200">
                  <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  Exact map location not provided
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
