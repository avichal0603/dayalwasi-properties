'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Building2, MapPin, Sparkles, Bot } from 'lucide-react';
import { Property, PropertyType } from '@/lib/types';
import { formatPrice, PROPERTY_TYPE_LABELS, DAYALBAGH_COLONIES } from '@/lib/constants';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  results?: Property[];
}

import { useProperties } from '@/hooks/useProperties';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'bot',
  text: 'Namaste! 🏠 I can help you search properties. Try asking:\n• "Properties in Tulsi Vihar"\n• "Plots under 50 lakh"\n• "Available 3 BHK houses"'
};

interface AIChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export default function AIChatbot({
  isOpen: controlledIsOpen,
  onOpenChange,
  hideTrigger = false,
}: AIChatbotProps = {}) {
  const { properties } = useProperties();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (val: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(val);
    }
    onOpenChange?.(val);
  };

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const parseQuery = (text: string) => {
    const query = text.toLowerCase();
    let priceMax: number | null = null;
    let priceMin: number | null = null;
    let colonyMatch: string | null = null;
    let typeMatch: PropertyType | null = null;
    let bhkMatch: string | null = null;
    let areaMin: number | null = null;
    let areaMax: number | null = null;
    let isAvailable: boolean | null = null;

    // Parse Price
    const priceRegex = /(\d+(?:\.\d+)?)\s*(lakh|l|crore|cr)/gi;
    let match;
    while ((match = priceRegex.exec(query)) !== null) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      let multiplier = 1;
      if (unit.startsWith('l')) multiplier = 100000;
      if (unit.startsWith('c')) multiplier = 10000000;
      
      const numValue = val * multiplier;
      
      if (query.includes('under') || query.includes('below') || query.includes('less than') || query.includes('max')) {
        priceMax = numValue;
      } else if (query.includes('above') || query.includes('over') || query.includes('more than') || query.includes('min')) {
        priceMin = numValue;
      } else if (!priceMax && !priceMin) {
        priceMax = numValue; // default to max if ambiguous
      }
    }

    // Parse Colony
    for (const c of DAYALBAGH_COLONIES) {
      if (query.includes(c.toLowerCase())) {
        colonyMatch = c;
        break;
      }
    }

    // Parse Type
    if (query.includes('plot') || query.includes('land')) typeMatch = 'plot';
    else if (query.includes('house') || query.includes('villa')) typeMatch = 'house';
    else if (query.includes('flat') || query.includes('apartment')) typeMatch = 'flat';
    else if (query.includes('commercial') || query.includes('shop') || query.includes('office')) typeMatch = 'commercial';
    else if (query.includes('floor')) typeMatch = 'floor';

    // Parse BHK
    const bhkRegex = /(\d)\s*bhk/i;
    const bMatch = query.match(bhkRegex);
    if (bMatch) {
      const b = parseInt(bMatch[1]);
      if (b >= 1 && b <= 5) bhkMatch = b.toString();
    }

    // Parse Area
    const areaRegex = /(\d+)\s*gaj/i;
    const aMatch = query.match(areaRegex);
    if (aMatch) {
      const a = parseInt(aMatch[1]);
      if (query.includes('above') || query.includes('over')) {
        areaMin = a;
      } else if (query.includes('under') || query.includes('below')) {
        areaMax = a;
      } else {
        areaMin = a - 20;
        areaMax = a + 20;
      }
    }

    // Parse Availability
    if (query.includes('available')) isAvailable = true;
    if (query.includes('sold')) isAvailable = false;

    // Filter properties
    let results = properties.filter(p => {
      if (colonyMatch && p.colony.toLowerCase() !== colonyMatch.toLowerCase()) return false;
      if (typeMatch && p.property_type !== typeMatch) return false;
      if (priceMax && p.price > priceMax) return false;
      if (priceMin && p.price < priceMin) return false;
      if (bhkMatch && p.bhk !== bhkMatch) return false;
      if (areaMin && p.area_gaj < areaMin) return false;
      if (areaMax && p.area_gaj > areaMax) return false;
      if (isAvailable !== null) {
        if (isAvailable && p.availability !== 'available') return false;
        if (!isAvailable && p.availability !== 'sold') return false;
      }
      return true;
    });

    // Generate response text
    let responseText = '';
    const filtersUsed = [];
    if (colonyMatch) filtersUsed.push(`in ${colonyMatch}`);
    if (typeMatch) filtersUsed.push(`${PROPERTY_TYPE_LABELS[typeMatch]}s`);
    if (bhkMatch) filtersUsed.push(`${bhkMatch} BHK`);
    if (priceMax && !priceMin) filtersUsed.push(`under ${formatPrice(priceMax)}`);
    if (priceMin && !priceMax) filtersUsed.push(`above ${formatPrice(priceMin)}`);
    if (priceMin && priceMax) filtersUsed.push(`between ${formatPrice(priceMin)} and ${formatPrice(priceMax)}`);
    if (areaMin || areaMax) filtersUsed.push(`around ${areaMin || areaMax} gaj`);

    if (results.length > 0) {
      const filterDesc = filtersUsed.length > 0 ? ` ${filtersUsed.join(', ')}` : '';
      responseText = `Found ${results.length} matching propert${results.length === 1 ? 'y' : 'ies'}${filterDesc}:`;
    } else {
      if (filtersUsed.length > 0) {
        responseText = `I couldn't find any properties matching ${filtersUsed.join(', ')}. Here are a few other recommendations in Dayalbagh:`;
        results = properties.slice(0, 3);
      } else {
        // Fallback for general questions
        if (query.includes('hello') || query.includes('hi') || query.includes('namaste')) {
          responseText = "Hello! Looking for a plot, flat, or house in Dayalbagh? Tell me what you're looking for!";
        } else if (query.includes('contact') || query.includes('phone') || query.includes('office')) {
          responseText = "Dayalwasi Properties specializes in premium real estate across Dayalbagh, Agra. You can reach out directly or check the Contacts tab for registered brokers!";
        } else if (query.includes('colon') || query.includes('area') || query.includes('location')) {
          responseText = `We cover top colonies in Dayalbagh including Tulsi Vihar, Jeevan Jyoti, Prem Nagar, Swami Bagh, and more. Which area interests you?`;
        } else {
          responseText = "I specialize in Dayalbagh properties! Try searching by colony (e.g. 'Tulsi Vihar'), property type ('plots', 'houses'), or budget ('under 50 lakh').";
          results = properties.slice(0, 3);
        }
      }
    }

    return { text: responseText, results: results.slice(0, 4) };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const res = parseQuery(userText);
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.text,
        results: res.results
      };

      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Render modal version when controlled by Dock (hideTrigger = true)
  if (hideTrigger) {
    if (!isOpen) return null;
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="chat-panel w-[92vw] max-w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-gold-300/80 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-amber-600 p-4 flex justify-between items-center text-white shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-display font-bold tracking-wide text-sm block">Dayalwasi AI</span>
                <span className="text-[10px] text-amber-100/90 font-sans flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Property Advisor • Dayalbagh
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-white"
              aria-label="Close AI Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-beige-50 flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-slide-up-fade`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-br-none' 
                    : 'bg-white text-brown-900 border border-beige-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 w-[92%]">
                    {msg.results.map(prop => (
                      <Link
                        key={prop.id}
                        href={`/properties/${prop.id}`}
                        onClick={() => setIsOpen(false)}
                        className="premium-card p-3 rounded-xl border border-gold-200/60 bg-white hover:border-gold-400 transition-colors block shadow-sm"
                      >
                        <div className="font-semibold text-brown-900 text-sm mb-1 truncate">{prop.title}</div>
                        <div className="flex items-center text-xs text-brown-600 mb-2">
                          <MapPin className="w-3 h-3 mr-1 text-gold-600" />
                          <span className="truncate">{prop.colony}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gold-700">{formatPrice(prop.price)}</span>
                          <span className="text-brown-600 text-xs font-medium">{prop.area_gaj} गज</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start animate-fade-in">
                <div className="bg-white border border-beige-200 rounded-2xl rounded-bl-none p-3 flex gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gold-100 bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about properties in Dayalbagh..."
              className="input-field flex-1 !py-2 !px-4 text-sm"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="btn-gold !p-2 !rounded-xl aspect-square flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standalone floating bottom-right version (if rendered independently)
  return (
    <div 
      className="fixed right-5 sm:right-7 z-50 flex flex-col items-end pointer-events-none"
      style={{ bottom: 'max(2.5rem, calc(2rem + env(safe-area-inset-bottom, 0px)))' }}
    >
      {isOpen && (
        <div className="chat-panel mb-4 w-[92vw] max-w-[390px] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in origin-bottom-right border border-gold-300/80 pointer-events-auto">
          <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-amber-600 p-4 flex justify-between items-center text-white shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-display font-bold tracking-wide text-sm block">Dayalwasi AI</span>
                <span className="text-[10px] text-amber-100/90 font-sans flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Property Advisor • Dayalbagh
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-beige-50 flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-slide-up-fade`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-br-none' 
                    : 'bg-white text-brown-900 border border-beige-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 w-[92%]">
                    {msg.results.map(prop => (
                      <Link key={prop.id} href={`/properties/${prop.id}`} className="premium-card p-3 rounded-xl border border-gold-200/60 bg-white hover:border-gold-400 transition-colors block shadow-sm">
                        <div className="font-semibold text-brown-900 text-sm mb-1 truncate">{prop.title}</div>
                        <div className="flex items-center text-xs text-brown-600 mb-2">
                          <MapPin className="w-3 h-3 mr-1 text-gold-600" />
                          <span className="truncate">{prop.colony}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gold-700">{formatPrice(prop.price)}</span>
                          <span className="text-brown-600 text-xs font-medium">{prop.area_gaj} गज</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start animate-fade-in">
                <div className="bg-white border border-beige-200 rounded-2xl rounded-bl-none p-3 flex gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gold-100 bg-white flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about properties in Dayalbagh..."
              className="input-field flex-1 !py-2 !px-4 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="btn-gold !p-2 !rounded-xl aspect-square flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Tag & Main AI Trigger Button */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gold-300/80 shadow-luxury hover:border-gold-500 text-brown-900 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
            </span>
            <span className="text-xs font-semibold font-display tracking-wide text-brown-900 group-hover:text-gold-700 transition-colors">
              Dayalwasi AI
            </span>
            <span className="text-[10px] font-medium text-olive-800 bg-olive-100 px-1.5 py-0.5 rounded-full border border-olive-200/60">
              Online
            </span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Dayalwasi AI"
          className={`relative group w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
            isOpen
              ? 'bg-brown-900 text-gold-300 ring-4 ring-brown-800/40'
              : 'bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 text-white ring-4 ring-gold-400/35 hover:ring-gold-400/70 shadow-gold-lg'
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
          
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse-subtle drop-shadow-sm text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-200 rounded-full animate-ping opacity-75" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
