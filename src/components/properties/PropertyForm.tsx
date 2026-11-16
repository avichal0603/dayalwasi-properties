"use client";

import { useState } from "react";
import { PropertyFormData } from "@/lib/types";
import {
  DAYALBAGH_COLONIES,
  PROPERTY_TYPE_LABELS,
  FACING_LABELS,
  AVAILABILITY_LABELS,
  CONSTRUCTION_LABELS,
  REGISTRY_LABELS,
  BHK_OPTIONS,
  DEFAULT_CITY,
  formatPriceINR,
  formatPriceInWords,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  GOOGLE_DRIVE_FOLDER_URL
} from "@/lib/constants";
import { gajToSqft, calcPricePerGaj } from "@/lib/utils";
import PropertyMap from "../map/PropertyMap";
import { FolderOpen } from "lucide-react";

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean;
}

const Label = ({
  children,
  required,
  badge,
}: {
  children: React.ReactNode;
  required?: boolean;
  badge?: string;
}) => (
  <label className="flex items-center justify-between block text-sm font-medium text-brown-700 mb-1">
    <span>
      {children} {required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
    {badge ? (
      <span className="text-[10px] text-gold-800 font-medium bg-gold-100 border border-gold-300 px-1.5 py-0.5 rounded">
        {badge}
      </span>
    ) : required ? (
      <span className="text-[10px] text-red-500/70 font-normal">Required</span>
    ) : (
      <span className="text-[10px] text-brown-500 font-normal">(Optional)</span>
    )}
  </label>
);

export function PropertyForm({ initialData, onSubmit, isLoading }: PropertyFormProps) {
  const [formData, setFormData] = useState<Partial<PropertyFormData>>({
    title: "",
    property_type: "house",
    colony: "",
    address: "",
    city: DEFAULT_CITY,
    area_gaj: 0,
    area_sqft: 0,
    price: 0,
    facing: undefined,
    availability: "available",
    construction_status: "ready",
    registry_status: "unregistered",
    loan_available: false,
    corner_plot: false,
    parking: false,
    owner_name: "",
    owner_contact: "",
    drive_url: "",
    notes: "",
    ...initialData,
  });

  // Dual area state for synchronized Gaj and Square Feet inputs
  const [gajInput, setGajInput] = useState<string>(() => {
    if (initialData?.area_gaj) return String(initialData.area_gaj);
    return "";
  });
  const [sqftInput, setSqftInput] = useState<string>(() => {
    if (initialData?.area_sqft) return String(initialData.area_sqft);
    if (initialData?.area_gaj) return String(Math.round(initialData.area_gaj * 9 * 100) / 100);
    return "";
  });

  const handleGajChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGajInput(val);
    if (val === "" || isNaN(Number(val))) {
      setSqftInput("");
      setFormData((prev) => ({ ...prev, area_gaj: 0, area_sqft: 0 }));
    } else {
      const g = parseFloat(val);
      const s = Math.round(g * 9 * 100) / 100;
      setSqftInput(String(s));
      setFormData((prev) => ({ ...prev, area_gaj: g, area_sqft: s }));
    }
  };

  const handleSqftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSqftInput(val);
    if (val === "" || isNaN(Number(val))) {
      setGajInput("");
      setFormData((prev) => ({ ...prev, area_gaj: 0, area_sqft: 0 }));
    } else {
      const s = parseFloat(val);
      const g = Math.round((s / 9) * 100) / 100;
      setGajInput(String(g));
      setFormData((prev) => ({ ...prev, area_gaj: g, area_sqft: s }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      finalValue = value ? Number(value) : undefined;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalGaj = parseFloat(gajInput) || formData.area_gaj || 0;
    const finalSqft = parseFloat(sqftInput) || (finalGaj ? Math.round(finalGaj * 9 * 100) / 100 : 0);

    if (!finalGaj || finalGaj <= 0) {
      alert("Please enter property area in either Gaj or Square Feet.");
      return;
    }

    onSubmit({
      ...formData,
      area_gaj: finalGaj,
      area_sqft: finalSqft,
    } as PropertyFormData);
  };

  const currentGaj = parseFloat(gajInput) || formData.area_gaj || 0;
  const currentSqft = parseFloat(sqftInput) || (currentGaj ? gajToSqft(currentGaj) : 0);
  const pricePerGaj = formData.price && currentGaj ? calcPricePerGaj(formData.price, currentGaj) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 page-enter pb-32">
      {/* Section 1: Basic Info */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade">
        <h2 className="section-title">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="md:col-span-2">
            <Label required>Title</Label>
            <input
              required
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Beautiful 3BHK House in Dayalbagh"
            />
          </div>
          <div>
            <Label required>Property Type</Label>
            <select required name="property_type" value={formData.property_type || ""} onChange={handleChange} className="select-field">
              {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <Label required>Colony</Label>
            <input
              required
              type="text"
              name="colony"
              list="colony-list"
              value={formData.colony || ""}
              onChange={handleChange}
              className="input-field"
              placeholder="Start typing colony name..."
              autoComplete="off"
            />
            <datalist id="colony-list">
              {DAYALBAGH_COLONIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <input type="text" name="address" value={formData.address || ""} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <Label>City</Label>
            <input type="text" name="city" value={formData.city || ""} onChange={handleChange} className="input-field" />
          </div>
        </div>
      </div>

      {/* Section 2: Owner Details - Now completely optional */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "100ms" }}>
        <h2 className="section-title">Owner Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label>Owner Name</Label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name || ""}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Ramesh Kumar"
            />
          </div>
          <div>
            <Label>Contact Number</Label>
            <input
              type="text"
              name="owner_contact"
              value={formData.owner_contact || ""}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. +91 98765 43210"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Measurements & Layout - Dual Area in Gaj & Sq Ft */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "200ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <h2 className="section-title mb-0">Measurements & Layout</h2>
          <span className="text-xs text-gold-800 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-md font-medium self-start sm:self-auto">
            1 Gaj = 9 Sq Ft (Auto-converts)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <Label badge="Either is mandatory">Area in Gaj (गज)</Label>
            <div className="relative">
              <input
                type="number"
                name="area_gaj"
                value={gajInput}
                onChange={handleGajChange}
                className="input-field pr-12"
                min={0}
                step="0.01"
                placeholder="e.g. 100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brown-500 pointer-events-none">
                Gaj
              </span>
            </div>
            {parseFloat(sqftInput) > 0 && (
              <p className="text-[11px] text-brown-500 mt-1">
                ≈ {parseFloat(sqftInput).toLocaleString('en-IN')} Sq Ft
              </p>
            )}
          </div>
          <div>
            <Label badge="Either is mandatory">Area in Sq. Ft. (स्क्वायर फीट)</Label>
            <div className="relative">
              <input
                type="number"
                name="area_sqft"
                value={sqftInput}
                onChange={handleSqftChange}
                className="input-field pr-14"
                min={0}
                step="0.01"
                placeholder="e.g. 900"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brown-500 pointer-events-none">
                Sq Ft
              </span>
            </div>
            {parseFloat(gajInput) > 0 && (
              <p className="text-[11px] text-brown-500 mt-1">
                ≈ {parseFloat(gajInput).toLocaleString('en-IN')} Gaj
              </p>
            )}
          </div>
          <div>
            <Label>BHK</Label>
            <select name="bhk" value={formData.bhk || ""} onChange={handleChange} className="select-field">
              <option value="">Select BHK</option>
              {BHK_OPTIONS.map((o) => <option key={o} value={o}>{o} BHK</option>)}
            </select>
          </div>
          <div>
            <Label>Plot Length (ft)</Label>
            <input type="number" name="plot_length" value={formData.plot_length || ""} onChange={handleChange} className="input-field" min={0} step="0.01" />
          </div>
          <div>
            <Label>Plot Breadth (ft)</Label>
            <input type="number" name="plot_breadth" value={formData.plot_breadth || ""} onChange={handleChange} className="input-field" min={0} step="0.01" />
          </div>
          <div>
            <Label>Floors</Label>
            <input type="number" name="floors" value={formData.floors || ""} onChange={handleChange} className="input-field" min={0} />
          </div>
          <div>
            <Label>Bathrooms</Label>
            <input type="number" name="bathrooms" value={formData.bathrooms || ""} onChange={handleChange} className="input-field" min={0} />
          </div>
        </div>
      </div>

      {/* Section 4: Direction & Position */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "300ms" }}>
        <h2 className="section-title">Direction & Position</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label required>Facing</Label>
            <select required name="facing" value={formData.facing || ""} onChange={handleChange} className="select-field">
              <option value="">Select Facing</option>
              {Object.entries(FACING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <Label>Road Width (ft)</Label>
            <input type="number" name="road_width" value={formData.road_width || ""} onChange={handleChange} className="input-field" min={0} />
          </div>
          <div className="flex items-center space-x-2 h-full pt-6">
            <input type="checkbox" name="corner_plot" checked={formData.corner_plot || false} onChange={handleChange} className="w-4 h-4 text-gold-600 rounded border-beige-300" id="corner_plot" />
            <label htmlFor="corner_plot" className="text-sm font-medium text-brown-700 cursor-pointer">Corner Plot</label>
          </div>
          <div className="flex items-center space-x-2 h-full pt-6">
            <input type="checkbox" name="parking" checked={formData.parking || false} onChange={handleChange} className="w-4 h-4 text-gold-600 rounded border-beige-300" id="parking" />
            <label htmlFor="parking" className="text-sm font-medium text-brown-700 cursor-pointer">Parking Available</label>
          </div>
          {formData.parking && (
            <div className="md:col-span-2">
              <Label>Parking Type</Label>
              <select name="parking_type" value={formData.parking_type || ""} onChange={handleChange} className="select-field md:w-1/2">
                <option value="">Select Type</option>
                <option value="covered">Covered</option>
                <option value="open">Open</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Financial */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "400ms" }}>
        <h2 className="section-title">Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label required>Price (₹)</Label>
            <input
              required
              type="number"
              name="price"
              value={formData.price || ""}
              onChange={handleChange}
              className="input-field"
              min={0}
              placeholder="e.g. 7550000"
            />
            {formData.price && formData.price > 0 ? (
              <div className="mt-2 p-2.5 rounded-lg bg-gold-50/90 border border-gold-200 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-brown-950">
                    {formatPriceINR(formData.price)}
                  </span>
                  {formatPriceInWords(formData.price) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-gold-900 border border-gold-300 shadow-xs">
                      {formatPriceInWords(formData.price)}
                    </span>
                  )}
                </div>
                {pricePerGaj > 0 && (
                  <p className="text-xs text-brown-600 font-medium">
                    {formatPriceINR(pricePerGaj)} / Gaj
                    {currentSqft > 0 && ` • ₹${Math.round(formData.price / currentSqft).toLocaleString('en-IN')} / Sq Ft`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-brown-400 mt-1">
                e.g. 7550000 (75 Lakh 50 Thousand)
              </p>
            )}
          </div>
          <div>
            <Label>Registry Status</Label>
            <select name="registry_status" value={formData.registry_status || ""} onChange={handleChange} className="select-field">
              {Object.entries(REGISTRY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2 h-full pt-6 md:col-span-2">
            <input type="checkbox" name="loan_available" checked={formData.loan_available || false} onChange={handleChange} className="w-4 h-4 text-gold-600 rounded border-beige-300" id="loan_available" />
            <label htmlFor="loan_available" className="text-sm font-medium text-brown-700 cursor-pointer">Loan Available</label>
          </div>
        </div>
      </div>

      {/* Section 6: Status */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "500ms" }}>
        <h2 className="section-title">Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label>Availability</Label>
            <select name="availability" value={formData.availability || ""} onChange={handleChange} className="select-field">
              {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <Label>Construction Status</Label>
            <select name="construction_status" value={formData.construction_status || ""} onChange={handleChange} className="select-field">
              {Object.entries(CONSTRUCTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section 7: Location */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "600ms" }}>
        <h2 className="section-title">Map Location</h2>
        <p className="text-sm text-brown-500 mb-4 bg-beige-50 p-2 rounded border border-beige-200">
          <strong>Tip:</strong> Click anywhere on the map to set the exact coordinates, or right-click on Google Maps to get them manually.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>Latitude</Label>
            <input type="number" name="latitude" value={formData.latitude || ""} onChange={handleChange} className="input-field" step="any" />
          </div>
          <div>
            <Label>Longitude</Label>
            <input type="number" name="longitude" value={formData.longitude || ""} onChange={handleChange} className="input-field" step="any" />
          </div>
        </div>
        <div className="w-full h-[300px] rounded-xl overflow-hidden border border-beige-300">
          <PropertyMap
            properties={[]}
            center={
              formData.latitude && formData.longitude 
                ? { lat: formData.latitude, lng: formData.longitude } 
                : DEFAULT_CENTER
            }
            zoom={formData.latitude ? 16 : DEFAULT_ZOOM}
            height="100%"
            onMapClick={(latlng) => {
              setFormData((prev) => ({
                ...prev,
                latitude: Number(latlng.lat.toFixed(6)),
                longitude: Number(latlng.lng.toFixed(6))
              }));
            }}
          />
        </div>
      </div>

      {/* Section 8: Google Drive Media */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "650ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h2 className="section-title mb-0">Google Drive Archive (HD Videos & Photos)</h2>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, drive_url: GOOGLE_DRIVE_FOLDER_URL }));
              window.open(GOOGLE_DRIVE_FOLDER_URL, "_blank", "noopener,noreferrer");
            }}
            className="text-xs font-semibold text-gold-700 hover:text-gold-900 bg-gold-50 hover:bg-gold-100 border border-gold-300 rounded-lg px-2.5 py-1.5 transition-colors self-start sm:self-auto flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-gold-600" />
            <span>Use Dayalwasi Main Drive Folder</span>
            <span className="text-[10px] text-gold-500 font-normal">↗</span>
          </button>
        </div>
        <p className="text-xs text-brown-500 mb-4">
          Save heavy 4K walk-through videos and complete 50+ RAW photo albums in Google Drive. Dayalwasi keeps fast compressed previews in Supabase so everything is instant, and links to your Drive for high-res files!
        </p>
        <div>
          <Label>Drive Folder or Video URL</Label>
          <div className="relative flex items-center">
            <input
              type="url"
              name="drive_url"
              value={formData.drive_url || ""}
              onChange={handleChange}
              className="input-field pl-10 pr-24"
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <FolderOpen className="w-4 h-4 text-brown-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {formData.drive_url && (
              <a
                href={formData.drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2 px-2.5 py-1 text-xs font-medium text-gold-800 bg-gold-100 hover:bg-gold-200 border border-gold-300 rounded-md transition-colors flex items-center gap-1"
              >
                Open ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Section 9: Notes */}
      <div className="glass-card p-4 sm:p-6 min-w-0 slide-up-fade" style={{ animationDelay: "700ms" }}>
        <h2 className="section-title">Additional Notes</h2>
        <div className="mt-4">
          <Label>Notes</Label>
          <textarea name="notes" value={formData.notes || ""} onChange={handleChange} className="input-field min-h-[120px] resize-y" placeholder="Any extra information about the property..."></textarea>
        </div>
      </div>

      <div className="flex justify-end pt-4 slide-up-fade" style={{ animationDelay: "800ms" }}>
        <button type="submit" disabled={isLoading} className="btn-gold px-8 py-3 w-full md:w-auto font-semibold">
          {isLoading ? "Saving..." : "Save Property"}
        </button>
      </div>
    </form>
  );
}
