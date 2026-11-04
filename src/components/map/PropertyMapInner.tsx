'use client'

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/lib/types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, formatPriceINR, formatArea } from '@/lib/constants';
import Link from 'next/link';

const createCustomIcon = (isSelected: boolean, isAvailable: boolean) => {
  const color = isAvailable ? (isSelected ? '#C9A84C' : '#6B4226') : '#9CA3AF';
  const size = isSelected ? 42 : 34;
  
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.35));">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const createPinPickerIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div style="filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.4)); animation: bounce 1s infinite alternate;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="40" height="40" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

function MapUpdater({ center, zoom }: { center: { lat: number; lng: number }, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

interface PropertyMapInnerProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  selectedId?: string;
  onPropertyClick?: (property: Property) => void;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  height?: string;
}

export default function PropertyMapInner({
  properties,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  selectedId,
  onPropertyClick,
  onMapClick,
  height = '500px'
}: PropertyMapInnerProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const propertiesWithLocation = properties.filter(p => p.latitude && p.longitude);

  // If no properties are provided but onMapClick and a custom center is passed, we show a picked pin
  const isCustomPin = properties.length === 0 && Boolean(onMapClick) && (center.lat !== DEFAULT_CENTER.lat || center.lng !== DEFAULT_CENTER.lng);

  return (
    <div style={{ height, width: '100%' }} className="relative z-0 group">
      {/* Map Style Switcher (Google Style) */}
      <div className="absolute top-3 right-3 z-[400] flex bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-brown-200/60 overflow-hidden text-xs font-medium">
        <button
          type="button"
          onClick={() => setMapType('roadmap')}
          className={`px-3 py-1.5 transition-colors flex items-center gap-1 ${
            mapType === 'roadmap'
              ? 'bg-gold-500 text-white font-semibold shadow-inner'
              : 'text-brown-700 hover:bg-beige-100'
          }`}
        >
          <span>🗺️</span> Map
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1.5 transition-colors flex items-center gap-1 ${
            mapType === 'satellite'
              ? 'bg-gold-500 text-white font-semibold shadow-inner'
              : 'text-brown-700 hover:bg-beige-100'
          }`}
        >
          <span>🛰️</span> Satellite
        </button>
      </div>

      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Google Maps Tiles */}
        <TileLayer
          key={mapType}
          attribution='&copy; Google Maps'
          url={
            mapType === 'satellite'
              ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
              : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
          }
          subdomains={['0', '1', '2', '3']}
          maxZoom={20}
        />
        <MapUpdater center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} />
        
        {/* Picked Pin Marker (for Form coordinate picking) */}
        {isCustomPin && (
          <Marker
            position={[center.lat, center.lng]}
            icon={createPinPickerIcon()}
          >
            <Popup className="property-popup">
              <div className="text-center p-1 text-xs font-semibold text-brown-900">
                📍 Selected Property Location<br />
                <span className="font-mono text-[10px] text-gray-500">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {propertiesWithLocation.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={createCustomIcon(property.id === selectedId, property.availability === 'available')}
            eventHandlers={{
              click: () => {
                if (onPropertyClick) onPropertyClick(property);
              }
            }}
          >
            <Popup className="property-popup">
              <div className="w-52 p-1">
                {property.images && property.images.length > 0 && (
                  <div className="h-28 w-full relative mb-2 rounded-lg overflow-hidden shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <h3 className="font-display font-semibold text-brown-900 text-sm truncate">{property.title}</h3>
                <p className="text-xs text-brown-500 mb-1">{property.colony}, Dayalbagh</p>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gold-600 text-sm">{formatPriceINR(property.price)}</p>
                  <p className="text-xs text-brown-600 font-medium">{formatArea(property.area_gaj, property.area_sqft)}</p>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <Link href={`/properties/${property.id}`} className="block text-xs font-semibold text-center bg-gold-500 text-white py-1.5 rounded-lg hover:bg-gold-600 shadow-sm transition-colors">
                    View Details
                  </Link>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="block text-xs font-medium text-center border border-brown-300 bg-beige-50 text-brown-800 py-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    🗺️ Open in Google Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
