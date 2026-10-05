'use client'

import dynamic from 'next/dynamic';
import { Property } from '@/lib/types';

const PropertyMapInner = dynamic(() => import('./PropertyMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-beige-50 animate-pulse text-brown-600">
      Loading Map...
    </div>
  )
});

interface PropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  selectedId?: string;
  onPropertyClick?: (property: Property) => void;
  onMapClick?: (latlng: { lat: number, lng: number }) => void;
  height?: string;
}

export default function PropertyMap(props: PropertyMapProps) {
  return <PropertyMapInner {...props} />;
}
