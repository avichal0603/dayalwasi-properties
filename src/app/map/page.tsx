'use client'

import { useState, useMemo } from 'react';
import PropertyMap from '@/components/map/PropertyMap';
import { useProperties } from '@/hooks/useProperties';
import { DAYALBAGH_COLONIES, PROPERTY_TYPE_LABELS, AVAILABILITY_LABELS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Filter, X } from 'lucide-react';
import { Property } from '@/lib/types';

export default function MapPage() {
  const { properties, loading } = useProperties();
  
  const [colony, setColony] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [availability, setAvailability] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProperties = useMemo(() => {
    return properties.filter((p: Property) => {
      if (colony && p.colony !== colony) return false;
      if (propertyType && p.property_type !== propertyType) return false;
      if (availability && p.availability !== availability) return false;
      return true;
    });
  }, [properties, colony, propertyType, availability]);

  const handleClearFilters = () => {
    setColony('');
    setPropertyType('');
    setAvailability('');
  };

  return (
    <DashboardLayout>
      <div className="page-enter relative w-full h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden p-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
          <span className="font-semibold text-brown-800">Map Properties ({filteredProperties.length})</span>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="btn-outline flex items-center gap-2 py-1.5 px-3 text-sm"
          >
            {isFilterOpen ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            {isFilterOpen ? 'Close' : 'Filters'}
          </button>
        </div>

        {/* Sidebar */}
        <div className={`
          premium-card bg-white h-full overflow-y-auto w-full md:w-[280px] flex-shrink-0 z-[500] md:z-20 transition-all duration-300
          ${isFilterOpen ? 'block' : 'hidden md:block'}
          absolute md:relative top-[60px] md:top-0 left-0
        `}>
          <div className="p-5">
            <div className="flex justify-between items-center mb-6 hidden md:flex">
              <h3 className="font-display font-semibold text-brown-800 flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5 text-gold-500" />
                Filters
              </h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-1.5">Colony</label>
                <select 
                  className="select-field w-full text-sm py-2"
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                >
                  <option value="">All Colonies</option>
                  {DAYALBAGH_COLONIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-600 mb-1.5">Property Type</label>
                <select 
                  className="select-field w-full text-sm py-2"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-600 mb-1.5">Availability</label>
                <select 
                  className="select-field w-full text-sm py-2"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleClearFilters}
                className="w-full btn-outline text-sm py-2.5 mt-4"
              >
                Clear Filters
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-center text-brown-600">
                <span className="font-bold text-gold-600 text-2xl block mb-1">{filteredProperties.length}</span>
                Properties Found
              </p>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative h-[calc(100vh-64px-60px)] md:h-full z-0">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center bg-beige-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
          ) : (
            <PropertyMap 
              properties={filteredProperties}
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              height="100%"
            />
          )}

          {/* Legend */}
          <div className="absolute bottom-6 right-6 z-[400] pointer-events-none">
            <div className="glass-card p-3 rounded-lg shadow-md bg-white/90 backdrop-blur-md text-xs pointer-events-auto">
              <h4 className="font-semibold text-brown-800 mb-2 border-b border-gray-100 pb-1">Legend</h4>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-gold-600"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brown-600"></div>
                <span className="text-gray-600">Sold / Selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
