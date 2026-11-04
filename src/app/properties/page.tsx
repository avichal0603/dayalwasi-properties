'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters as FiltersComponent } from '@/components/properties/PropertyFilters';
import { useProperties } from '@/hooks/useProperties';
import { PropertyFilters, AvailabilityStatus } from '@/lib/types';
import { filterProperties, getPropertyAttentionIssues } from '@/lib/utils';
import { Plus, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { properties, loading, getColonies } = useProperties();
  const [filters, setFilters] = useState<PropertyFilters>({});

  // Sync initial filters from URL search params (e.g. from StatCard links)
  useEffect(() => {
    const availabilityParam = searchParams.get('availability') as AvailabilityStatus | null;
    const colonyParam = searchParams.get('colony');
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');

    if (availabilityParam || colonyParam || typeParam || searchParam) {
      setFilters((prev) => ({
        ...prev,
        ...(availabilityParam ? { availability: availabilityParam } : {}),
        ...(colonyParam ? { colony: colonyParam } : {}),
        ...(typeParam ? { property_type: typeParam as any } : {}),
        ...(searchParam ? { search: searchParam } : {}),
      }));
    }
  }, [searchParams]);

  const colonies = getColonies();
  
  // Filter properties
  let filteredProperties = filterProperties(properties, filters);

  // If filtered by needsAttention
  const needsAttentionParam = searchParams.get('needsAttention');
  if (needsAttentionParam === 'true') {
    filteredProperties = filteredProperties.filter(
      (p) => getPropertyAttentionIssues(p).length > 0
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brown-900">Properties</h1>
          <p className="text-brown-500 mt-1">
            Showing {filteredProperties.length}{' '}
            {filteredProperties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
        <Link
          href="/properties/add"
          className="btn-gold flex items-center justify-center w-full md:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </Link>
      </div>

      <FiltersComponent
        filters={filters}
        onFilterChange={setFilters}
        colonies={colonies}
      />

      {loading ? (
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
      ) : filteredProperties.length > 0 ? (
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
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-beige-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-10 h-10 text-gold-400" />
          </div>
          <h3 className="text-xl font-bold text-brown-900 mb-2">No properties found</h3>
          <p className="text-brown-500 max-w-md mx-auto">
            We couldn&apos;t find any properties matching your current filters. Try adjusting your
            search criteria or clear the filters.
          </p>
          <button onClick={() => setFilters({})} className="btn-outline mt-6">
            Clear Filters
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
