// ============================================
// Dayalwasi Properties — Type Definitions
// ============================================

export interface Property {
  id: string;
  title: string;
  property_type: PropertyType;
  colony: string;
  address: string;
  city: string;
  area_gaj: number;
  area_sqft: number;
  plot_length: number | null;
  plot_breadth: number | null;
  floors: number | null;
  bhk: string | null;
  bathrooms: number | null;
  parking: boolean;
  parking_type: 'covered' | 'open' | null;
  facing: FacingDirection;
  road_width: number | null;
  corner_plot: boolean;
  price: number;
  price_per_gaj: number;
  registry_status: RegistryStatus;
  loan_available: boolean;
  availability: AvailabilityStatus;
  construction_status: ConstructionStatus;
  owner_name: string;
  owner_contact: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export type PropertyType = 'plot' | 'house' | 'flat' | 'commercial' | 'floor';

export type FacingDirection =
  | 'east'
  | 'west'
  | 'north'
  | 'south'
  | 'north-east'
  | 'north-west'
  | 'south-east'
  | 'south-west';

export type RegistryStatus = 'registered' | 'unregistered' | 'freehold' | 'leasehold';

export type AvailabilityStatus = 'available' | 'sold' | 'reserved' | 'negotiation';

export type ConstructionStatus = 'ready' | 'under_construction' | 'plot';

export interface PropertyFormData {
  title: string;
  property_type: PropertyType;
  colony: string;
  address: string;
  city: string;
  area_gaj: number;
  plot_length: number | null;
  plot_breadth: number | null;
  floors: number | null;
  bhk: string | null;
  bathrooms: number | null;
  parking: boolean;
  parking_type: 'covered' | 'open' | null;
  facing: FacingDirection;
  road_width: number | null;
  corner_plot: boolean;
  price: number;
  registry_status: RegistryStatus;
  loan_available: boolean;
  availability: AvailabilityStatus;
  construction_status: ConstructionStatus;
  owner_name: string;
  owner_contact: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PropertyFilters {
  search?: string;
  colony?: string;
  property_type?: PropertyType;
  facing?: FacingDirection;
  availability?: AvailabilityStatus;
  construction_status?: ConstructionStatus;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  sort_by?: SortOption;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'area_asc'
  | 'area_desc'
  | 'date_desc'
  | 'date_asc'
  | 'colony';

export interface DashboardStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  total_value: number;
  colonies: number;
}

// --- Contacts ---

export interface Contact {
  id: string;
  name: string;
  phone: string;
  alternate_phone: string | null;
  role: ContactRole;
  company: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactRole = 'broker' | 'builder' | 'lawyer' | 'banker' | 'government' | 'client' | 'other';
