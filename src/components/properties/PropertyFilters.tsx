"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
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
}

export function PropertyFilters({ filters, onFilterChange, colonies }: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof PropertyFiltersType, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some((val) => val !== undefined && val !== "");

  const allColonies = Array.from(new Set([...DAYALBAGH_COLONIES, ...colonies])).filter(Boolean).sort();

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, colony, or notes..."
            className="input-field pl-10"
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <button
          className="btn-outline flex items-center md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      <div className={`mt-4 ${isOpen ? "block" : "hidden"} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            className="select-field"
            value={filters.colony || ""}
            onChange={(e) => handleFilterChange("colony", e.target.value)}
          >
            <option value="">All Colonies</option>
            {allColonies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="select-field"
            value={filters.property_type || ""}
            onChange={(e) => handleFilterChange("property_type", e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            className="select-field"
            value={filters.facing || ""}
            onChange={(e) => handleFilterChange("facing", e.target.value)}
          >
            <option value="">All Facings</option>
            {Object.entries(FACING_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            className="select-field"
            value={filters.availability || ""}
            onChange={(e) => handleFilterChange("availability", e.target.value)}
          >
            <option value="">Any Availability</option>
            {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            className="select-field"
            value={filters.construction_status || ""}
            onChange={(e) => handleFilterChange("construction_status", e.target.value)}
          >
            <option value="">Any Construction Status</option>
            {Object.entries(CONSTRUCTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            className="select-field"
            value={filters.sort_by || ""}
            onChange={(e) => handleFilterChange("sort_by", e.target.value)}
          >
            <option value="">Sort By</option>
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-brown-500 hover:text-brown-700 text-sm font-medium flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
