'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator as CalcIcon,
  Delete,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function StandardCalculator() {
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [history, setHistory] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Clear all
  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHistory('');
  };

  // Backspace
  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  // Number input
  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  // Decimal point
  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Toggle plus/minus
  const handleToggleSign = () => {
    const val = parseFloat(display);
    if (val === 0) return;
    setDisplay(String(-val));
  };

  // Percentage
  const handlePercentage = () => {
    const val = parseFloat(display);
    if (val === 0) return;
    setDisplay(String(val / 100));
  };

  // Perform calculation
  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
      case '*':
        return first * second;
      case '÷':
      case '/':
        return second === 0 ? 0 : first / second;
      default:
        return second;
    }
  };

  // Handle operator
  const handleOperator = (nextOp: string) => {
    const currentVal = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(currentVal);
      setHistory(`${currentVal} ${nextOp}`);
    } else if (operator && !waitingForOperand) {
      const result = calculate(prevValue, currentVal, operator);
      setDisplay(String(Number(result.toFixed(6))));
      setPrevValue(result);
      setHistory(`${Number(result.toFixed(6))} ${nextOp}`);
    } else {
      setHistory(`${prevValue} ${nextOp}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  };

  // Handle equals
  const handleEquals = () => {
    const currentVal = parseFloat(display);
    if (operator && prevValue !== null) {
      const result = calculate(prevValue, currentVal, operator);
      setHistory(`${prevValue} ${operator} ${currentVal} =`);
      setDisplay(String(Number(result.toFixed(6))));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  // Real estate quick action shortcuts
  const handleQuickAction = (action: string) => {
    const currentVal = parseFloat(display) || 0;
    if (currentVal === 0) return;

    let res = 0;
    let label = '';

    switch (action) {
      case 'brok1':
        res = currentVal * 0.01;
        label = `1% Brokerage on ${currentVal}`;
        break;
      case 'brok2':
        res = currentVal * 0.02;
        label = `2% Brokerage on ${currentVal}`;
        break;
      case 'stamp7':
        res = currentVal * 0.07;
        label = `7% UP Stamp Duty on ${currentVal}`;
        break;
      case 'sqft_to_gaj':
        res = currentVal / 9;
        label = `${currentVal} sq.ft. ÷ 9`;
        break;
      case 'gaj_to_sqft':
        res = currentVal * 9;
        label = `${currentVal} Gaj × 9`;
        break;
    }

    setHistory(label + ' =');
    setDisplay(String(Number(res.toFixed(4))));
    setWaitingForOperand(true);
  };

  // Copy result to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Format display with commas for readability if it's integer or clean decimal
  const formattedDisplay = () => {
    if (display.includes('.')) {
      const [intPart, decPart] = display.split('.');
      const formattedInt = Number(intPart).toLocaleString('en-IN');
      return `${formattedInt}.${decPart}`;
    }
    const num = Number(display);
    if (isNaN(num)) return display;
    return num.toLocaleString('en-IN');
  };

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        handleOperator(e.key);
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="w-full text-brown-900 select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brown-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center">
            <CalcIcon size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-brown-950">
              Real Estate Calculator
            </h3>
            <p className="text-[11px] text-brown-500">
              Standard Math & Quick Property Brokerage / Stamp Duty
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-gold-50 border border-brown-200 text-brown-700 hover:text-gold-800 transition flex items-center gap-1 shadow-2xs"
          title="Copy Display"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Calculator Display */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-950 text-white shadow-md border border-gold-500/40 text-right overflow-hidden">
        <div className="h-5 text-xs text-gold-300/80 font-mono tracking-wider truncate mb-1">
          {history || ' '}
        </div>
        <div className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-gold-300 truncate">
          {formattedDisplay()}
        </div>
      </div>

      {/* Real Estate Quick Shortcuts Bar */}
      <div className="grid grid-cols-5 gap-1.5 pt-1">
        {[
          { id: 'brok1', label: '+1% Brok', hint: '1% Brokerage' },
          { id: 'brok2', label: '+2% Brok', hint: '2% Brokerage' },
          { id: 'stamp7', label: '+7% Stamp', hint: 'UP Registry 7%' },
          { id: 'sqft_to_gaj', label: 'SqFt ÷ 9', hint: 'Convert to Gaj' },
          { id: 'gaj_to_sqft', label: 'Gaj × 9', hint: 'Convert to SqFt' },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => handleQuickAction(btn.id)}
            title={btn.hint}
            className="py-1.5 px-1 rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-900 font-bold text-[10px] sm:text-[11px] border border-gold-200 transition active:scale-95 shadow-2xs text-center truncate"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {/* Row 1 */}
        <button
          type="button"
          onClick={handleClear}
          className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm transition active:scale-95 border border-red-200"
        >
          AC
        </button>
        <button
          type="button"
          onClick={handleToggleSign}
          className="p-3 rounded-xl bg-beige-100 hover:bg-beige-200 text-brown-800 font-bold text-sm transition active:scale-95 border border-brown-200"
        >
          +/-
        </button>
        <button
          type="button"
          onClick={handlePercentage}
          className="p-3 rounded-xl bg-beige-100 hover:bg-beige-200 text-brown-800 font-bold text-sm transition active:scale-95 border border-brown-200"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => handleOperator('÷')}
          className={`p-3 rounded-xl font-bold text-base transition active:scale-95 border ${
            operator === '÷'
              ? 'bg-gold-600 text-white border-gold-700 shadow-sm'
              : 'bg-gold-500 hover:bg-gold-600 text-white border-gold-600'
          }`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => handleDigit('7')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleDigit('8')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleDigit('9')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleOperator('×')}
          className={`p-3 rounded-xl font-bold text-base transition active:scale-95 border ${
            operator === '×'
              ? 'bg-gold-600 text-white border-gold-700 shadow-sm'
              : 'bg-gold-500 hover:bg-gold-600 text-white border-gold-600'
          }`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => handleDigit('4')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleDigit('5')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleDigit('6')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleOperator('-')}
          className={`p-3 rounded-xl font-bold text-base transition active:scale-95 border ${
            operator === '-'
              ? 'bg-gold-600 text-white border-gold-700 shadow-sm'
              : 'bg-gold-500 hover:bg-gold-600 text-white border-gold-600'
          }`}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => handleDigit('1')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleDigit('2')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleDigit('3')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleOperator('+')}
          className={`p-3 rounded-xl font-bold text-base transition active:scale-95 border ${
            operator === '+'
              ? 'bg-gold-600 text-white border-gold-700 shadow-sm'
              : 'bg-gold-500 hover:bg-gold-600 text-white border-gold-600'
          }`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDecimal}
          className="p-3 rounded-xl bg-white hover:bg-beige-50 text-brown-900 font-bold text-base transition active:scale-95 border border-brown-200 shadow-2xs"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="p-3 rounded-xl bg-beige-100 hover:bg-beige-200 text-brown-700 font-bold text-sm transition active:scale-95 border border-brown-200 flex items-center justify-center"
          title="Backspace"
        >
          <Delete size={17} />
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="p-3 rounded-xl bg-gradient-to-r from-gold-600 to-amber-600 text-white font-bold text-lg shadow-md transition active:scale-95 hover:opacity-95"
        >
          =
        </button>
      </div>
    </div>
  );
}
