// ============================================
// Dayalwasi Properties — Server-Side Rate Limiter
// ============================================

import crypto from 'crypto';
import { supabase } from './supabase';

export const AUTH_ATTEMPTS_ID = '00000000-0000-0000-0000-000000000002';

export interface ClientAttemptRecord {
  failures: number;
  lastFailureTime: number;
  lockoutLevel: number; // 0: none, 1: 60s, 2: 300s, 3: 900s
  lockedUntil: number; // timestamp in ms
}

// In-memory fallback / cache for hot serverless execution
const localAttemptsCache = new Map<string, ClientAttemptRecord>();

/**
 * Generate a SHA-256 hash identifying client by IP + User-Agent.
 */
export function getClientFingerprint(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '127.0.0.1';
  const ua = request.headers.get('user-agent') || 'unknown-client';
  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex');
}

/**
 * Constant-time string equality check to prevent timing attacks.
 */
export function secureTimingEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant execution time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Read all rate limit attempts from Supabase storage row.
 */
async function loadStoredAttempts(): Promise<Record<string, ClientAttemptRecord>> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('notes')
      .eq('id', AUTH_ATTEMPTS_ID)
      .single();

    if (error || !data?.notes) {
      return Object.fromEntries(localAttemptsCache.entries());
    }

    const parsed = JSON.parse(data.notes);
    // Update local cache
    for (const [k, v] of Object.entries(parsed)) {
      localAttemptsCache.set(k, v as ClientAttemptRecord);
    }
    return parsed;
  } catch {
    return Object.fromEntries(localAttemptsCache.entries());
  }
}

/**
 * Save rate limit attempts map to Supabase storage row.
 */
async function saveStoredAttempts(records: Record<string, ClientAttemptRecord>): Promise<void> {
  // Purge expired records older than 24 hours to keep payload small
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const pruned: Record<string, ClientAttemptRecord> = {};

  for (const [key, record] of Object.entries(records)) {
    if (record.lockedUntil > Date.now() || record.lastFailureTime > oneDayAgo) {
      pruned[key] = record;
      localAttemptsCache.set(key, record);
    } else {
      localAttemptsCache.delete(key);
    }
  }

  try {
    await supabase.from('properties').upsert(
      {
        id: AUTH_ATTEMPTS_ID,
        title: '__AUTH_RATE_LIMIT__',
        property_type: 'commercial',
        colony: '__security__',
        address: 'Dayalbagh Auth Rate Limiter',
        area_gaj: 0,
        price: 0,
        facing: 'east',
        registry_status: 'freehold',
        availability: 'available',
        construction_status: 'ready',
        notes: JSON.stringify(pruned),
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Could not persist rate-limit records to Supabase:', err);
  }
}

/**
 * Check if the client is currently locked out.
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }.
 */
export async function checkRateLimit(
  clientKey: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const records = await loadStoredAttempts();
  const record = records[clientKey] || localAttemptsCache.get(clientKey);

  if (!record) {
    return { allowed: true };
  }

  const now = Date.now();
  if (record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Record a failed attempt for the client.
 * Returns { locked: boolean, retryAfter?: number, lockoutLevel: number }.
 */
export async function recordFailedLogin(
  clientKey: string
): Promise<{ locked: boolean; retryAfter?: number; lockoutLevel: number }> {
  const records = await loadStoredAttempts();
  const existing = records[clientKey] || localAttemptsCache.get(clientKey);
  const now = Date.now();

  let failures = 1;
  let lockoutLevel = 0;

  if (existing) {
    // If last failure was within a rolling 60s window or client is in active lockout progression
    if (now - existing.lastFailureTime < 60000 || existing.lockoutLevel > 0) {
      failures = existing.failures + 1;
      lockoutLevel = existing.lockoutLevel;
    } else {
      failures = 1;
      lockoutLevel = 0;
    }
  }

  // 5 attempts allowed before escalating lockout triggers
  if (failures >= 5) {
    let durationSeconds = 60; // Level 1: 60s
    if (lockoutLevel === 1) {
      lockoutLevel = 2;
      durationSeconds = 300; // Level 2: 5 min
    } else if (lockoutLevel >= 2) {
      lockoutLevel = 3;
      durationSeconds = 900; // Level 3: 15 min
    } else {
      lockoutLevel = 1;
      durationSeconds = 60;
    }

    const lockedUntil = now + durationSeconds * 1000;
    const updatedRecord: ClientAttemptRecord = {
      failures,
      lastFailureTime: now,
      lockoutLevel,
      lockedUntil,
    };

    records[clientKey] = updatedRecord;
    await saveStoredAttempts(records);

    return {
      locked: true,
      retryAfter: durationSeconds,
      lockoutLevel,
    };
  }

  // Still within allowed limit (< 5 failures)
  const updatedRecord: ClientAttemptRecord = {
    failures,
    lastFailureTime: now,
    lockoutLevel: 0,
    lockedUntil: 0,
  };

  records[clientKey] = updatedRecord;
  await saveStoredAttempts(records);

  return {
    locked: false,
    lockoutLevel: 0,
  };
}

/**
 * Clear failure counter upon successful PIN authentication.
 */
export async function recordSuccessfulLogin(clientKey: string): Promise<void> {
  const records = await loadStoredAttempts();
  if (records[clientKey] || localAttemptsCache.has(clientKey)) {
    delete records[clientKey];
    localAttemptsCache.delete(clientKey);
    await saveStoredAttempts(records);
  }
}
