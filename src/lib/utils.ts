// ============================================
// Dayalwasi Properties — Utility Functions
// ============================================

import { GAJ_TO_SQFT, formatArea } from './constants';
import type { Property, PropertyFilters } from './types';

/**
 * Convert Gaj to Square Feet
 */
export function gajToSqft(gaj: number): number {
  return Math.round(gaj * GAJ_TO_SQFT);
}

/**
 * Calculate price per gaj
 */
export function calcPricePerGaj(price: number, areaGaj: number): number {
  if (areaGaj === 0) return 0;
  return Math.round(price / areaGaj);
}

/**
 * Generate Google Maps direction URL
 */
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Generate Google Maps view URL
 */
export function getMapViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Filter properties based on filter criteria
 */
export function filterProperties(
  properties: Property[],
  filters: PropertyFilters
): Property[] {
  let result = [...properties];

  // Text search
  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.colony.toLowerCase().includes(search) ||
        p.address.toLowerCase().includes(search) ||
        p.owner_name.toLowerCase().includes(search)
    );
  }

  // Colony filter
  if (filters.colony) {
    result = result.filter(
      (p) => p.colony.toLowerCase() === filters.colony!.toLowerCase()
    );
  }

  // Property type
  if (filters.property_type) {
    result = result.filter((p) => p.property_type === filters.property_type);
  }

  // Facing
  if (filters.facing) {
    result = result.filter((p) => p.facing === filters.facing);
  }

  // Availability
  if (filters.availability) {
    result = result.filter((p) => p.availability === filters.availability);
  }

  // Construction status
  if (filters.construction_status) {
    result = result.filter(
      (p) => p.construction_status === filters.construction_status
    );
  }

  // Price range
  if (filters.min_price !== undefined) {
    result = result.filter((p) => p.price >= filters.min_price!);
  }
  if (filters.max_price !== undefined) {
    result = result.filter((p) => p.price <= filters.max_price!);
  }

  // Area range
  if (filters.min_area !== undefined) {
    result = result.filter((p) => p.area_gaj >= filters.min_area!);
  }
  if (filters.max_area !== undefined) {
    result = result.filter((p) => p.area_gaj <= filters.max_area!);
  }

  // Sorting
  if (filters.sort_by) {
    result.sort((a, b) => {
      switch (filters.sort_by) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'area_asc':
          return a.area_gaj - b.area_gaj;
        case 'area_desc':
          return b.area_gaj - a.area_gaj;
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'colony':
          return a.colony.localeCompare(b.colony);
        default:
          return 0;
      }
    });
  }

  return result;
}

/**
 * Generate a property summary for WhatsApp sharing
 */
export function generateShareText(property: Property): string {
  const lines = [
    `🏠 *${property.title}*`,
    `📍 ${property.colony}, ${property.address}`,
    `📐 Area: ${formatArea(property.area_gaj, property.area_sqft)}`,
    `🧭 Facing: ${property.facing.charAt(0).toUpperCase() + property.facing.slice(1)}`,
    `💰 Price: ₹${property.price.toLocaleString('en-IN')}`,
    property.bhk ? `🏗️ ${property.bhk}` : '',
    `📋 Status: ${property.availability}`,
    '',
    '— Dayalwasi Properties',
  ];
  return lines.filter(Boolean).join('\n');
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * cn utility for conditional class names
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// --- Needs Attention Audit Helper ---

export interface AttentionIssue {
  type: 'no_images' | 'no_contact' | 'stale';
  label: string;
}

export interface PropertyWithAttention {
  property: Property;
  issues: AttentionIssue[];
}

export function getPropertyAttentionIssues(property: Property): AttentionIssue[] {
  // Sold properties don't need attention
  if (property.availability === 'sold') return [];

  const issues: AttentionIssue[] = [];

  // Check images (empty array or missing)
  if (!property.images || property.images.length === 0) {
    issues.push({ type: 'no_images', label: 'No photos uploaded' });
  }

  // Check owner contact (empty or whitespace only)
  if (!property.owner_contact || !property.owner_contact.trim()) {
    issues.push({ type: 'no_contact', label: 'Missing owner contact' });
  }

  // Check stale: updated_at older than 30 days
  if (property.updated_at) {
    const updatedTime = new Date(property.updated_at).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (updatedTime < thirtyDaysAgo) {
      issues.push({ type: 'stale', label: 'Not updated in 30+ days' });
    }
  }

  return issues;
}

export function getPropertiesNeedingAttention(properties: Property[]): PropertyWithAttention[] {
  const result: PropertyWithAttention[] = [];
  for (const property of properties) {
    const issues = getPropertyAttentionIssues(property);
    if (issues.length > 0) {
      result.push({ property, issues });
    }
  }
  return result;
}
