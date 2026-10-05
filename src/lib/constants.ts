// ============================================
// Dayalwasi Properties — Constants & Labels
// ============================================

import type {
  PropertyType,
  FacingDirection,
  RegistryStatus,
  AvailabilityStatus,
  ConstructionStatus,
  SortOption,
} from './types';

// --- Label Maps ---

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  plot: 'Plot / Land',
  house: 'House / Villa',
  flat: 'Flat / Apartment',
  commercial: 'Commercial / Shop',
  floor: 'Independent Floor',
};

export const FACING_LABELS: Record<FacingDirection, string> = {
  east: 'East',
  west: 'West',
  north: 'North',
  south: 'South',
  'north-east': 'North-East',
  'north-west': 'North-West',
  'south-east': 'South-East',
  'south-west': 'South-West',
};

export const REGISTRY_LABELS: Record<RegistryStatus, string> = {
  registered: 'Registered',
  unregistered: 'Unregistered',
  freehold: 'Freehold',
  leasehold: 'Leasehold',
};

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available',
  sold: 'Sold',
  reserved: 'Reserved',
  negotiation: 'Under Negotiation',
};

export const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  sold: 'bg-red-100 text-red-800',
  reserved: 'bg-amber-100 text-amber-800',
  negotiation: 'bg-blue-100 text-blue-800',
};

export const CONSTRUCTION_LABELS: Record<ConstructionStatus, string> = {
  ready: 'Ready to Move',
  under_construction: 'Under Construction',
  plot: 'Plot / Land',
};

export const SORT_LABELS: Record<SortOption, string> = {
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  area_asc: 'Area: Small to Large',
  area_desc: 'Area: Large to Small',
  date_desc: 'Newest First',
  date_asc: 'Oldest First',
  colony: 'Colony Name',
};

export const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

// --- Contact Role Labels ---
export const CONTACT_ROLE_LABELS: Record<string, string> = {
  broker: 'Broker / Dealer',
  builder: 'Builder / Developer',
  lawyer: 'Lawyer / Advocate',
  banker: 'Banker / Loan Agent',
  government: 'Govt. Official',
  client: 'Client / Buyer',
  other: 'Other',
};

export const CONTACT_ROLE_COLORS: Record<string, string> = {
  broker: 'bg-purple-100 text-purple-800',
  builder: 'bg-blue-100 text-blue-800',
  lawyer: 'bg-amber-100 text-amber-800',
  banker: 'bg-green-100 text-green-800',
  government: 'bg-red-100 text-red-800',
  client: 'bg-cyan-100 text-cyan-800',
  other: 'bg-gray-100 text-gray-800',
};

// --- Dayalbagh Colonies ---
export const DAYALBAGH_COLONIES = [
  'Tulsi Vihar',
  'Jeevan Jyoti',
  'Prem Nagar',
  'Dayal Bagh',
  'Swami Bagh',
  'Sikandra',
  'Shahganj',
  'Bodla',
  'Kamla Nagar',
  'Rajnagar',
  'Shastripuram',
  'Trans Yamuna Colony',
  'Khandari',
  'Lohamandi',
  'Belanganj',
  'Pratap Pura',
  'Foundry Nagar',
  'Vijay Nagar',
  'Sanjay Place',
  'Wazirpura',
];

// --- Defaults ---
export const DEFAULT_CITY = 'Agra';
export const DEFAULT_CENTER = { lat: 27.2244, lng: 78.0120 }; // Dayalbagh, Agra
export const DEFAULT_ZOOM = 14;

// --- Conversion ---
export const GAJ_TO_SQFT = 9; // 1 gaj = 9 sq ft

// --- Price Formatting ---
export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatPriceINR(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatArea(gaj: number): string {
  return `${gaj} गज (${gaj * GAJ_TO_SQFT} sq.ft.)`;
}
