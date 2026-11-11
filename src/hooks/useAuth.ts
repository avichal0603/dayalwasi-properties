// ============================================
// Dayalwasi Properties — Auth Hook
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'dayalwasi_auth';
const AUTH_MODE_KEY = 'dayalwasi_auth_mode';

export type AuthMode = 'cache' | 'session';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<AuthMode>('cache');

  useEffect(() => {
    // 1. Check local device mode preference
    const storedMode = (localStorage.getItem(AUTH_MODE_KEY) as AuthMode) || 'cache';
    setAuthMode(storedMode);

    // 2. Check session storage (always valid for the current tab session)
    const sessionAuth = sessionStorage.getItem(AUTH_KEY);
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // 3. Check persistent cache only if authMode is 'cache' (remember device)
    if (storedMode === 'cache') {
      const localAuth = localStorage.getItem(AUTH_KEY);
      if (localAuth === 'true') {
        setIsAuthenticated(true);
      }
    }

    setIsLoading(false);

    // 4. Background sync system configuration
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authMode) {
          setAuthMode(data.authMode);
          localStorage.setItem(AUTH_MODE_KEY, data.authMode);
          // If server demands strict session-only mode, clear persistent token
          if (data.authMode === 'session') {
            localStorage.removeItem(AUTH_KEY);
          }
        }
      })
      .catch((err) => console.warn('Could not sync auth settings:', err));
  }, []);

  const login = useCallback(
    async (
      pin: string,
      rememberDevice: boolean = true
    ): Promise<{ success: boolean; message?: string; retryAfter?: number }> => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          sessionStorage.setItem(AUTH_KEY, 'true');

          if (rememberDevice) {
            localStorage.setItem(AUTH_KEY, 'true');
            localStorage.setItem(AUTH_MODE_KEY, 'cache');
            setAuthMode('cache');
          } else {
            localStorage.removeItem(AUTH_KEY);
            localStorage.setItem(AUTH_MODE_KEY, 'session');
            setAuthMode('session');
          }

          setIsAuthenticated(true);
          return { success: true };
        }

        return {
          success: false,
          message: data.message || 'Incorrect PIN',
          retryAfter: data.retryAfter,
        };
      } catch {
        return { success: false, message: 'Authentication failed. Please check network connection.' };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  const changePin = useCallback(
    async (
      currentPin: string,
      newPin: string
    ): Promise<{ success: boolean; message: string }> => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'change-pin',
            currentPin,
            newPin,
          }),
        });

        const data = await res.json();
        return {
          success: res.ok && Boolean(data.success),
          message: data.message || (res.ok ? 'PIN changed successfully' : 'Failed to change PIN'),
        };
      } catch {
        return {
          success: false,
          message: 'Network error while attempting to change PIN',
        };
      }
    },
    []
  );

  const updateAuthPreference = useCallback(async (mode: AuthMode): Promise<boolean> => {
    try {
      setAuthMode(mode);
      localStorage.setItem(AUTH_MODE_KEY, mode);

      if (mode === 'session') {
        // Purge persistent local cache so closing browser tab demands PIN
        localStorage.removeItem(AUTH_KEY);
      } else {
        localStorage.setItem(AUTH_KEY, 'true');
      }

      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-mode',
          authMode: mode,
        }),
      });

      return true;
    } catch {
      return false;
    }
  }, []);

  const resetPin = useCallback(
    async (currentPin: string): Promise<{ success: boolean; message: string }> => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reset-pin',
            currentPin,
          }),
        });

        const data = await res.json();
        return {
          success: res.ok && Boolean(data.success),
          message: data.message || 'Reset complete',
        };
      } catch {
        return {
          success: false,
          message: 'Network error while resetting PIN',
        };
      }
    },
    []
  );

  return {
    isAuthenticated,
    isLoading,
    authMode,
    login,
    logout,
    changePin,
    updateAuthPreference,
    resetPin,
  };
}
