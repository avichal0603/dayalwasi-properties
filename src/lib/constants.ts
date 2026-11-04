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
  available: 'bg-olive-100 text-olive-800 border-olive-300',
  reserved: 'bg-gold-100 text-brown-800 border-gold-300',
  negotiation: 'bg-brown-100 text-brown-700 border-brown-200',
  sold: 'bg-beige-300 text-brown-500 border-beige-500',
};

export const AVAILABILITY_PIN_COLORS: Record<AvailabilityStatus, string> = {
  available: '#2D6A4F',
  reserved: '#C9A84C',
  negotiation: '#6B4226',
  sold: '#9C8A6E',
};

export const CONSTRUCTION_LABELS: Record<ConstructionStatus, string> = {
  ready: 'Ready to Move',
  under_construction: 'Under Construction',
  plot: 'Plot / Land',
};

export const SORT_LABELS: Record<SortOption, string> = {
  date_desc: 'Newest First',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  area_asc: 'Area: Small to Large',
  area_desc: 'Area: Large to Small',
  price_per_gaj_asc: 'Price / Gaj: Low to High',
  price_per_gaj_desc: 'Price / Gaj: High to Low',
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
  broker: 'bg-gold-100 text-brown-800 border-gold-300',
  builder: 'bg-brown-100 text-brown-800 border-brown-300',
  lawyer: 'bg-olive-100 text-olive-800 border-olive-300',
  banker: 'bg-beige-300 text-brown-800 border-beige-400',
  government: 'bg-gold-200 text-brown-900 border-gold-400',
  client: 'bg-olive-50 text-olive-900 border-olive-200',
  other: 'bg-beige-200 text-brown-700 border-beige-300',
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
// --- Google Drive Archive Link ---
export const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1iSQBJFX4xNGFJ24RajPjZju80AlSLvlO?usp=sharing';

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

export function formatArea(gaj: number, areaSqft?: number | null): string {
  const sqft = areaSqft ?? Math.round(gaj * GAJ_TO_SQFT);
  return `${gaj.toLocaleString('en-IN')} Gaj (${sqft.toLocaleString('en-IN')} sq ft)`;
}
