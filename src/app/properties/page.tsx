'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { PropertyFilters as FiltersComponent } from '@/components/properties/PropertyFilters';
import { useProperties } from '@/hooks/useProperties';
import { PropertyFilters, AvailabilityStatus, PropertyType, FacingDirection, ConstructionStatus, SortOption } from '@/lib/types';
import { filterProperties, getPropertyAttentionIssues, cn } from '@/lib/utils';
import { Plus, Building, LayoutGrid, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { properties, loading, getColonies } = useProperties();

  // Helper to parse searchParams into initial filter state
  const parseFiltersFromParams = useCallback(() => {
    const f: PropertyFilters = {};
    const search = searchParams.get('search');
    const colony = searchParams.get('colony');
    const propertyType = searchParams.get('property_type') || searchParams.get('type');
    const availability = searchParams.get('availability');
    const facing = searchParams.get('facing');
    const construction = searchParams.get('construction_status');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minArea = searchParams.get('min_area');
    const maxArea = searchParams.get('max_area');
    const sortBy = searchParams.get('sort_by');

    if (search) f.search = search;
    if (colony) f.colony = colony;
    if (propertyType) f.property_type = propertyType as PropertyType;
    if (availability) f.availability = availability as AvailabilityStatus;
    if (facing) f.facing = facing as FacingDirection;
    if (construction) f.construction_status = construction as ConstructionStatus;
    if (minPrice && !isNaN(Number(minPrice))) f.min_price = Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice))) f.max_price = Number(maxPrice);
    if (minArea && !isNaN(Number(minArea))) f.min_area = Number(minArea);
    if (maxArea && !isNaN(Number(maxArea))) f.max_area = Number(maxArea);
    if (sortBy) f.sort_by = sortBy as SortOption;

    return f;
  }, [searchParams]);

  const [filters, setFilters] = useState<PropertyFilters>(parseFiltersFromParams);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return searchParams.get('view') === 'table' ? 'table' : 'grid';
  });
  const [needsAttention, setNeedsAttention] = useState<boolean>(() => {
    return searchParams.get('needsAttention') === 'true';
  });

  // Sync state when URL search params change externally (e.g. browser back/forward or navigation links)
  useEffect(() => {
    setFilters(parseFiltersFromParams());
    setViewMode(searchParams.get('view') === 'table' ? 'table' : 'grid');
    setNeedsAttention(searchParams.get('needsAttention') === 'true');
  }, [searchParams, parseFiltersFromParams]);

  // Push filter / view changes to URL search params (with scroll: false)
  const syncUrl = (
    nextFilters: PropertyFilters,
    nextViewMode: 'grid' | 'table',
    nextNeedsAttention: boolean
  ) => {
    const params = new URLSearchParams();
    if (nextFilters.search) params.set('search', nextFilters.search);
    if (nextFilters.colony) params.set('colony', nextFilters.colony);
    if (nextFilters.property_type) params.set('property_type', nextFilters.property_type);
    if (nextFilters.availability) params.set('availability', nextFilters.availability);
    if (nextFilters.facing) params.set('facing', nextFilters.facing);
    if (nextFilters.construction_status) params.set('construction_status', nextFilters.construction_status);
    if (nextFilters.min_price !== undefined) params.set('min_price', nextFilters.min_price.toString());
    if (nextFilters.max_price !== undefined) params.set('max_price', nextFilters.max_price.toString());
    if (nextFilters.min_area !== undefined) params.set('min_area', nextFilters.min_area.toString());
    if (nextFilters.max_area !== undefined) params.set('max_area', nextFilters.max_area.toString());
    if (nextFilters.sort_by && nextFilters.sort_by !== 'date_desc') params.set('sort_by', nextFilters.sort_by);
    if (nextViewMode === 'table') params.set('view', 'table');
    if (nextNeedsAttention) params.set('needsAttention', 'true');

    const str = params.toString();
    router.replace(str ? `/properties?${str}` : '/properties', { scroll: false });
  };

  const handleFilterChange = (nextFilters: PropertyFilters) => {
    setFilters(nextFilters);
    syncUrl(nextFilters, viewMode, needsAttention);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    syncUrl(filters, mode, needsAttention);
  };

  const handleClearNeedsAttention = () => {
    setNeedsAttention(false);
    syncUrl(filters, viewMode, false);
  };

  const colonies = getColonies();

  // Filter properties
  let filteredProperties = filterProperties(properties, filters);

  // If filtered by needsAttention
  if (needsAttention) {
    filteredProperties = filteredProperties.filter(
      (p) => getPropertyAttentionIssues(p).length > 0
    );
  }

  return (
    <div className="page-container">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brown-900 tracking-tight">
            Properties Portfolio
          </h1>
          <p className="text-brown-600 text-xs sm:text-sm mt-1">
            Displaying {filteredProperties.length}{' '}
            {filteredProperties.length === 1 ? 'property' : 'properties'} in Dayalbagh, Agra
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="inline-flex rounded-xl p-1 bg-beige-200/70 border border-beige-300 shrink-0">
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              className={cn(
                'p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'grid'
                  ? 'bg-white text-brown-900 shadow-2xs'
                  : 'text-brown-600 hover:text-brown-900'
              )}
              title="Card Grid View"
              aria-label="Switch to Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('table')}
              className={cn(
                'p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'table'
                  ? 'bg-white text-brown-900 shadow-2xs'
                  : 'text-brown-600 hover:text-brown-900'
              )}
              title="Compact Table / List View"
              aria-label="Switch to Compact Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>

          <Link
            href="/properties/add"
            className="btn-gold flex items-center justify-center shrink-0 text-xs sm:text-sm py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Filter and sorting component */}
      <FiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        colonies={colonies}
        needsAttention={needsAttention}
        onClearNeedsAttention={handleClearNeedsAttention}
      />

      {/* Loading state */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="property-card h-96 p-4 space-y-4">
                <Skeleton className="w-full h-48 rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-8 w-1/3 mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 space-y-4 border border-gold-200/60 shadow-sm">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        )
      ) : filteredProperties.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => router.push(`/properties/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <PropertyTable
            properties={filteredProperties}
            onRowClick={(id) => router.push(`/properties/${id}`)}
          />
        )
      ) : (
        <div className="glass-card p-10 sm:p-14 flex flex-col items-center justify-center text-center border border-gold-200/60 shadow-sm">
          <div className="w-20 h-20 bg-beige-100 rounded-full flex items-center justify-center mb-4 border border-beige-200">
            <Building className="w-10 h-10 text-gold-500" />
          </div>
          <h3 className="text-xl font-bold font-display text-brown-900 mb-2">
            No properties found
          </h3>
          <p className="text-brown-600 max-w-md mx-auto text-sm leading-relaxed">
            We couldn&apos;t find any properties matching your current criteria in Dayalbagh. Try
            relaxing your filters or clear them completely.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilters({});
              setNeedsAttention(false);
              syncUrl({}, viewMode, false);
            }}
            className="btn-gold mt-6 text-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="page-container space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </div>
          </div>
        }
      >
        <PropertiesContent />
      </Suspense>
    </DashboardLayout>
  );
}