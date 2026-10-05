'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    
    try {
      const success = await login(password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null; // or a loader
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-beige-50 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-brown-100 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-brown-500"></div>
        
        <div className="text-center mb-8 mt-2">
          <h1 className="text-4xl font-display font-bold text-gold-600 mb-2">Dayalwasi</h1>
          <p className="text-sm font-medium tracking-[0.2em] text-brown-500 uppercase">Properties</p>
          
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-[2px] bg-gold-200"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-brown-300" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                className="input-field pl-10 w-full"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="btn-gold w-full flex justify-center"
          >
            {isLoggingIn ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-sm text-brown-400">
        &copy; {new Date().getFullYear()} Dayalwasi Properties. Authorized access only.
      </p>
    </div>
  );
}
