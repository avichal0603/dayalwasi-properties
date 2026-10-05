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
  DEFAULT_CENTER,
  DEFAULT_ZOOM
} from "@/lib/constants";
import { gajToSqft, calcPricePerGaj } from "@/lib/utils";
import PropertyMap from "../map/PropertyMap";

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean;
}

const Label = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label className="flex items-center justify-between block text-sm font-medium text-brown-700 mb-1">
    <span>
      {children} {required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
    {required ? (
      <span className="text-[10px] text-red-500/70 font-normal">Required</span>
    ) : (
      <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
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
    price: 0,
    facing: "",
    availability: "available",
    construction_status: "ready",
    registry_status: "unregistered",
    loan_available: false,
    corner_plot: false,
    parking: false,
    owner_name: "",
    owner_contact: "",
    notes: "",
    ...initialData,
  });

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
    onSubmit(formData as PropertyFormData);
  };

  const sqft = formData.area_gaj ? gajToSqft(formData.area_gaj) : 0;
  const pricePerGaj = formData.price && formData.area_gaj ? calcPricePerGaj(formData.price, formData.area_gaj) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 page-enter">
      {/* Section 1: Basic Info */}
      <div className="glass-card p-6 slide-up-fade">
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

      {/* Section 2: Owner Details - Moved up for prominence */}
      <div className="glass-card p-6 slide-up-fade" style={{ animationDelay: "100ms" }}>
        <h2 className="section-title">Owner Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label required>Owner Name</Label>
            <input required type="text" name="owner_name" value={formData.owner_name || ""} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <Label required>Contact Number</Label>
            <input required type="text" name="owner_contact" value={formData.owner_contact || ""} onChange={handleChange} className="input-field" />
          </div>
        </div>
      </div>

      {/* Section 3: Measurements */}
      <div className="glass-card p-6 slide-up-fade" style={{ animationDelay: "200ms" }}>
        <h2 className="section-title">Measurements & Layout</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <Label required>Area (Gaj)</Label>
            <input required type="number" name="area_gaj" value={formData.area_gaj || ""} onChange={handleChange} className="input-field" min={0} step="0.01" />
            {sqft > 0 && <p className="text-xs text-brown-500 mt-1">≈ {sqft.toFixed(2)} Sq Ft</p>}
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
            <Label>BHK</Label>
            <select name="bhk" value={formData.bhk || ""} onChange={handleChange} className="select-field">
              <option value="">Select BHK</option>
              {BHK_OPTIONS.map((o) => <option key={o} value={o}>{o} BHK</option>)}
            </select>
          </div>
          <div>
            <Label>Bathrooms</Label>
            <input type="number" name="bathrooms" value={formData.bathrooms || ""} onChange={handleChange} className="input-field" min={0} />
          </div>
        </div>
      </div>

      {/* Section 4: Direction & Position */}
      <div className="glass-card p-6 slide-up-fade" style={{ animationDelay: "300ms" }}>
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
            <input type="checkbox" name="corner_plot" checked={formData.corner_plot || false} onChange={handleChange} className="w-4 h-4 text-gold-600 rounded border-gray-300" id="corner_plot" />
            <label htmlFor="corner_plot" className="text-sm font-medium text-brown-700 cursor-pointer">Corner Plot</label>
          </div>
          <div className="flex items-center space-x-2 h-full pt-6">
            <input type="checkbox" name="parking" checked={formData.parking || false} onChange={handleChange} className="w-4 h-4 text-gold-600 rounded border-gray-300" id="parking" />
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
      <div className="glass-card p-6 slide-up-fade" style={{ animationDelay: "400ms" }}>
        <h2 className="section-title">Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label required>Price (₹)</Label>
            <input required type="number" name="price" value={formData.price || ""} onChange={handleChange} className="input-field" min={0} />
            {formData.price ? (
              <p className="text-xs text-brown-500 mt-1">
                {formatPriceINR(formData.price)} 
                {pricePerGaj > 0 && ` (₹${formatPriceINR(pricePerGaj)} / Gaj)`}
              </p>
            ) : null}
          </div>
          <div>
            <Label>Registry Status</Label>
            <select name="registry_status" value={formData.registry_status || ""} onChange={handleChange} className="select-field">
              {Object.entries(REGISTRY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2 h-full pt-6 md:col-span-2">
            <input type="checkbox" name="loan_available" checked={formData.loan_available || false} onChange={handleChange} className="w-4 h-4 text-gold-600 rounded border-gray-300" id="loan_available" />
            <label htmlFor="loan_available" className="text-sm font-medium text-brown-700 cursor-pointer">Loan Available</label>
          </div>
        </div>
      </div>

      {/* Section 6: Status */}
      <div className="glass-card p-6 slide-up-fade" style={{ animationDelay: "500ms" }}>
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
      <div className="glass-card p-6 slide-up-fade" style={{ animationDelay: "600ms" }}>
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

      {/* Section 8: Notes */}
      <div className="glass-card p-6 slide-up-fade" style={{ animationDelay: "700ms" }}>
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
