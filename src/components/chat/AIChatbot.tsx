'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Building2, MapPin } from 'lucide-react';
import { Property, PropertyType, BHK } from '@/lib/types';
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

export default function AIChatbot() {
  const { properties } = useProperties();
  const [isOpen, setIsOpen] = useState(false);
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
    let bhkMatch: BHK | null = null;
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
    if (query.includes('plot') || query.includes('land')) typeMatch = 'PLOT';
    else if (query.includes('house') || query.includes('villa')) typeMatch = 'HOUSE';
    else if (query.includes('flat') || query.includes('apartment')) typeMatch = 'FLAT';
    else if (query.includes('commercial') || query.includes('shop') || query.includes('office')) typeMatch = 'COMMERCIAL';
    else if (query.includes('floor')) typeMatch = 'BUILDER_FLOOR';

    // Parse BHK
    const bhkRegex = /(\d)\s*bhk/i;
    const bMatch = query.match(bhkRegex);
    if (bMatch) {
      const b = parseInt(bMatch[1]);
      if (b >= 1 && b <= 5) bhkMatch = b as BHK;
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
         areaMin = a * 0.9;
         areaMax = a * 1.1;
      }
    }

    // Parse Availability
    if (query.includes('available')) isAvailable = true;
    else if (query.includes('sold')) isAvailable = false;

    // General queries
    if (query.includes('how many properties') || query.includes('total properties')) {
      return { isCountOnly: true };
    }

    return {
      priceMax,
      priceMin,
      colonyMatch,
      typeMatch,
      bhkMatch,
      areaMin,
      areaMax,
      isAvailable
    };
  };

  const executeQuery = (criteria: ReturnType<typeof parseQuery>) => {
    if (criteria.isCountOnly) {
      return {
        text: `We currently have ${properties.length} properties in our database.`,
        results: []
      };
    }

    let filtered = properties;

    if (criteria.isAvailable !== null) {
      filtered = filtered.filter(p => (p.status === 'AVAILABLE') === criteria.isAvailable);
    }
    if (criteria.priceMax !== null) {
      filtered = filtered.filter(p => p.price <= criteria.priceMax!);
    }
    if (criteria.priceMin !== null) {
      filtered = filtered.filter(p => p.price >= criteria.priceMin!);
    }
    if (criteria.colonyMatch !== null) {
      filtered = filtered.filter(p => p.colony === criteria.colonyMatch);
    }
    if (criteria.typeMatch !== null) {
      filtered = filtered.filter(p => p.property_type === criteria.typeMatch);
    }
    if (criteria.bhkMatch !== null) {
      filtered = filtered.filter(p => p.bhk === criteria.bhkMatch);
    }
    if (criteria.areaMin !== null) {
      filtered = filtered.filter(p => p.area_gaj >= criteria.areaMin!);
    }
    if (criteria.areaMax !== null) {
      filtered = filtered.filter(p => p.area_gaj <= criteria.areaMax!);
    }

    let responseText = '';
    if (filtered.length === 0) {
      responseText = 'No properties match that criteria. Try something else!';
    } else {
      responseText = `Found ${filtered.length} properties matching your search:`;
    }

    return {
      text: responseText,
      results: filtered.slice(0, 5) // limit to top 5
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const criteria = parseQuery(userText);
      const res = executeQuery(criteria);
      
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.text,
        results: res.results
      };

      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="chat-panel mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in origin-bottom-right border border-gold-200">
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-display font-semibold">Dayalwasi AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-beige-50 flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-slide-up-fade`}>
                <div className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-br-none' 
                    : 'bg-beige-100 text-brown-900 border border-beige-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 w-[90%]">
                    {msg.results.map(prop => (
                      <Link key={prop.id} href={`/properties/${prop.id}`} className="premium-card p-3 rounded-xl border border-gold-100 bg-white hover:border-gold-300 transition-colors block">
                        <div className="font-semibold text-brown-900 text-sm mb-1 truncate">{prop.title}</div>
                        <div className="flex items-center text-xs text-brown-600 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{prop.colony}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gold-700">{formatPrice(prop.price)}</span>
                          <span className="text-brown-600 text-xs">{prop.area_gaj} sq yd</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start animate-fade-in">
                <div className="bg-beige-100 border border-beige-200 rounded-2xl rounded-bl-none p-3 flex gap-1">
                  <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              placeholder="Ask about properties..."
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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fab w-14 h-14 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
