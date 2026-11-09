const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../src/components/views');
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir, { recursive: true });
}

// 1. EventsView
const eventsViewCode = `'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Sparkles, 
  Music, 
  Laptop, 
  Lightbulb, 
  Palette, 
  Zap, 
  Layers,
  Calendar
} from 'lucide-react';
import { Event } from '@/types';
import EventCard from '@/components/EventCard';
import { EventListSkeleton } from '@/components/Skeleton';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';

const CATEGORIES = [
  { id: 'semua', label: 'Semua', Icon: Layers },
  { id: 'musik', label: 'Musik', Icon: Music },
  { id: 'teknologi', label: 'Teknologi', Icon: Laptop },
  { id: 'workshop', label: 'Workshop', Icon: Lightbulb },
  { id: 'seni', label: 'Seni & Desain', Icon: Palette },
  { id: 'olahraga', label: 'Olahraga', Icon: Zap },
];

const PRICE_FILTERS = [
  { id: 'all', label: 'Semua Harga' },
  { id: 'free', label: 'Gratis' },
  { id: 'under200k', label: '< 200rb' },
];

export default function EventsView({ initialEvents }: { initialEvents?: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents || initialEvents.length === 0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
      setLoading(false);
      return;
    }
    async function loadEvents() {
      setLoading(true);
      try {
        const res = await fetch(\`/api/events?status=published&t=\${Date.now()}\`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchLoc = evt.location.toLowerCase().includes(q);
          const matchDesc = evt.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchDesc) return false;
        }
        if (selectedCategory !== 'semua') {
          if (evt.category?.toLowerCase() !== selectedCategory) return false;
        }
        if (priceFilter === 'free' && evt.price > 0) return false;
        if (priceFilter === 'under200k' && evt.price >= 200000) return false;
        return true;
      });
  }, [events, search, selectedCategory, priceFilter]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <BackgroundGlow variant="spotlight" />
      
      {/* Header Search Box */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/50 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" /> Eksplorasi
            </span>
            <h1 className="text-xl font-black tracking-tight">Katalog Event</h1>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {filteredEvents.length} Event
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari konser, workshop, tech meetup..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-card border border-border/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/60 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-3 pb-1 -mx-2 px-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            const Icon = cat.Icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all \${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                }\`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Price Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2">
          {PRICE_FILTERS.map((pf) => (
            <button
              key={pf.id}
              onClick={() => setPriceFilter(pf.id)}
              className={\`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all \${
                priceFilter === pf.id
                  ? 'border-primary/50 bg-primary/10 text-primary font-bold'
                  : 'border-border/60 text-muted-foreground hover:bg-muted/40'
              }\`}
            >
              {pf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      <div className="px-4 pt-4">
        {loading ? (
          <EventListSkeleton />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">Tidak Ada Event Ditemukan</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
              Coba ganti kata kunci pencarian atau reset filter kategori untuk melihat event lainnya.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('semua'); setPriceFilter('all'); }}
              className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'EventsView.tsx'), eventsViewCode, 'utf8');
console.log('EventsView.tsx created');
