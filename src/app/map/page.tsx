'use client';

import { useState, useMemo } from 'react';
import PropertyMap from '@/components/map/PropertyMap';
import { useProperties } from '@/hooks/useProperties';
import {
  DAYALBAGH_COLONIES,
  PROPERTY_TYPE_LABELS,
  AVAILABILITY_LABELS,
  AVAILABILITY_PIN_COLORS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '@/lib/constants';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Filter, X, ChevronDown, ChevronUp, Layers, Check } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Property, AvailabilityStatus } from '@/lib/types';

export default function MapPage() {
  const { properties, loading } = useProperties();

  const [colony, setColony] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [availability, setAvailability] = useState<string>('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  const filteredProperties = useMemo(() => {
    return properties.filter((p: Property) => {
      if (colony && p.colony !== colony) return false;
      if (propertyType && p.property_type !== propertyType) return false;
      if (availability && p.availability !== availability) return false;
      return true;
    });
  }, [properties, colony, propertyType, availability]);

  const activeFilterCount = (colony ? 1 : 0) + (propertyType ? 1 : 0) + (availability ? 1 : 0);

  const handleClearFilters = () => {
    setColony('');
    setPropertyType('');
    setAvailability('');
  };

  return (
    <DashboardLayout>
      <div className="relative w-full h-[calc(100dvh-64px)] flex overflow-hidden">
        {/* Desktop Sidebar (Left side, permanent) */}
        <aside className="hidden md:flex flex-col w-[280px] bg-white border-r border-beige-200/80 shrink-0 z-10 overflow-y-auto">
          <div className="p-5 border-b border-beige-200/80">
            <h2 className="font-display font-bold text-brown-900 flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-gold-600" />
              <span>Map Filters</span>
            </h2>
            <p className="text-xs text-brown-500 mt-1">
              Filter by colony, type, and availability
            </p>
          </div>

          <div className="p-5 space-y-4 flex-1">
            <div>
              <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1.5">
                Colony
              </label>
              <select
                className="select-field text-xs sm:text-sm py-2"
                value={colony}
                onChange={(e) => setColony(e.target.value)}
              >
                <option value="">All Colonies</option>
                {DAYALBAGH_COLONIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1.5">
                Property Type
              </label>
              <select
                className="select-field text-xs sm:text-sm py-2"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Types</option>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-brown-600 uppercase tracking-wider mb-1.5">
                Availability
              </label>
              <select
                className="select-field text-xs sm:text-sm py-2"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full btn-outline text-xs py-2 mt-2 flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}

            <div className="mt-6 pt-5 border-t border-beige-200 text-center">
              <span className="font-display font-bold text-gold-700 text-2xl block">
                {filteredProperties.length}
              </span>
              <span className="text-xs text-brown-500 font-medium">
                {filteredProperties.length === 1 ? 'Property on map' : 'Properties on map'}
              </span>
            </div>
          </div>
        </aside>

        {/* Map Canvas */}
        <main className="flex-1 relative h-full w-full z-0">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center bg-beige-50">
              <Spinner size="lg" label="Loading Dayalbagh map..." />
            </div>
          ) : (
            <PropertyMap
              properties={filteredProperties}
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              height="100%"
            />
          )}

          {/* Mobile Filter Button (Top Left floating pill) */}
          <div className="md:hidden absolute top-3 left-3 z-[400]">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-brown-200/80 text-xs font-semibold text-brown-900 flex items-center gap-2 hover:bg-white active:scale-95 transition-all"
              aria-label="Open Map Filters"
            >
              <Filter className="w-4 h-4 text-gold-600" />
              <span>Filters</span>
              {activeFilterCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-gold-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
                  {activeFilterCount}
                </span>
              ) : (
                <span className="text-[11px] text-brown-500">({filteredProperties.length})</span>
              )}
            </button>
          </div>

          {/* Collapsible Legend at Bottom-Left (Clear of zoom & attribution controls) */}
          <div className="absolute bottom-6 left-3 sm:left-5 z-[400]">
            {isLegendOpen ? (
              <div className="glass-card p-3 sm:p-3.5 rounded-2xl shadow-lg bg-white/95 backdrop-blur-md text-xs border border-gold-200/80 min-w-[160px] animate-scale-in">
                <div className="flex items-center justify-between gap-3 mb-2.5 pb-1.5 border-b border-beige-200/80">
                  <div className="flex items-center gap-1.5 font-bold text-brown-900">
                    <Layers className="w-3.5 h-3.5 text-gold-600" />
                    <span>Pin Legend</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLegendOpen(false)}
                    className="p-1 rounded-md text-brown-500 hover:text-brown-700 hover:bg-beige-100 transition-colors"
                    aria-label="Collapse map legend"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(['available', 'reserved', 'negotiation', 'sold'] as AvailabilityStatus[]).map(
                    (status) => (
                      <div key={status} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs border border-white"
                          style={{ backgroundColor: AVAILABILITY_PIN_COLORS[status] }}
                        />
                        <span className="text-brown-800 font-medium capitalize text-[11px]">
                          {AVAILABILITY_LABELS[status]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLegendOpen(true)}
                className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-brown-200/80 text-xs font-semibold text-brown-800 flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all"
                aria-label="Expand map legend"
              >
                <Layers className="w-3.5 h-3.5 text-gold-600" />
                <span>Legend</span>
                <ChevronUp className="w-3.5 h-3.5 text-brown-500" />
              </button>
            )}
          </div>
        </main>

        {/* Mobile Bottom Sheet for Filters */}
        {isFilterSheetOpen && (
          <div className="md:hidden fixed inset-0 z-[1000] flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-brown-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
              onClick={() => setIsFilterSheetOpen(false)}
            />

            {/* Sheet Content */}
            <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl p-5 border-t border-gold-300 max-h-[80vh] overflow-y-auto animate-slide-up-fade">
              <div className="w-12 h-1.5 bg-beige-300 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-5 pb-3 border-b border-beige-200">
                <div>
                  <h3 className="font-display font-bold text-brown-900 text-lg">
                    Map Filter Options
                  </h3>
                  <p className="text-xs text-brown-500 mt-0.5">
                    {filteredProperties.length}{' '}
                    {filteredProperties.length === 1 ? 'property matches' : 'properties match'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="p-1.5 rounded-full text-brown-500 hover:bg-beige-100 transition-colors"
                  aria-label="Close filters sheet"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">
                    Colony
                  </label>
                  <select
                    className="select-field text-sm py-2.5"
                    value={colony}
                    onChange={(e) => setColony(e.target.value)}
                  >
                    <option value="">All Colonies</option>
                    {DAYALBAGH_COLONIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">
                    Property Type
                  </label>
                  <select
                    className="select-field text-sm py-2.5"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">
                    Availability
                  </label>
                  <select
                    className="select-field text-sm py-2.5"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="btn-outline flex-1 py-3 text-sm font-semibold"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterSheetOpen(false)}
                    className="btn-gold flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}