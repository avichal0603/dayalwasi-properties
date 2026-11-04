'use client';

import React, { useState, useMemo } from 'react';
import {
  Ruler,
  Copy,
  Check,
  Info,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { formatPriceINR, formatPrice } from '@/lib/constants';

// Standard Land Area Conversion factors relative to 1 GAJ (Square Yard)
// In Agra / Western UP: 1 Pucca Bigha = 3,025 Gaj = 27,225 sq ft
export interface UnitDef {
  id: string;
  name: string;
  nameHindi: string;
  gajFactor: number;
  description: string;
}

export const INDIAN_LAND_UNITS: UnitDef[] = [
  {
    id: 'gaj',
    name: 'Gaj (Sq Yard)',
    nameHindi: 'वर्ग गज',
    gajFactor: 1,
    description: 'Dayalbagh standard unit (1 Gaj = 9 sq ft)',
  },
  {
    id: 'sqft',
    name: 'Square Feet',
    nameHindi: 'वर्ग फुट',
    gajFactor: 1 / 9,
    description: '1 sq ft = 0.111 Gaj (9 sq ft = 1 Gaj)',
  },
  {
    id: 'bigha_pucca',
    name: 'Bigha (Pucca / UP)',
    nameHindi: 'पक्का बीघा',
    gajFactor: 3025,
    description: 'Agra/Western UP standard (3,025 Gaj = 27,225 sq ft)',
  },
  {
    id: 'biswa',
    name: 'Biswa',
    nameHindi: 'बिस्वा',
    gajFactor: 3025 / 20, // 151.25 Gaj
    description: '1/20th of Pucca Bigha (151.25 Gaj = 1,361.25 sq ft)',
  },
  {
    id: 'biswansi',
    name: 'Biswansi',
    nameHindi: 'बिस्वांसी',
    gajFactor: 3025 / 400, // 7.5625 Gaj
    description: '1/20th of Biswa (7.56 Gaj = 68.06 sq ft)',
  },
  {
    id: 'bigha_kaccha',
    name: 'Bigha (Kaccha)',
    nameHindi: 'कच्चा बीघा',
    gajFactor: 1008.3333,
    description: 'Approx 1/3 of Pucca Bigha (1,008.33 Gaj = 9,075 sq ft)',
  },
  {
    id: 'acre',
    name: 'Acre',
    nameHindi: 'एकड़',
    gajFactor: 4840,
    description: '1 Acre = 4,840 Gaj = 43,560 sq ft (1.6 Bigha)',
  },
  {
    id: 'hectare',
    name: 'Hectare',
    nameHindi: 'हेक्टेयर',
    gajFactor: 11959.9,
    description: '1 Hectare = 10,000 sq m = 11,960 Gaj = 2.47 Acres',
  },
  {
    id: 'sqm',
    name: 'Square Meter',
    nameHindi: 'वर्ग मीटर',
    gajFactor: 1.19599,
    description: '1 sq m = 1.196 Gaj = 10.764 sq ft',
  },
  {
    id: 'marla',
    name: 'Marla',
    nameHindi: 'मरला',
    gajFactor: 25,
    description: '1 Marla = 25 Gaj = 225 sq ft',
  },
  {
    id: 'kanal',
    name: 'Kanal',
    nameHindi: 'कनाल',
    gajFactor: 500,
    description: '1 Kanal = 20 Marla = 500 Gaj = 4,500 sq ft',
  },
];

export default function LandUnitConverter() {
  const [activeTab, setActiveTab] = useState<'multi' | 'rate'>('multi');

  // Multi-unit converter state
  const [inputVal, setInputVal] = useState<string>('100');
  const [selectedUnit, setSelectedUnit] = useState<string>('gaj');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rate calculator state
  const [ratePerGaj, setRatePerGaj] = useState<string>('45000');
  const [plotAreaGaj, setPlotAreaGaj] = useState<string>('150');

  // Convert input value to Gaj
  const currentGaj = useMemo(() => {
    const num = parseFloat(inputVal) || 0;
    const unitObj = INDIAN_LAND_UNITS.find((u) => u.id === selectedUnit);
    if (!unitObj) return num;
    return num * unitObj.gajFactor;
  }, [inputVal, selectedUnit]);

  // Convert Gaj to all other units
  const conversions = useMemo(() => {
    return INDIAN_LAND_UNITS.map((u) => {
      const converted = currentGaj / u.gajFactor;
      let displayStr: string;
      if (converted === 0) {
        displayStr = '0';
      } else if (converted >= 1000) {
        displayStr = converted.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      } else if (converted >= 1) {
        displayStr = converted.toLocaleString('en-IN', { maximumFractionDigits: 3 });
      } else {
        displayStr = converted.toFixed(4);
      }
      return {
        ...u,
        value: converted,
        display: displayStr,
      };
    });
  }, [currentGaj]);

  // Handle copy
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Rate calculator computations
  const ratePerGajNum = parseFloat(ratePerGaj) || 0;
  const plotAreaGajNum = parseFloat(plotAreaGaj) || 0;

  const totalCost = ratePerGajNum * plotAreaGajNum;
  const ratePerSqFt = ratePerGajNum > 0 ? Math.round(ratePerGajNum / 9) : 0;
  const ratePerBigha = ratePerGajNum * 3025;
  const ratePerAcre = ratePerGajNum * 4840;
  const stampDuty7Pct = Math.round(totalCost * 0.07);
  const brokerage1Pct = Math.round(totalCost * 0.01);
  const brokerage2Pct = Math.round(totalCost * 0.02);

  return (
    <div className="w-full text-brown-900 select-none space-y-4">
      {/* Header Tabs (Matching Calculator Theme) */}
      <div className="flex items-center justify-between border-b border-brown-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center">
            <Ruler size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-brown-950">
              Indian Land Unit Converter
            </h3>
            <p className="text-[11px] text-brown-500">
              Agra &amp; Western UP Real Estate Standards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-brown-950/80 p-1 rounded-xl border border-gold-500/30 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('multi')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'multi'
                ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-white shadow-sm'
                : 'text-beige-300 hover:text-white'
            }`}
          >
            Area Units
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rate')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'rate'
                ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-white shadow-sm'
                : 'text-beige-300 hover:text-white'
            }`}
          >
            Price &amp; Stamp
          </button>
        </div>
      </div>

      {activeTab === 'multi' ? (
        <div className="space-y-4">
          {/* Main Hero Display Card (Matching Standard & EMI Calculators) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-950 text-white shadow-md border border-gold-500/40 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-gold-300 uppercase tracking-wider">
              <span>Enter Land Area</span>
              <span className="text-beige-300 font-medium">1 Gaj = 9 Sq.Ft</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Enter area..."
                  className="w-full bg-transparent text-2xl sm:text-3xl font-display font-bold text-gold-300 placeholder:text-gold-300/30 border-b border-gold-400/40 pb-1 focus:outline-none focus:border-gold-300 tracking-tight"
                  autoFocus
                />
              </div>

              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-white/10 text-gold-200 border border-gold-400/30 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer backdrop-blur-sm"
              >
                {INDIAN_LAND_UNITS.map((u) => (
                  <option key={u.id} value={u.id} className="bg-brown-950 text-white">
                    {u.name} ({u.nameHindi})
                  </option>
                ))}
              </select>
            </div>

            {/* Equivalent live banner */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-beige-300 flex-wrap gap-1">
              <span>
                Standard Dayalbagh Area:{' '}
                <strong className="text-gold-300 font-bold">
                  {currentGaj.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Gaj
                </strong>{' '}
                <span className="text-beige-300/80">({Math.round(currentGaj * 9).toLocaleString('en-IN')} sq ft)</span>
              </span>
            </div>

            {/* Quick Preset Buttons (Matching Calculator Styling) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-gold-300/80 font-semibold mr-1">Presets:</span>
              {[
                { label: '50 Gaj', val: '50', unit: 'gaj' },
                { label: '100 Gaj', val: '100', unit: 'gaj' },
                { label: '150 Gaj', val: '150', unit: 'gaj' },
                { label: '200 Gaj', val: '200', unit: 'gaj' },
                { label: '500 Gaj', val: '500', unit: 'gaj' },
                { label: '1 Bigha (Pucca)', val: '1', unit: 'bigha_pucca' },
                { label: '1 Acre', val: '1', unit: 'acre' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setInputVal(p.val);
                    setSelectedUnit(p.unit);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition border ${
                    inputVal === p.val && selectedUnit === p.unit
                      ? 'bg-gold-500 text-white border-gold-400 shadow-sm'
                      : 'bg-white/10 text-beige-200 hover:bg-white/20 hover:text-white border-white/15'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Converted Units Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {conversions.map((conv) => {
              const isSelected = conv.id === selectedUnit;
              const isCopied = copiedId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleCopy(`${conv.display} ${conv.name}`, conv.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gold-50/90 border-gold-500 shadow-sm ring-1 ring-gold-400/50'
                      : 'bg-white hover:bg-beige-50/80 border-brown-200/80 hover:border-gold-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">
                        {conv.nameHindi}
                      </span>
                      <span className="text-xs font-semibold text-brown-900 block truncate">
                        {conv.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-brown-400 group-hover:text-gold-700 transition p-1"
                      title="Copy"
                    >
                      {isCopied ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  <div className="mt-2">
                    <span className="text-base font-bold text-brown-950 block tracking-tight truncate">
                      {conv.display}
                    </span>
                    <span className="text-[10px] text-brown-400 truncate block mt-0.5">
                      {conv.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Note about Western UP Standards */}
          <div className="p-2.5 rounded-xl bg-beige-50 border border-brown-200/60 text-[11px] text-brown-600 flex items-start gap-2">
            <Info size={15} className="text-gold-600 shrink-0 mt-0.5" />
            <span>
              <strong>Agra / Dayalbagh Standard:</strong> 1 Gaj = 9 sq.ft. 1 Pucca Bigha = 20 Biswa = 3,025 Gaj = 27,225 sq.ft. 1 Acre = 1.6 Pucca Bigha.
            </span>
          </div>
        </div>
      ) : (
        /* Rate & Price Estimator Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-beige-50/80 border border-brown-200/80">
            <div>
              <label className="text-[11px] font-bold text-brown-700 uppercase tracking-wider mb-1 block">
                Rate per Gaj (₹ / गज)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brown-400 text-sm font-semibold pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={ratePerGaj}
                  onChange={(e) => setRatePerGaj(e.target.value)}
                  placeholder="e.g. 45000"
                  className="input-field pl-7 w-full font-bold text-base bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-brown-700 uppercase tracking-wider mb-1 block">
                Plot Area in Gaj (गज)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={plotAreaGaj}
                  onChange={(e) => setPlotAreaGaj(e.target.value)}
                  placeholder="e.g. 150"
                  className="input-field w-full font-bold text-base bg-white"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-brown-400 text-xs font-semibold pointer-events-none">
                  गज
                </span>
              </div>
            </div>
          </div>

          {/* Results Summary Cards */}
          <div className="space-y-2.5">
            {/* Total Property Value */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-950 text-white shadow-md border border-gold-500/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gold-300 font-bold uppercase tracking-wider block">
                  Total Property Cost
                </span>
                <span className="text-xl sm:text-2xl font-display font-bold text-gold-400 tracking-tight">
                  {formatPriceINR(totalCost)}
                </span>
                <span className="text-xs text-beige-300 block mt-0.5">
                  ({formatPrice(totalCost)})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-beige-400 block">Total Area</span>
                <span className="text-sm font-bold text-white block">
                  {plotAreaGajNum} Gaj
                </span>
                <span className="text-[11px] text-gold-300/80 block">
                  ({plotAreaGajNum * 9} sq.ft.)
                </span>
              </div>
            </div>

            {/* Equivalent Rates Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-brown-200">
                <span className="text-brown-500 block text-[10px] font-semibold uppercase">
                  Rate per Sq.Ft.
                </span>
                <span className="text-sm font-bold text-brown-900 block mt-0.5">
                  ₹{ratePerSqFt.toLocaleString('en-IN')} / sq ft
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-brown-200">
                <span className="text-brown-500 block text-[10px] font-semibold uppercase">
                  Rate per Bigha (Pucca)
                </span>
                <span className="text-sm font-bold text-brown-900 block mt-0.5 truncate">
                  {formatPrice(ratePerBigha)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-brown-200">
                <span className="text-brown-500 block text-[10px] font-semibold uppercase">
                  Approx. Stamp Duty (UP 7%)
                </span>
                <span className="text-sm font-bold text-olive-800 block mt-0.5">
                  ₹{stampDuty7Pct.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-brown-200">
                <span className="text-brown-500 block text-[10px] font-semibold uppercase">
                  Brokerage (1% - 2%)
                </span>
                <span className="text-sm font-bold text-gold-700 block mt-0.5">
                  ₹{brokerage1Pct.toLocaleString('en-IN')} - ₹{brokerage2Pct.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
