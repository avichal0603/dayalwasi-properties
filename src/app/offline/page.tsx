'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-beige-50 p-6 text-center selection:bg-gold-500 selection:text-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gold-200/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-700" />

        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 p-0.5 shadow-gold mb-5 flex items-center justify-center">
          <div className="w-full h-full bg-brown-950 rounded-[14px] flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-gold-300">D</span>
          </div>
        </div>

        <div className="mx-auto w-11 h-11 rounded-full bg-beige-100 border border-beige-300 flex items-center justify-center text-brown-700 mb-4">
          <WifiOff size={20} />
        </div>

        <h1 className="text-2xl font-display font-bold text-brown-900 mb-2">
          You Are Offline
        </h1>
        <p className="text-sm text-brown-600 leading-relaxed mb-6">
          Dayalwasi Properties requires an active internet connection to sync live listings,
          photos, and security settings. Please reconnect and try again.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-gold w-full flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
