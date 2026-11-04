'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProperties } from '@/hooks/useProperties';
import {
  formatPriceINR,
  formatArea,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
  GOOGLE_DRIVE_FOLDER_URL,
} from '@/lib/constants';
import {
  Building2,
  CheckCircle,
  Clock,
  Handshake,
  Bookmark,
  IndianRupee,
  Map as MapIcon,
  Plus,
  ChevronRight,
  FolderOpen,
  ExternalLink,
  AlertTriangle,
  ImageOff,
  PhoneOff,
  Check,
} from 'lucide-react';
import { cn, getPropertiesNeedingAttention } from '@/lib/utils';

function formatDate(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const d = date.getDate();
  const year = date.getFullYear();
  const suffix =
    d === 1 || d === 21 || d === 31
      ? 'st'
      : d === 2 || d === 22
      ? 'nd'
      : d === 3 || d === 23
      ? 'rd'
      : 'th';
  return `${day}, ${month} ${d}${suffix}, ${year}`;
}

export default function DashboardPage() {
  const { properties, loading } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    if (!properties) {
      return { total: 0, available: 0, reserved: 0, negotiation: 0, sold: 0, availableValue: 0 };
    }

    let available = 0;
    let reserved = 0;
    let negotiation = 0;
    let sold = 0;
    let availableValue = 0;

    properties.forEach((p) => {
      if (p.availability === 'available') {
        available++;
        availableValue += p.price || 0;
      } else if (p.availability === 'reserved') {
        reserved++;
      } else if (p.availability === 'negotiation') {
        negotiation++;
      } else if (p.availability === 'sold') {
        sold++;
      }
    });

    return {
      total: properties.length,
      available,
      reserved,
      negotiation,
      sold,
      availableValue,
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
    return properties
      .filter(
        (p) => p.colony?.toLowerCase().includes(query) || p.title.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, properties]);

  const propertiesNeedingAttention = useMemo(() => {
    if (!properties) return [];
    return getPropertiesNeedingAttention(properties);
  }, [properties]);

  const today = formatDate(new Date());

  return (
    <DashboardLayout title="Overview" onSearch={setSearchQuery}>
      <div className="page-container space-y-6 sm:space-y-8 pb-12">
        {/* Top Header Hero Banner (Matching Admin Portal Luxury Styling) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-950 p-6 sm:p-8 text-white shadow-xl border border-gold-500/30 animate-fade-in">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gold-500/20 text-gold-300 border border-gold-400/30">
                  Dayalbagh Real Estate
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-olive-400"></span>
                <span className="text-xs text-beige-300/80 font-medium tracking-wide">Heritage &amp; Trust</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 p-0.5 shadow-gold shrink-0">
                  <div className="w-full h-full bg-brown-950 rounded-[10px] flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-gold-300">D</span>
                  </div>
                </div>
                <span className="text-gold-metallic">Dayalwasi Properties & Solutions</span>
              </h1>
              <p className="text-xs sm:text-sm text-beige-200/90 max-w-2xl leading-relaxed italic font-serif">
                &ldquo;Where trust is built on solid ground — The benchmark of integrity, prestige, and verified real estate excellence across Dayalbagh, Agra.&rdquo;
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-right backdrop-blur-sm">
                <p className="text-[11px] text-gold-300 font-semibold tracking-wider uppercase">
                  Active Portfolio
                </p>
                <p className="text-xs text-beige-300/80 font-medium">
                  {today}
                </p>
              </div>

              {!loading && (stats.negotiation > 0 || stats.reserved > 0) && (
                <div className="flex items-center gap-2 text-[11px] text-beige-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-olive-400 animate-pulse"></span>
                  <span>{stats.negotiation} in negotiation • {stats.reserved} reserved</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - 5 Actionable Clickable Cards (Task 6 & 7) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            icon={Building2}
            label="Total Properties"
            value={loading ? '...' : stats.total}
            color="text-brown-700 bg-brown-100"
            href="/properties"
          />
          <StatCard
            icon={CheckCircle}
            label="Available"
            value={loading ? '...' : stats.available}
            color="text-olive-800 bg-olive-100"
            href="/properties?availability=available"
          />
          <StatCard
            icon={Handshake}
            label="Negotiation"
            value={loading ? '...' : stats.negotiation}
            color="text-brown-800 bg-brown-100"
            href="/properties?availability=negotiation"
          />
          <StatCard
            icon={Bookmark}
            label="Reserved"
            value={loading ? '...' : stats.reserved}
            color="text-gold-800 bg-gold-100"
            href="/properties?availability=reserved"
          />
          <StatCard
            icon={IndianRupee}
            label="Available Inventory"
            value={loading ? '...' : formatPriceINR(stats.availableValue)}
            color="text-gold-700 bg-gold-100"
            className="col-span-2 sm:col-span-1"
            href="/properties?availability=available"
          />
        </div>

        {/* Quick Search Results (Only shown when searching) */}
        {searchQuery.trim() && (
          <div className="animate-slide-up bg-white p-6 rounded-2xl border border-brown-100 shadow-sm">
            <h3 className="text-base font-semibold text-brown-900 mb-4">Search Results</h3>
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((property) => (
                  <Link
                    href={`/properties/${property.id}`}
                    key={property.id}
                    className="flex items-center justify-between p-3.5 hover:bg-beige-50 rounded-xl border border-brown-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-brown-900 text-sm">{property.title}</h4>
                      <p className="text-xs text-brown-500">{property.colony}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-bold text-brown-900 text-sm">
                          {formatPriceINR(property.price)}
                        </p>
                        <p className="text-xs text-brown-500">
                          {formatArea(property.area_gaj, property.area_sqft)}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-brown-500" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-brown-500 text-center py-4 text-sm">
                No properties found matching &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        )}

        {/* Main Content: Recent Properties & Sidebar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-slide-up">
          {/* Left Column (2 Cols): Recent Properties (Task 8: Whole row is a Link) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-display font-semibold text-brown-900">
                Recent Properties
              </h3>
              <Link
                href="/properties"
                className="text-gold-700 hover:text-gold-800 text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className="glass-card overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div className="space-y-2 w-1/2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : recentProperties.length > 0 ? (
                <div className="divide-y divide-brown-100">
                  {recentProperties.map((property) => (
                    /* Entire row is a clickable Link with min-h-[44px], no nested <a> tags */
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-beige-50/80 transition-colors min-h-[56px]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-brown-900 text-sm group-hover:text-gold-800 transition-colors truncate">
                            {property.title}
                          </h4>
                          <span
                            className={cn(
                              'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border',
                              AVAILABILITY_COLORS[property.availability] ||
                                'bg-beige-300 text-brown-500 border-beige-500'
                            )}
                          >
                            {AVAILABILITY_LABELS[property.availability] || property.availability}
                          </span>
                        </div>
                        <p className="text-xs text-brown-500 flex items-center gap-1.5">
                          <MapIcon size={13} className="text-gold-600 shrink-0" />
                          <span className="truncate">{property.colony || 'Dayalbagh'}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-brown-900 text-sm">
                            {formatPriceINR(property.price)}
                          </p>
                          <p className="text-xs text-brown-500">
                            {formatArea(property.area_gaj, property.area_sqft)}
                          </p>
                        </div>
                        <span className="p-2 text-brown-500 group-hover:text-gold-700 transition-colors">
                          <ChevronRight size={18} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-brown-500 flex flex-col items-center">
                  <Building2 size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No properties added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Needs Attention (Task 11) & Quick Actions */}
          <div className="space-y-6">
            {/* Needs Attention Card (Task 11) */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-brown-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center">
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-brown-900">
                      Needs Attention
                    </h3>
                    <p className="text-[11px] text-brown-500">
                      Stale listings, missing photos, or contacts
                    </p>
                  </div>
                </div>

                {propertiesNeedingAttention.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-100 text-brown-800 border border-gold-300">
                    {propertiesNeedingAttention.length}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : propertiesNeedingAttention.length > 0 ? (
                <div className="space-y-2.5">
                  {propertiesNeedingAttention.slice(0, 5).map(({ property, issues }) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      className="block p-3 rounded-xl bg-beige-50/70 hover:bg-gold-50/60 border border-brown-200/80 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-brown-900 group-hover:text-gold-800 truncate">
                          {property.title}
                        </h4>
                        <span className="text-[10px] text-brown-500 shrink-0 ml-2">
                          {property.colony}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {issues.map((issue) => (
                          <span
                            key={issue.type}
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-brown-200 text-brown-700"
                          >
                            {issue.type === 'no_images' && <ImageOff size={11} className="text-gold-600" />}
                            {issue.type === 'no_contact' && <PhoneOff size={11} className="text-gold-600" />}
                            {issue.type === 'stale' && <Clock size={11} className="text-olive-700" />}
                            <span>{issue.label}</span>
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}

                  {propertiesNeedingAttention.length > 5 && (
                    <Link
                      href="/properties?needsAttention=true"
                      className="block text-center text-xs text-gold-700 hover:text-gold-800 font-semibold pt-1 transition-colors"
                    >
                      View all {propertiesNeedingAttention.length} properties needing attention →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-olive-50/70 border border-olive-200/60 text-xs text-olive-900 flex items-center gap-2.5">
                  <Check size={16} className="text-olive-700 shrink-0" />
                  <span>All active listings have photos, contacts, and are up to date!</span>
                </div>
              )}
            </div>

            {/* Quick Actions (Task 9: Single Drive Link, Rule 4: Cleaned Palette) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-brown-900 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/properties/add"
                  className="glass-card p-4 flex items-center gap-3.5 hover:border-gold-300 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center group-hover:bg-gold-600 group-hover:text-white transition-colors shrink-0">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brown-900 text-xs sm:text-sm">Add Property</h4>
                    <p className="text-[11px] text-brown-500">Create a new Dayalbagh listing</p>
                  </div>
                </Link>

                <Link
                  href="/map"
                  className="glass-card p-4 flex items-center gap-3.5 hover:border-olive-400 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-olive-100 text-olive-800 flex items-center justify-center group-hover:bg-olive-700 group-hover:text-white transition-colors shrink-0">
                    <MapIcon size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brown-900 text-xs sm:text-sm">Interactive Map</h4>
                    <p className="text-[11px] text-brown-500">View colonies and Google Maps pins</p>
                  </div>
                </Link>

                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-4 flex items-center gap-3.5 hover:border-gold-400 transition-all group border-gold-200/80 bg-gradient-to-r from-white to-gold-50/20"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center group-hover:bg-gold-600 group-hover:text-white transition-colors shrink-0">
                    <FolderOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-brown-900 text-xs sm:text-sm truncate">
                        Google Drive Media
                      </h4>
                      <ExternalLink size={13} className="text-brown-500 group-hover:text-gold-700" />
                    </div>
                    <p className="text-[11px] text-brown-500 truncate">
                      4K Videos, RAW Photos & Master Docs
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
