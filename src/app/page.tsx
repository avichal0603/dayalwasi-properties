'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, ShieldCheck, KeyRound, Clock } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState<number>(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isAuthenticated, isLoading, authMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authMode === 'session') {
      setRememberDevice(false);
    }
  }, [authMode]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Live countdown timer for rate limiting lockout
  useEffect(() => {
    if (retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retryAfter > 0 || !pin.trim()) return;

    setError('');
    setIsLoggingIn(true);

    try {
      const res = await login(pin.trim(), rememberDevice);
      if (res.success) {
        router.push('/dashboard');
      } else {
        if (res.retryAfter && res.retryAfter > 0) {
          setRetryAfter(res.retryAfter);
          setError(
            res.message ||
              `Too many failed attempts. Security lockout active for ${res.retryAfter}s.`
          );
        } else {
          setError(res.message || 'Incorrect access PIN');
        }
      }
    } catch {
      setError('An error occurred. Please verify your connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-gold-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isLocked = retryAfter > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-beige-50 p-4 sm:p-6 animate-fade-in relative selection:bg-gold-500 selection:text-white">
      {/* Background ambient luxury glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-2xl shadow-xl border border-gold-200/50 relative overflow-hidden backdrop-blur-sm">
        {/* Decorative top ribbon */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-amber-700"></div>

        {/* Monogram Brand Header */}
        <div className="text-center mb-8 mt-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 p-0.5 shadow-gold mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-brown-950 rounded-[14px] flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-gold-300">D</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-brown-900 tracking-tight">
            Dayalwasi
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-xs font-semibold tracking-[0.25em] text-gold-600 uppercase">
              Properties
            </p>
            <span className="w-1 h-1 rounded-full bg-olive-500"></span>
            <p className="text-[11px] font-sans tracking-wider text-brown-400 uppercase">
              Dayalbagh, Agra
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-2">
              Access PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-600">
                <KeyRound size={18} />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={isLocked}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter access PIN"
                className="input-field pl-10 pr-11 w-full text-base tracking-widest disabled:opacity-50 disabled:bg-beige-100"
                required
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brown-400 hover:text-brown-700 transition-colors"
                tabIndex={-1}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error or Rate Limit Lockout Banner */}
            {isLocked ? (
              <div className="mt-3 p-3 rounded-xl bg-gold-50 border border-gold-300 text-brown-900 text-xs font-medium flex items-center gap-2.5 animate-pulse">
                <Clock className="w-4 h-4 text-gold-600 shrink-0" />
                <div>
                  <span className="font-bold text-brown-950 block">Security Lockout Active</span>
                  <span className="text-brown-700">
                    Too many attempts. Retry in{' '}
                    <span className="font-mono font-bold text-gold-700">{retryAfter}s</span>.
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="mt-2.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>{error}</span>
              </div>
            ) : null}
          </div>

          {/* Session / Cache persistence choice */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                disabled={isLocked}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="mt-0.5 rounded border-brown-300 text-gold-600 focus:ring-gold-500 h-4 w-4 shrink-0 transition"
              />
              <div className="text-xs">
                <span className="font-medium text-brown-800 group-hover:text-gold-700 transition-colors">
                  Remember this device
                </span>
                <p className="text-[11px] text-brown-400 mt-0.5 leading-relaxed">
                  {rememberDevice
                    ? 'Saves authorization in cache for instant access next time.'
                    : 'PIN will be asked every time you reopen the app.'}
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || isLocked || !pin.trim()}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-md active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying Access PIN...</span>
              </>
            ) : isLocked ? (
              <>
                <Clock size={18} />
                <span>Locked ({retryAfter}s)</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Unlock Portfolio</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-brown-400 space-y-1">
        <p>&copy; {new Date().getFullYear()} Dayalwasi Properties. Authorized Management Only.</p>
        <p className="text-[11px] text-brown-300">Confidential Real Estate Portfolio System</p>
      </div>
    </div>
  );
}