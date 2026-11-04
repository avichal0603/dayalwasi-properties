'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Ruler,
  Percent,
  Calculator as CalcIcon,
  X,
  ChevronUp,
} from 'lucide-react';
import LandUnitConverter from '../tools/LandUnitConverter';
import EMICalculator from '../tools/EMICalculator';
import StandardCalculator from '../tools/StandardCalculator';
import AIChatbot from '../chat/AIChatbot';

type ActiveTool = 'none' | 'ai' | 'converter' | 'emi' | 'calculator';

export default function RealEstateDock() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing collapse timer
  const clearCollapseTimer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  // Schedule auto-collapse
  const scheduleAutoCollapse = (delayMs: number = 2200) => {
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, delayMs);
  };

  // Desktop Hover: Expand on mouse enter, auto-collapse on mouse leave
  const handleMouseEnter = () => {
    clearCollapseTimer();
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    scheduleAutoCollapse(1200);
  };

  // Mobile / Touch: Toggle expansion, auto-collapse after 3.5s of inactivity
  const handlePillClick = () => {
    setIsExpanded(true);
    scheduleAutoCollapse(3500);
  };

  // Auto-collapse immediately whenever the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      clearCollapseTimer();
      setIsExpanded(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearCollapseTimer();
    };
  }, []);

  // Handle clicking a tool
  const handleSelectTool = (tool: ActiveTool) => {
    clearCollapseTimer();
    setActiveTool((prev) => (prev === tool ? 'none' : tool));
    // Auto-collapse dock when a tool is triggered
    setIsExpanded(false);
  };

  // Close tool on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTool !== 'none') {
        setActiveTool('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool]);

  return (
    <>
      {/* Active Tool Modal / Dialog Backdrop */}
      {activeTool !== 'none' && activeTool !== 'ai' && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setActiveTool('none')}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-gold-300/80 max-h-[90vh] overflow-y-auto animate-scale-in relative selection:bg-gold-500 selection:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setActiveTool('none')}
              className="absolute top-4 right-4 p-2 rounded-full text-brown-400 hover:text-brown-900 hover:bg-beige-100 transition"
              aria-label="Close Tool"
            >
              <X size={20} />
            </button>

            {/* Render Selected Tool */}
            {activeTool === 'converter' && <LandUnitConverter />}
            {activeTool === 'emi' && <EMICalculator />}
            {activeTool === 'calculator' && <StandardCalculator />}
          </div>
        </div>
      )}

      {/* Standalone AI Chatbot when AI tool is active */}
      <AIChatbot
        isOpen={activeTool === 'ai'}
        onOpenChange={(open) => setActiveTool(open ? 'ai' : 'none')}
        hideTrigger={true}
      />

      {/* Center Floating Dock with Automatic Minimization */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-all duration-300 ease-out"
        style={{
          bottom: 'max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isExpanded ? (
          /* Minimized State: Sleek Luxury Floating Micro-Pill */
          <button
            type="button"
            onClick={handlePillClick}
            aria-label="Open Real Estate Tools"
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-brown-950/90 backdrop-blur-xl border border-gold-400/40 text-gold-300 shadow-2xl hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
            </span>
            <span className="text-xs font-display font-semibold tracking-wider text-gold-200 group-hover:text-gold-100">
              Dayalwasi Tools &amp; AI
            </span>
            <ChevronUp size={14} className="text-gold-400 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        ) : (
          /* Expanded State: Automatically opens on hover/touch, auto-collapses on leave/scroll/idle */
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-brown-950/95 via-brown-900/95 to-brown-950/95 backdrop-blur-2xl border border-gold-500/40 shadow-2xl shadow-brown-950/70 ring-1 ring-white/10 animate-scale-in">
            {/* 1. Dayalwasi AI Button */}
            <button
              type="button"
              onClick={() => handleSelectTool('ai')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                activeTool === 'ai'
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-white shadow-gold'
                  : 'text-beige-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <Sparkles
                  size={16}
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    activeTool === 'ai' ? 'text-white' : 'text-gold-400'
                  }`}
                />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping opacity-75" />
              </div>
              <span className="font-display tracking-wide">Dayalwasi AI</span>
              <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-olive-500/30 text-olive-300 border border-olive-400/30">
                GPT
              </span>
            </button>

            {/* Divider */}
            <div className="h-5 w-[1px] bg-white/15 mx-0.5" />

            {/* 2. Indian Land Unit Converter */}
            <button
              type="button"
              onClick={() => handleSelectTool('converter')}
              title="Indian Land Area Converter (Gaj, Sq.Ft, Bigha, Biswa, Acre)"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                activeTool === 'converter'
                  ? 'bg-gold-500 text-white shadow-gold'
                  : 'text-beige-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Ruler
                size={16}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  activeTool === 'converter' ? 'text-white' : 'text-gold-400'
                }`}
              />
              <span className="hidden sm:inline">Converter</span>
              <span className="text-[10px] sm:hidden">Gaj/SqFt</span>
            </button>

            {/* 3. EMI & Loan Calculator */}
            <button
              type="button"
              onClick={() => handleSelectTool('emi')}
              title="Home Loan EMI Calculator with Sliders"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                activeTool === 'emi'
                  ? 'bg-gold-500 text-white shadow-gold'
                  : 'text-beige-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Percent
                size={15}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  activeTool === 'emi' ? 'text-white' : 'text-gold-400'
                }`}
              />
              <span>EMI Calc</span>
            </button>

            {/* 4. Real Estate Financial Calculator */}
            <button
              type="button"
              onClick={() => handleSelectTool('calculator')}
              title="Standard Real Estate Calculator (+Brokerage, +Stamp Duty)"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                activeTool === 'calculator'
                  ? 'bg-gold-500 text-white shadow-gold'
                  : 'text-beige-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalcIcon
                size={15}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  activeTool === 'calculator' ? 'text-white' : 'text-gold-400'
                }`}
              />
              <span className="hidden sm:inline">Calculator</span>
              <span className="sm:hidden text-xs">Calc</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
