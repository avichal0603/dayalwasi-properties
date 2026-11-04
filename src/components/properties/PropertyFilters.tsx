"use client";

import { useState } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { PropertyFilters as PropertyFiltersType } from "@/lib/types";
import {
  DAYALBAGH_COLONIES,
  PROPERTY_TYPE_LABELS,
  FACING_LABELS,
  AVAILABILITY_LABELS,
  CONSTRUCTION_LABELS,
  SORT_LABELS,
} from "@/lib/constants";

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onFilterChange: (filters: PropertyFiltersType) => void;
  colonies: string[];
  needsAttention?: boolean;
  onClearNeedsAttention?: () => void;
}

const PRICE_RANGES = [
  { id: 'all', label: 'Any Price', min: undefined, max: undefined },
  { id: 'under-50l', label: 'Under ₹50 Lakh', min: 0, max: 5000000 },
  { id: '50l-1cr', label: '₹50 Lakh – ₹1 Crore', min: 5000000, max: 10000000 },
  { id: '1cr-2cr', label: '₹1 Crore – ₹2 Crore', min: 10000000, max: 20000000 },
  { id: '2cr-5cr', label: '₹2 Crore – ₹5 Crore', min: 20000000, max: 50000000 },
  { id: 'above-5cr', label: 'Above ₹5 Crore', min: 50000000, max: undefined },
];

const AREA_RANGES = [
  { id: 'all', label: 'Any Area', min: undefined, max: undefined },
  { id: 'under-100', label: 'Under 100 Gaj', min: 0, max: 100 },
  { id: '100-200', label: '100 – 200 Gaj', min: 100, max: 200 },
  { id: '200-300', label: '200 – 300 Gaj', min: 200, max: 300 },
  { id: '300-500', label: '300 – 500 Gaj', min: 300, max: 500 },
  { id: 'above-500', label: 'Above 500 Gaj', min: 500, max: undefined },
];

export function PropertyFilters({
  filters,
  onFilterChange,
  colonies,
  needsAttention,
  onClearNeedsAttention,
}: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof PropertyFiltersType, value: any) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const handlePriceRangeChange = (rangeId: string) => {
    const range = PRICE_RANGES.find((r) => r.id === rangeId);
    if (!range || rangeId === 'all') {
      const next = { ...filters };
      delete next.min_price;
      delete next.max_price;
      onFilterChange(next);
    } else {
      onFilterChange({
        ...filters,
        min_price: range.min,
        max_price: range.max,
      });
    }
  };

  const handleAreaRangeChange = (rangeId: string) => {
    const range = AREA_RANGES.find((r) => r.id === rangeId);
    if (!range || rangeId === 'all') {
      const next = { ...filters };
      delete next.min_area;
      delete next.max_area;
      onFilterChange(next);
    } else {
      onFilterChange({
        ...filters,
        min_area: range.min,
        max_area: range.max,
      });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({});
    if (onClearNeedsAttention) onClearNeedsAttention();
  };

  // Identify selected price and area range IDs
  const currentPriceRangeId = (() => {
    if (filters.min_price === undefined && filters.max_price === undefined) return 'all';
    const match = PRICE_RANGES.find(
      (r) => r.min === filters.min_price && r.max === filters.max_price
    );
    return match ? match.id : 'custom';
  })();

  const currentAreaRangeId = (() => {
    if (filters.min_area === undefined && filters.max_area === undefined) return 'all';
    const match = AREA_RANGES.find(
      (r) => r.min === filters.min_area && r.max === filters.max_area
    );
    return match ? match.id : 'custom';
  })();

  const allColonies = Array.from(new Set([...DAYALBAGH_COLONIES, ...colonies])).filter(Boolean).sort();

  // Active filter chips construction
  interface ActiveChip {
    id: string;
    label: string;
    onRemove: () => void;
  }

  const chips: ActiveChip[] = [];

  if (needsAttention) {
    chips.push({
      id: 'needsAttention',
      label: 'Needs Attention',
      onRemove: () => {
        if (onClearNeedsAttention) onClearNeedsAttention();
      },
    });
  }

  if (filters.search) {
    chips.push({
      id: 'search',
      label: `"${filters.search}"`,
      onRemove: () => handleFilterChange('search', undefined),
    });
  }

  if (filters.colony) {
    chips.push({
      id: 'colony',
      label: `Colony: ${filters.colony}`,
      onRemove: () => handleFilterChange('colony', undefined),
    });
  }

  if (filters.property_type) {
    chips.push({
      id: 'property_type',
      label: `Type: ${PROPERTY_TYPE_LABELS[filters.property_type]}`,
      onRemove: () => handleFilterChange('property_type', undefined),
    });
  }

  if (filters.availability) {
    chips.push({
      id: 'availability',
      label: `Status: ${AVAILABILITY_LABELS[filters.availability]}`,
      onRemove: () => handleFilterChange('availability', undefined),
    });
  }

  if (filters.facing) {
    chips.push({
      id: 'facing',
      label: `Facing: ${FACING_LABELS[filters.facing]}`,
      onRemove: () => handleFilterChange('facing', undefined),
    });
  }

  if (filters.construction_status) {
    chips.push({
      id: 'construction_status',
      label: `Construction: ${CONSTRUCTION_LABELS[filters.construction_status]}`,
      onRemove: () => handleFilterChange('construction_status', undefined),
    });
  }

  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    const range = PRICE_RANGES.find(
      (r) => r.min === filters.min_price && r.max === filters.max_price
    );
    const label = range
      ? range.label
      : `₹${(filters.min_price || 0).toLocaleString('en-IN')} – ₹${(filters.max_price || 0).toLocaleString('en-IN')}`;
    chips.push({
      id: 'price',
      label: `Price: ${label}`,
      onRemove: () => {
        const next = { ...filters };
        delete next.min_price;
        delete next.max_price;
        onFilterChange(next);
      },
    });
  }

  if (filters.min_area !== undefined || filters.max_area !== undefined) {
    const range = AREA_RANGES.find(
      (r) => r.min === filters.min_area && r.max === filters.max_area
    );
    const label = range
      ? range.label
      : `${filters.min_area || 0} – ${filters.max_area || 0} Gaj`;
    chips.push({
      id: 'area',
      label: `Area: ${label}`,
      onRemove: () => {
        const next = { ...filters };
        delete next.min_area;
        delete next.max_area;
        onFilterChange(next);
      },
    });
  }

  if (filters.sort_by && filters.sort_by !== 'date_desc') {
    chips.push({
      id: 'sort_by',
      label: `Sort: ${SORT_LABELS[filters.sort_by]}`,
      onRemove: () => handleFilterChange('sort_by', undefined),
    });
  }

  const activeFilterCount = chips.length;

  return (
    <div className="glass-card p-4 sm:p-5 mb-6 border border-gold-200/60 shadow-sm">
      {/* Top Search & Toggle Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow min-w-0">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title, colony, owner, or notes..."
            className="input-field pl-10 pr-9 text-sm"
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => handleFilterChange("search", undefined)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-700 p-0.5 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-outline flex items-center md:hidden shrink-0 text-xs sm:text-sm py-2 px-3 relative"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle filter options"
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5 text-gold-600" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1.5 w-5 h-5 rounded-full bg-gold-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Controls Grid */}
      <div className={`mt-4 ${isOpen ? "block" : "hidden"} md:block`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Colony
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={filters.colony || ""}
              onChange={(e) => handleFilterChange("colony", e.target.value)}
            >
              <option value="">All Colonies</option>
              {allColonies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Property Type
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={filters.property_type || ""}
              onChange={(e) => handleFilterChange("property_type", e.target.value)}
            >
              <option value="">All Types</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Availability
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={filters.availability || ""}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
            >
              <option value="">Any Status</option>
              {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={filters.sort_by || "date_desc"}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
            >
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Budget Range
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={currentPriceRangeId}
              onChange={(e) => handlePriceRangeChange(e.target.value)}
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Plot / Land Area
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={currentAreaRangeId}
              onChange={(e) => handleAreaRangeChange(e.target.value)}
            >
              {AREA_RANGES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Facing Direction
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={filters.facing || ""}
              onChange={(e) => handleFilterChange("facing", e.target.value)}
            >
              <option value="">All Facings</option>
              {Object.entries(FACING_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1">
              Construction
            </label>
            <select
              className="select-field text-xs sm:text-sm"
              value={filters.construction_status || ""}
              onChange={(e) => handleFilterChange("construction_status", e.target.value)}
            >
              <option value="">Any Construction</option>
              {Object.entries(CONSTRUCTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-3.5 mt-3.5 border-t border-beige-200/90 animate-fade-in">
          <span className="text-[11px] font-bold text-brown-500 uppercase tracking-wider mr-1">
            Active filters:
          </span>
          {chips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold-50 text-brown-900 border border-gold-300 shadow-2xs hover:bg-gold-100 transition-colors"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:bg-gold-200/80 p-0.5 rounded-full text-brown-700 hover:text-brown-900 transition-colors"
                aria-label={`Remove filter ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-semibold text-gold-700 hover:text-gold-900 underline underline-offset-2 ml-auto py-1 px-2 rounded hover:bg-gold-50 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}