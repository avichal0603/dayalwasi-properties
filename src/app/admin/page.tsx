'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth, AuthMode } from '@/hooks/useAuth';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  FolderOpen,
  ExternalLink,
  Laptop,
  Smartphone,
  HardDrive,
  Info,
  LogOut,
  Download,
} from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL } from '@/lib/constants';
import { usePwaInstall } from '@/components/pwa/PwaProvider';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { authMode, changePin, updateAuthPreference, resetPin, logout } = useAuth();
  const { isStandalone, canInstallNative, isIos, promptInstall, openGuide } = usePwaInstall();

  // 3-Step PIN Change State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Visibility toggles for each input
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cache/Session preference loading state
  const [currentMode, setCurrentMode] = useState<AuthMode>('cache');
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAuthPin, setResetAuthPin] = useState('');

  useEffect(() => {
    setCurrentMode(authMode);
  }, [authMode]);

  // Handle 3-step PIN change
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Step 1 validation: Current PIN
    if (!currentPin.trim()) {
      setErrorMessage('Please enter your current PIN.');
      return;
    }

    // Step 2 validation: New numeric PIN requirements
    if (!/^\d{4,12}$/.test(newPin.trim())) {
      setErrorMessage('New PIN must be 4 to 12 digits (numbers only).');
      return;
    }

    if (newPin.trim() === currentPin.trim()) {
      setErrorMessage('New PIN cannot be identical to your current PIN.');
      return;
    }

    // Step 3 validation: Confirmation match
    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMessage('Confirm PIN does not match the new PIN.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePin(currentPin.trim(), newPin.trim());
      if (res.success) {
        setSuccessMessage('Access PIN successfully updated! System has synchronized your new credentials.');
        toast.success('Access PIN updated successfully!');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setErrorMessage(res.message || 'Failed to update PIN. Please verify your current PIN.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle switching between "Ask Every Time" and "Remember Device in Cache"
  const handleToggleMode = async (mode: AuthMode) => {
    if (mode === currentMode) return;
    setIsUpdatingMode(true);
    try {
      const ok = await updateAuthPreference(mode);
      if (ok) {
        setCurrentMode(mode);
        toast.success(
          mode === 'session'
            ? 'Security mode set: PIN will be required on every visit.'
            : 'Device cached: Fast 1-click access active on this device.'
        );
      }
    } catch {
      toast.error('Could not update session setting');
    } finally {
      setIsUpdatingMode(false);
    }
  };

  // Factory reset PIN
  const handleFactoryReset = async () => {
    if (!resetAuthPin.trim()) return;
    try {
      const res = await resetPin(resetAuthPin.trim());
      if (res.success) {
        toast.success('PIN reset to factory default (0690)');
        setShowResetModal(false);
        setResetAuthPin('');
      } else {
        toast.error(res.message || 'Incorrect PIN verification');
      }
    } catch {
      toast.error('Failed to reset PIN');
    }
  };

  const isMatching = Boolean(newPin && confirmPin && newPin === confirmPin);
  const isMismatch = Boolean(confirmPin && newPin !== confirmPin);

  return (
    <DashboardLayout title="Admin & Security">
      <div className="page-container py-6 sm:py-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-950 p-6 sm:p-8 text-white shadow-xl border border-gold-500/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gold-500/20 text-gold-300 border border-gold-400/30">
                  Owner Security Portal
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-olive-400"></span>
                <span className="text-xs text-beige-300/80">Authorized Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-gold-400 shrink-0" size={28} />
                <span>Security & PIN Management</span>
              </h1>
              <p className="text-sm text-beige-200/80 max-w-xl leading-relaxed">
                Configure your confidential access PIN, manage authorization caching on your MacBook and iPhone, and verify system storage connections.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold transition active:scale-[0.98]"
              >
                <LogOut size={15} />
                <span>Lock App & Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 3-Step PIN Change Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brown-100 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-brown-100/80 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-brown-900">
                      Change Access PIN
                    </h2>
                    <p className="text-xs text-brown-500">
                      3-Step verification to update system access PIN
                    </p>
                  </div>
                </div>
              </div>

              {/* Status alerts */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-3 animate-fade-in">
                  <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-0.5">Change Failed</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-3 animate-fade-in">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-0.5">Success!</span>
                    <span>{successMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-6">
                
                {/* STEP 1: Current PIN */}
                <div className="p-4 rounded-xl bg-beige-50/70 border border-brown-100/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brown-800 tracking-wider uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                      <span>Current Access PIN</span>
                    </label>
                    <span className="text-[11px] text-brown-500">Step 1 of 3</span>
                  </div>
                  <div className="relative mt-2">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      name="current-pin"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={12}
                      autoComplete="off"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter active PIN (default: 0690)"
                      className="input-field pr-11 w-full bg-white text-base tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((p) => !p)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brown-500 hover:text-brown-800 transition"
                      tabIndex={-1}
                      aria-label={showCurrent ? 'Hide current PIN' : 'Show current PIN'}
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* STEP 2: New PIN */}
                <div className="p-4 rounded-xl bg-beige-50/70 border border-brown-100/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brown-800 tracking-wider uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                      <span>New Access PIN</span>
                    </label>
                    <span className="text-[11px] text-brown-500">Step 2 of 3</span>
                  </div>
                  <div className="relative mt-2">
                    <input
                      type={showNew ? 'text' : 'password'}
                      name="new-pin"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={12}
                      autoComplete="off"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter new 4–12 digit PIN"
                      className="input-field pr-11 w-full bg-white text-base tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((p) => !p)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brown-500 hover:text-brown-800 transition"
                      tabIndex={-1}
                      aria-label={showNew ? 'Hide new PIN' : 'Show new PIN'}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPin && (
                    <div className="pt-1 flex items-center gap-2 text-[11px]">
                      <span className="text-brown-500">Length:</span>
                      <span className={`font-semibold ${newPin.length >= 4 ? 'text-emerald-600' : 'text-gold-700'}`}>
                        {newPin.length} digits {newPin.length >= 4 ? '✓' : '(minimum 4 required)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* STEP 3: Confirm New PIN */}
                <div className="p-4 rounded-xl bg-beige-50/70 border border-brown-100/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brown-800 tracking-wider uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                      <span>Confirm New PIN</span>
                    </label>
                    <span className="text-[11px] text-brown-500">Step 3 of 3</span>
                  </div>
                  <div className="relative mt-2">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm-pin"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={12}
                      autoComplete="off"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Re-type new numeric PIN to confirm"
                      className={`input-field pr-11 w-full bg-white text-base tracking-widest ${
                        isMatching ? 'border-emerald-500 focus:border-emerald-600' : ''
                      } ${isMismatch ? 'border-gold-400' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brown-500 hover:text-brown-800 transition"
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Hide confirm PIN' : 'Show confirm PIN'}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {isMatching && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 size={14} />
                      <span>New PIN and confirmation match perfectly.</span>
                    </div>
                  )}
                  {isMismatch && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-gold-700 font-medium">
                      <AlertTriangle size={14} />
                      <span>Confirmation does not match new PIN yet.</span>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !currentPin || !newPin || !confirmPin || isMismatch}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-md disabled:opacity-50 transition"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating System PIN...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={17} />
                      <span>Confirm & Change System PIN</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom reset option */}
              <div className="mt-6 pt-5 border-t border-brown-100 flex items-center justify-between text-xs text-brown-500">
                <span>Need to restore factory default PIN?</span>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-gold-700 hover:text-gold-800 font-semibold underline underline-offset-2 transition"
                >
                  Factory Default Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Session & Device Cache Control (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cache Control Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brown-100 space-y-5">
              <div className="flex items-center gap-3 border-b border-brown-100/80 pb-4">
                <div className="w-9 h-9 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center text-olive-700">
                  <Laptop size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-brown-900 text-base">
                    Device Authorization Cache
                  </h3>
                  <p className="text-xs text-brown-500">
                    Control how this device remembers access
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Option A: Ask Every Time */}
                <div
                  onClick={() => handleToggleMode('session')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition select-none flex items-start gap-3.5 ${
                    currentMode === 'session'
                      ? 'border-gold-500 bg-gold-50/40 shadow-sm'
                      : 'border-brown-200 hover:border-gold-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${currentMode === 'session' ? 'bg-gold-500 text-white' : 'bg-brown-100 text-brown-600'}`}>
                    <Lock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-brown-900 uppercase tracking-wide">
                        Require PIN Every Time
                      </h4>
                      {currentMode === 'session' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-200 text-gold-900 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brown-500 mt-1 leading-relaxed">
                      Session-only. As soon as you close your browser or tab, authorization is cleared and you must re-enter your PIN.
                    </p>
                  </div>
                </div>

                {/* Option B: Remember Device (Cached) */}
                <div
                  onClick={() => handleToggleMode('cache')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition select-none flex items-start gap-3.5 ${
                    currentMode === 'cache'
                      ? 'border-gold-500 bg-gold-50/40 shadow-sm'
                      : 'border-brown-200 hover:border-gold-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${currentMode === 'cache' ? 'bg-gold-500 text-white' : 'bg-brown-100 text-brown-600'}`}>
                    <Smartphone size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-brown-900 uppercase tracking-wide">
                        Remember This Device
                      </h4>
                      {currentMode === 'cache' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-200 text-gold-900 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brown-500 mt-1 leading-relaxed">
                      Saves authorized state in local storage cache. Quick 1-click access across visits without re-entering PIN.
                    </p>
                  </div>
                </div>
              </div>

              {isUpdatingMode && (
                <p className="text-xs text-gold-700 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Synchronizing preference across cloud...</span>
                </p>
              )}

              {/* Instant Clear Cache Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Lock size={14} />
                  <span>Clear Cache & Test Login Screen Now</span>
                </button>
              </div>
            </div>

            {/* Google Drive Master Link Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brown-100 space-y-4">
              <div className="flex items-center gap-3 border-b border-brown-100/80 pb-4">
                <div className="w-9 h-9 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
                  <HardDrive size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-brown-900 text-base">
                    Master Drive Storage
                  </h3>
                  <p className="text-xs text-brown-500">
                    High-capacity photos & video storage
                  </p>
                </div>
              </div>

              <p className="text-xs text-brown-600 leading-relaxed">
                Large 4K property walkthrough videos and high-resolution photo albums are organized on your dedicated Google Drive:
              </p>

              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-beige-50 border border-gold-200 text-brown-800 hover:bg-gold-50/50 hover:border-gold-400 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen size={18} className="text-gold-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Open Dayalwasi Drive Folder</span>
                </div>
                <ExternalLink size={14} className="text-brown-500 group-hover:text-gold-600" />
              </a>
            </div>

            {/* Mobile & Desktop App (PWA) Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-brown-100 space-y-4">
              <div className="flex items-center justify-between border-b border-brown-100/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brown-950 border border-gold-400/50 flex items-center justify-center text-gold-300 font-display font-bold text-sm">
                    D
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-900 text-base">
                      Mobile &amp; Desktop App
                    </h3>
                    <p className="text-xs text-brown-500">
                      Install on iPhone, Android &amp; MacBook
                    </p>
                  </div>
                </div>
                {isStandalone && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-olive-100 text-olive-800 border border-olive-300">
                    Installed
                  </span>
                )}
              </div>

              {isStandalone ? (
                <div className="p-3.5 rounded-xl bg-olive-50 border border-olive-200 flex items-center gap-2.5 text-olive-900 text-xs font-medium">
                  <CheckCircle2 size={16} className="text-olive-700 shrink-0" />
                  <span>Running natively in standalone app mode with automatic updates enabled.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-brown-600 leading-relaxed">
                    Add Dayalwasi Properties to your Home Screen or Dock for instant full-screen access without browser toolbars.
                  </p>
                  <button
                    type="button"
                    onClick={canInstallNative ? promptInstall : openGuide}
                    className="btn-gold w-full flex items-center justify-center gap-2 text-xs py-2.5"
                  >
                    <Download size={15} />
                    <span>
                      {canInstallNative
                        ? 'Install App on Device'
                        : isIos
                        ? 'How to Add on iPhone'
                        : 'Install App Instructions'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Cloud Status Info */}
            <div className="p-4 rounded-2xl bg-white border border-brown-100 text-xs text-brown-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-brown-700">Supabase Cloud Connected</span>
              </div>
              <span className="text-[11px] text-brown-500">Agra, India</span>
            </div>

          </div>
        </div>

        {/* Factory Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brown-200 space-y-4">
              <div className="flex items-center gap-3 text-gold-700">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-brown-900 text-base">
                    Reset to Factory PIN?
                  </h3>
                  <p className="text-xs text-brown-500">Restore default PIN: 0690</p>
                </div>
              </div>

              <p className="text-xs text-brown-600 leading-relaxed">
                This will reset your customized PIN back to the default factory PIN (<code className="bg-brown-100 px-1 py-0.5 rounded font-mono text-brown-800">0690</code>). Please enter your current PIN to confirm:
              </p>

              <div>
                <input
                  type="password"
                  name="reset-pin"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  autoComplete="off"
                  value={resetAuthPin}
                  onChange={(e) => setResetAuthPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter current PIN to verify"
                  className="input-field w-full text-base tracking-widest"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetAuthPin('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brown-600 hover:bg-brown-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFactoryReset}
                  disabled={!resetAuthPin.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition shadow"
                >
                  Confirm Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
