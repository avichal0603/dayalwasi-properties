// ============================================
// Dayalwasi Properties — System & Auth Settings
// ============================================

import { supabase } from './supabase';
import { secureTimingEqual } from './rateLimit';

export const SYSTEM_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_FALLBACK_PIN = '0690';

export interface AuthSettings {
  customPin: string | null;
  authMode: 'cache' | 'session';
  updatedAt: string | null;
}

/**
 * Retrieve system settings from Supabase system row.
 * Falls back gracefully to defaults if table row doesn't exist yet.
 */
export async function getAuthSettings(): Promise<AuthSettings> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('notes')
      .eq('id', SYSTEM_CONFIG_ID)
      .single();

    if (error || !data?.notes) {
      return {
        customPin: null,
        authMode: 'cache',
        updatedAt: null,
      };
    }

    try {
      const parsed = JSON.parse(data.notes);
      return {
        customPin: parsed.customPin || null,
        authMode: parsed.authMode === 'session' ? 'session' : 'cache',
        updatedAt: parsed.updatedAt || null,
      };
    } catch {
      return {
        customPin: null,
        authMode: 'cache',
        updatedAt: null,
      };
    }
  } catch (err) {
    console.error('Failed to get auth settings:', err);
    return {
      customPin: null,
      authMode: 'cache',
      updatedAt: null,
    };
  }
}

/**
 * Save updated system settings to Supabase system row.
 */
export async function saveAuthSettings(
  partial: Partial<{ customPin: string | null; authMode: 'cache' | 'session' }>
): Promise<boolean> {
  try {
    const current = await getAuthSettings();
    const updated: AuthSettings = {
      customPin: partial.customPin !== undefined ? partial.customPin : current.customPin,
      authMode: partial.authMode !== undefined ? partial.authMode : current.authMode,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('properties').upsert(
      {
        id: SYSTEM_CONFIG_ID,
        title: '__SYSTEM_SETTINGS__',
        property_type: 'commercial',
        colony: '__system__',
        address: 'Dayalbagh System Configuration',
        area_gaj: 0,
        price: 0,
        facing: 'east',
        registry_status: 'freehold',
        availability: 'available',
        construction_status: 'ready',
        notes: JSON.stringify(updated),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Error saving auth settings to Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error saving auth settings:', err);
    return false;
  }
}

/**
 * Verify if provided numeric PIN matches active PIN (custom or env/default fallback).
 */
export async function verifyActivePin(pin: string): Promise<boolean> {
  const settings = await getAuthSettings();
  const activePin = settings.customPin || process.env.APP_PIN || DEFAULT_FALLBACK_PIN;
  return secureTimingEqual(pin.trim(), activePin.trim());
}
