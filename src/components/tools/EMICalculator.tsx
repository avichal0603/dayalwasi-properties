'use client';

import React, { useState, useMemo } from 'react';
import {
  Percent,
  BadgePercent,
  Calendar,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Landmark,
  ShieldAlert,
} from 'lucide-react';
import { formatPrice, formatPriceINR } from '@/lib/constants';

export default function EMICalculator() {
  // Inputs with dual state (both input field & slider)
  const [loanAmount, setLoanAmount] = useState<number>(5000000); // Default 50 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // Default 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20); // Default 20 Years
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Total tenure in months
  const totalMonths = useMemo(() => {
    return tenureUnit === 'years' ? tenureYears * 12 : tenureYears;
  }, [tenureYears, tenureUnit]);

  // EMI Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
  const calculation = useMemo(() => {
    const P = loanAmount || 0;
    const annualR = interestRate || 0;
    const N = totalMonths || 1;

    if (P <= 0 || N <= 0) {
      return {
        monthlyEMI: 0,
        totalInterest: 0,
        totalPayment: 0,
        principalPct: 100,
        interestPct: 0,
      };
    }

    if (annualR === 0) {
      const emi = Math.round(P / N);
      return {
        monthlyEMI: emi,
        totalInterest: 0,
        totalPayment: P,
        principalPct: 100,
        interestPct: 0,
      };
    }

    const monthlyR = annualR / 12 / 100;
    const factor = Math.pow(1 + monthlyR, N);
    const emi = Math.round((P * monthlyR * factor) / (factor - 1));
    const totalPayment = emi * N;
    const totalInterest = Math.max(0, totalPayment - P);

    const principalPct = totalPayment > 0 ? (P / totalPayment) * 100 : 0;
    const interestPct = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

    return {
      monthlyEMI: emi,
      totalInterest,
      totalPayment,
      principalPct: Math.round(principalPct),
      interestPct: Math.round(interestPct),
    };
  }, [loanAmount, interestRate, totalMonths]);

  // Generate Year-by-Year Schedule (Amortization)
  const yearlySchedule = useMemo(() => {
    if (!showAmortization || loanAmount <= 0) return [];
    const monthlyR = interestRate / 12 / 100;
    const emi = calculation.monthlyEMI;
    let balance = loanAmount;
    const years: {
      year: number;
      principalPaid: number;
      interestPaid: number;
      balance: number;
    }[] = [];

    const numYears = Math.ceil(totalMonths / 12);
    for (let y = 1; y <= numYears; y++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        const currentMonthIndex = (y - 1) * 12 + m;
        if (currentMonthIndex > totalMonths || balance <= 0) break;

        const interestForMonth = balance * monthlyR;
        const principalForMonth = Math.min(balance, emi - interestForMonth);

        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance = Math.max(0, balance - principalForMonth);
      }

      years.push({
        year: y,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        balance: Math.round(balance),
      });

      if (balance <= 0) break;
    }
    return years;
  }, [showAmortization, loanAmount, interestRate, totalMonths, calculation.monthlyEMI]);

  const handleCopySummary = () => {
    const text = `Dayalwasi Loan Estimate:\nLoan: ₹${loanAmount.toLocaleString('en-IN')}\nRate: ${interestRate}%\nTenure: ${tenureYears} ${tenureUnit}\nMonthly EMI: ₹${calculation.monthlyEMI.toLocaleString('en-IN')}\nTotal Interest: ₹${calculation.totalInterest.toLocaleString('en-IN')}\nTotal Repayment: ₹${calculation.totalPayment.toLocaleString('en-IN')}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full text-brown-900 select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brown-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center">
            <Percent size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-brown-950">
              Home Loan & EMI Calculator
            </h3>
            <p className="text-[11px] text-brown-500">
              SBI, HDFC, ICICI & Real Estate Financing
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-gold-50 border border-brown-200 text-brown-700 hover:text-gold-800 transition flex items-center gap-1 shadow-2xs"
          title="Copy Loan Breakdown"
        >
          {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Main Results Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-950 text-white shadow-md border border-gold-500/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-gold-300 uppercase tracking-wider block">
              Monthly Repayment (EMI)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-display font-bold text-gold-400 tracking-tight">
                {formatPriceINR(calculation.monthlyEMI)}
              </span>
              <span className="text-xs text-beige-300">/ month</span>
            </div>
            <span className="text-[11px] text-beige-300/80 block mt-0.5">
              Principal: {formatPrice(loanAmount)} • Rate: {interestRate}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-right sm:border-l sm:border-white/10 sm:pl-4">
            <div>
              <span className="text-[10px] text-beige-400 uppercase tracking-wider block">
                Total Interest
              </span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {formatPriceINR(calculation.totalInterest)}
              </span>
              <span className="text-[10px] text-gold-300/80 block">
                ({calculation.interestPct}% of total)
              </span>
            </div>

            <div>
              <span className="text-[10px] text-beige-400 uppercase tracking-wider block">
                Total Amount
              </span>
              <span className="text-sm font-bold text-gold-300 block mt-0.5">
                {formatPriceINR(calculation.totalPayment)}
              </span>
              <span className="text-[10px] text-beige-300/80 block">
                ({formatPrice(calculation.totalPayment)})
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Ratio Bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-[10px] font-semibold text-beige-300 mb-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold-400 inline-block"></span>
              Principal: {calculation.principalPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-olive-400 inline-block"></span>
              Interest: {calculation.interestPct}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden flex">
            <div
              className="h-full bg-gold-400 transition-all duration-300"
              style={{ width: `${calculation.principalPct}%` }}
            />
            <div
              className="h-full bg-olive-400 transition-all duration-300"
              style={{ width: `${calculation.interestPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sliders and Direct Inputs */}
      <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
        
        {/* 1. Loan Amount */}
        <div className="p-3.5 rounded-xl bg-beige-50/70 border border-brown-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brown-800 uppercase tracking-wider">
              1. Loan Amount (ऋण राशि)
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-brown-900">₹</span>
              <input
                type="number"
                min="50000"
                max="100000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                className="input-field !py-1 !px-2.5 w-32 font-bold text-right text-sm bg-white"
              />
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="100000"
            max="30000000"
            step="50000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-gold-600 cursor-pointer"
          />

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-brown-400 font-medium">Quick:</span>
            {[
              { label: '₹20L', val: 2000000 },
              { label: '₹35L', val: 3500000 },
              { label: '₹50L', val: 5000000 },
              { label: '₹75L', val: 7500000 },
              { label: '₹1 Cr', val: 10000000 },
              { label: '₹2 Cr', val: 20000000 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setLoanAmount(p.val)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition ${
                  loanAmount === p.val
                    ? 'bg-gold-500 text-white border-gold-600'
                    : 'bg-white text-brown-700 border-brown-200 hover:bg-gold-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Interest Rate */}
        <div className="p-3.5 rounded-xl bg-beige-50/70 border border-brown-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brown-800 uppercase tracking-wider">
              2. Interest Rate (ब्याज दर % p.a.)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="25"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                className="input-field !py-1 !px-2.5 w-24 font-bold text-right text-sm bg-white"
              />
              <span className="text-xs font-bold text-brown-700">%</span>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="6.0"
            max="15.0"
            step="0.05"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-gold-600 cursor-pointer"
          />

          {/* Bank Benchmark Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-brown-400 font-medium">Banks:</span>
            {[
              { label: 'SBI (8.40%)', val: 8.4 },
              { label: 'HDFC (8.65%)', val: 8.65 },
              { label: 'ICICI (8.75%)', val: 8.75 },
              { label: 'Commercial (9.5%)', val: 9.5 },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setInterestRate(b.val)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition ${
                  interestRate === b.val
                    ? 'bg-gold-500 text-white border-gold-600'
                    : 'bg-white text-brown-700 border-brown-200 hover:bg-gold-50'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Loan Tenure */}
        <div className="p-3.5 rounded-xl bg-beige-50/70 border border-brown-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brown-800 uppercase tracking-wider">
              3. Loan Tenure (अवधि)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max={tenureUnit === 'years' ? 35 : 420}
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                className="input-field !py-1 !px-2.5 w-20 font-bold text-right text-sm bg-white"
              />
              <div className="flex bg-white rounded-lg border border-brown-200 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTenureUnit('years')}
                  className={`px-1.5 py-0.5 rounded font-semibold ${
                    tenureUnit === 'years' ? 'bg-gold-500 text-white' : 'text-brown-600'
                  }`}
                >
                  Yrs
                </button>
                <button
                  type="button"
                  onClick={() => setTenureUnit('months')}
                  className={`px-1.5 py-0.5 rounded font-semibold ${
                    tenureUnit === 'months' ? 'bg-gold-500 text-white' : 'text-brown-600'
                  }`}
                >
                  Mos
                </button>
              </div>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="1"
            max={tenureUnit === 'years' ? 30 : 360}
            step="1"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-gold-600 cursor-pointer"
          />

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-brown-400 font-medium">Quick:</span>
            {[5, 10, 15, 20, 25, 30].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  setTenureUnit('years');
                  setTenureYears(yr);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition ${
                  tenureYears === yr && tenureUnit === 'years'
                    ? 'bg-gold-500 text-white border-gold-600'
                    : 'bg-white text-brown-700 border-brown-200 hover:bg-gold-50'
                }`}
              >
                {yr} Yrs
              </button>
            ))}
          </div>
        </div>

        {/* Amortization Schedule Accordion Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            className="w-full py-2 px-3 rounded-xl bg-white border border-brown-200 text-brown-800 hover:bg-gold-50 text-xs font-semibold flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gold-600" />
              <span>Year-by-Year Amortization Schedule</span>
            </div>
            {showAmortization ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAmortization && (
            <div className="mt-2 rounded-xl border border-brown-200 bg-white overflow-hidden shadow-xs animate-fade-in text-xs">
              <div className="grid grid-cols-4 bg-beige-100 p-2 font-bold text-brown-800 border-b border-brown-200 text-[11px]">
                <span>Year</span>
                <span className="text-right">Principal</span>
                <span className="text-right">Interest</span>
                <span className="text-right">Balance</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-brown-100">
                {yearlySchedule.map((row) => (
                  <div
                    key={row.year}
                    className="grid grid-cols-4 p-2 text-brown-700 hover:bg-beige-50/60"
                  >
                    <span className="font-semibold text-brown-900">Year {row.year}</span>
                    <span className="text-right text-gold-700 font-medium">
                      ₹{row.principalPaid.toLocaleString('en-IN')}
                    </span>
                    <span className="text-right text-olive-800 font-medium">
                      ₹{row.interestPaid.toLocaleString('en-IN')}
                    </span>
                    <span className="text-right text-brown-900 font-semibold">
                      ₹{row.balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
