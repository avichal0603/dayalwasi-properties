'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Share, PlusSquare, Smartphone, Laptop, CheckCircle2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaContextValue {
  isStandalone: boolean;
  canInstallNative: boolean;
  isIos: boolean;
  isAndroid: boolean;
  isMacSafari: boolean;
  promptInstall: () => Promise<void>;
  openGuide: () => void;
}

const DISMISS_STORAGE_KEY = 'dayalwasi_pwa_prompt_dismissed';

const PwaContext = createContext<PwaContextValue>({
  isStandalone: false,
  canInstallNative: false,
  isIos: false,
  isAndroid: false,
  isMacSafari: false,
  promptInstall: async () => {},
  openGuide: () => {},
});

export function usePwaInstall() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const iosStandalone = Boolean((window.navigator as { standalone?: boolean }).standalone);
      setIsStandalone(mediaStandalone || iosStandalone);
    };
    checkStandalone();

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const androidDevice = /android/.test(ua);
    const macSafariBrowser =
      /macintosh/.test(ua) &&
      !iosDevice &&
      /safari/.test(ua) &&
      !/chrome|crios|edg/.test(ua);

    setIsIos(iosDevice);
    setIsAndroid(androidDevice);
    setIsMacSafari(macSafariBrowser);

    const dismissed = localStorage.getItem(DISMISS_STORAGE_KEY) === '1';
    setIsDismissed(dismissed);

    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .catch((err) => console.warn('Service worker registration failed:', err));
      } else {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowGuideModal(false);
      toast.success('Dayalwasi Properties installed on your device!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    } catch {
      // ignore storage errors
    }
  }, []);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  }, [deferredPrompt]);

  const openGuide = useCallback(() => {
    setShowGuideModal(true);
  }, []);

  const showFloatingPrompt =
    !isStandalone &&
    !isDismissed &&
    pathname !== '/map' &&
    pathname !== '/offline' &&
    (Boolean(deferredPrompt) || isIos);

  return (
    <PwaContext.Provider
      value={{
        isStandalone,
        canInstallNative: Boolean(deferredPrompt),
        isIos,
        isAndroid,
        isMacSafari,
        promptInstall,
        openGuide,
      }}
    >
      {children}

      {/* Non-intrusive dismissible mobile/PWA install prompt pill */}
      {showFloatingPrompt && (
        <div
          className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-[340px] z-30 animate-slide-up-fade"
          style={{
            bottom: 'max(4.5rem, calc(4.25rem + env(safe-area-inset-bottom, 0px)))',
          }}
        >
          <div className="flex items-center justify-between gap-2.5 p-2.5 pl-3 rounded-2xl bg-brown-950/95 backdrop-blur-xl border border-gold-400/45 shadow-2xl text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 p-[1.5px] shrink-0">
                <div className="w-full h-full bg-brown-950 rounded-[7px] flex items-center justify-center font-display font-bold text-sm text-gold-300">
                  D
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gold-100 truncate">
                  Install Dayalwasi App
                </p>
                <p className="text-[10px] text-beige-200/80 truncate">
                  {isIos ? 'Add to iPhone Home Screen' : 'Quick home screen access'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={promptInstall}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white text-[11px] font-semibold shadow-sm hover:opacity-95 active:scale-95 transition"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                className="p-1.5 rounded-lg text-beige-200/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Dismiss install prompt"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Install Guide Modal for iPhone, Android, & Mac */}
      {showGuideModal && (
        <div
          className="fixed inset-0 bg-brown-950/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gold-300/80 space-y-5 animate-slide-up-fade pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-beige-300 rounded-full mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 p-0.5 shadow-gold shrink-0">
                  <div className="w-full h-full bg-brown-950 rounded-[10px] flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-gold-300">D</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-brown-900 text-base">
                    Install Dayalwasi App
                  </h3>
                  <p className="text-xs text-brown-500">
                    Full-screen mobile &amp; desktop access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-full text-brown-500 hover:text-brown-900 hover:bg-beige-100 transition-colors"
                aria-label="Close Install Guide"
              >
                <X size={18} />
              </button>
            </div>

            {isStandalone ? (
              <div className="p-4 rounded-2xl bg-olive-50 border border-olive-200 flex items-center gap-3 text-olive-900 text-xs font-medium">
                <CheckCircle2 size={18} className="text-olive-700 shrink-0" />
                <span>You are already running Dayalwasi Properties as an installed app.</span>
              </div>
            ) : isIos ? (
              <div className="space-y-3">
                <p className="text-xs text-brown-600 leading-relaxed">
                  Install directly on your iPhone using Safari in 2 quick steps:
                </p>
                <div className="p-3.5 rounded-xl bg-beige-50 border border-beige-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                    <Share size={16} />
                  </div>
                  <div className="text-xs text-brown-800">
                    <span className="font-bold block">1. Tap the Share button</span>
                    <span className="text-brown-500">
                      Found at the bottom bar of Safari on your iPhone.
                    </span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-beige-50 border border-beige-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                    <PlusSquare size={16} />
                  </div>
                  <div className="text-xs text-brown-800">
                    <span className="font-bold block">2. Tap &ldquo;Add to Home Screen&rdquo;</span>
                    <span className="text-brown-500">
                      Scroll down the share sheet, tap Add to Home Screen, then tap Add.
                    </span>
                  </div>
                </div>
              </div>
            ) : isMacSafari ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-beige-50 border border-beige-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                    <Laptop size={16} />
                  </div>
                  <div className="text-xs text-brown-800">
                    <span className="font-bold block">MacBook Safari App Install</span>
                    <span className="text-brown-600">
                      In the top menu bar, click <strong>File &rarr; Add to Dock&hellip;</strong> (or click the Share button &rarr; Add to Dock).
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-beige-50 border border-beige-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                    <Smartphone size={16} />
                  </div>
                  <div className="text-xs text-brown-800">
                    <span className="font-bold block">
                      {isAndroid ? 'Android Chrome Install' : 'Install via Browser Menu'}
                    </span>
                    <span className="text-brown-600">
                      Open your browser menu (&vellip;) and select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                    </span>
                  </div>
                </div>
                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={promptInstall}
                    className="btn-gold w-full flex items-center justify-center gap-2 text-xs"
                  >
                    <Download size={16} />
                    <span>Install Now</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="btn-outline w-full text-xs font-semibold"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
