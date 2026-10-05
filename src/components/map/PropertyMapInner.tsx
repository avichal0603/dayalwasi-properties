'use client'

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/lib/types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, formatPriceINR } from '@/lib/constants';
import Link from 'next/link';

const createCustomIcon = (isSelected: boolean, isAvailable: boolean) => {
  const color = isAvailable ? (isSelected ? '#C9A84C' : '#6B4226') : '#9CA3AF';
  const size = isSelected ? 40 : 32;
  
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
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
  
  const propertiesWithLocation = properties.filter(p => p.latitude && p.longitude);

  return (
    <div style={{ height, width: '100%' }} className="relative z-0">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} />
        
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
              <div className="w-48">
                {property.images && property.images.length > 0 && (
                  <div className="h-24 w-full relative mb-2 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <h3 className="font-display font-semibold text-brown-800 text-sm truncate">{property.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{property.colony}, Dayalbagh</p>
                <p className="font-bold text-gold-600 text-sm">{formatPriceINR(property.price)}</p>
                <p className="text-xs text-gray-600 mb-2">{property.area_gaj} gaj</p>
                
                <div className="flex flex-col gap-1 mt-2">
                  <Link href={`/properties/${property.id}`} className="block text-xs text-center bg-gold-500 text-white py-1 rounded hover:bg-gold-600 transition-colors">
                    View Details
                  </Link>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="block text-xs text-center border border-brown-300 text-brown-700 py-1 rounded hover:bg-brown-50 transition-colors"
                  >
                    Get Directions
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
