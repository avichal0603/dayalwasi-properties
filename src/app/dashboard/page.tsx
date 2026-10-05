'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { useProperties } from '@/hooks/useProperties';
import { formatPriceINR, formatArea, AVAILABILITY_LABELS, AVAILABILITY_COLORS } from '@/lib/constants';
import { Building2, CheckCircle, XCircle, IndianRupee, Map as MapIcon, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const d = date.getDate();
  const year = date.getFullYear();
  const suffix = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';
  return `${day}, ${month} ${d}${suffix}, ${year}`;
}

export default function DashboardPage() {
  const { properties, loading } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    if (!properties) return { total: 0, available: 0, sold: 0, value: 0 };
    
    let available = 0;
    let sold = 0;
    let value = 0;
    
    properties.forEach(p => {
      if (p.availability === 'available') {
        available++;
        value += p.price;
      } else if (p.availability === 'sold') {
        sold++;
      }
    });

    return {
      total: properties.length,
      available,
      sold,
      value
    };
  }, [properties]);

  const recentProperties = useMemo(() => {
    if (!properties) return [];
    return [...properties]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [properties]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !properties) return [];
    const query = searchQuery.toLowerCase();
    return properties.filter(p => 
      p.colony?.toLowerCase().includes(query) || 
      p.title.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, properties]);

  const today = formatDate(new Date());

  return (
    <DashboardLayout title="Overview" onSearch={setSearchQuery}>
      <div className="space-y-8 pb-8">
        {/* Welcome Section */}
        <div className="animate-fade-in pt-4">
          <h2 className="section-title">Welcome back</h2>
          <p className="text-brown-500 mt-1">{today}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Building2} 
            label="Total Properties" 
            value={loading ? '...' : stats.total} 
            color="text-blue-600 bg-blue-100"
          />
          <StatCard 
            icon={CheckCircle} 
            label="Available" 
            value={loading ? '...' : stats.available} 
            color="text-green-600 bg-green-100"
          />
          <StatCard 
            icon={XCircle} 
            label="Sold" 
            value={loading ? '...' : stats.sold} 
            color="text-red-600 bg-red-100"
          />
          <StatCard 
            icon={IndianRupee} 
            label="Total Value (Available)" 
            value={loading ? '...' : formatPriceINR(stats.value)} 
            color="text-gold-600 bg-gold-100"
          />
        </div>

        {/* Quick Search Results (Only shown when searching) */}
        {searchQuery.trim() && (
          <div className="animate-slide-up bg-white p-6 rounded-2xl border border-brown-100 shadow-sm">
            <h3 className="text-lg font-semibold text-brown-900 mb-4">Search Results</h3>
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((property) => (
                  <Link 
                    href={`/properties/${property.id}`} 
                    key={property.id}
                    className="flex items-center justify-between p-3 hover:bg-beige-50 rounded-lg border border-transparent hover:border-brown-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-brown-900">{property.title}</h4>
                      <p className="text-sm text-brown-500">{property.colony}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-brown-900">{formatPriceINR(property.price)}</p>
                        <p className="text-sm text-brown-500">{property.area_gaj} गज</p>
                      </div>
                      <ChevronRight size={18} className="text-brown-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-brown-500 text-center py-4">No properties found matching &quot;{searchQuery}&quot;</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Recent Properties */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-semibold text-brown-900">Recent Properties</h3>
              <Link href="/properties" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="glass-card overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-brown-400 flex flex-col items-center">
                  <Building2 size={32} className="mb-2 opacity-20" />
                  <p>Loading properties...</p>
                </div>
              ) : recentProperties.length > 0 ? (
                <div className="divide-y divide-brown-100">
                  {recentProperties.map(property => (
                    <div key={property.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-brown-900">{property.title}</h4>
                          <span className={cn(
                            "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                            AVAILABILITY_COLORS[property.availability] || "bg-gray-100 text-gray-700"
                          )}>
                            {AVAILABILITY_LABELS[property.availability] || property.availability}
                          </span>
                        </div>
                        <p className="text-sm text-brown-500 flex items-center gap-2">
                          <MapIcon size={14} />
                          {property.colony || 'Dayalbagh'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                        <div className="text-right">
                          <p className="font-semibold text-brown-900">{formatPriceINR(property.price)}</p>
                          <p className="text-sm text-brown-500">{property.area_gaj} गज</p>
                        </div>
                        <Link 
                          href={`/properties/${property.id}`}
                          className="p-2 text-brown-400 hover:text-gold-600 hover:bg-gold-50 rounded-full transition-colors"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-brown-400 flex flex-col items-center">
                  <Building2 size={32} className="mb-2 opacity-20" />
                  <p>No properties added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-xl font-display font-semibold text-brown-900">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link href="/properties/add" className="glass-card p-5 flex items-center gap-4 hover:border-gold-300 hover:shadow-md transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center group-hover:bg-gold-600 group-hover:text-white transition-colors">
                  <Plus size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-brown-900">Add Property</h4>
                  <p className="text-xs text-brown-500">Create a new listing</p>
                </div>
              </Link>
              
              <Link href="/map" className="glass-card p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MapIcon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-brown-900">View Map</h4>
                  <p className="text-xs text-brown-500">See all properties visually</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
