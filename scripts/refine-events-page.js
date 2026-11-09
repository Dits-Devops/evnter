const fs = require('fs');

const code = `'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Sparkles, 
  RefreshCw, 
  Music, 
  Laptop, 
  Lightbulb, 
  Palette, 
  Zap, 
  Layers,
  ChevronDown,
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'popularity'>('date');

  useEffect(() => {
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
  }, []);

  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchDesc = evt.description?.toLowerCase().includes(q) || false;
          const matchLoc = evt.location.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        // Category filter
        if (selectedCategory !== 'semua') {
          const title = evt.title.toLowerCase();
          const desc = evt.description?.toLowerCase() || '';
          if (selectedCategory === 'musik' && !title.includes('music') && !title.includes('soundwave') && !desc.includes('musik')) return false;
          if (selectedCategory === 'teknologi' && !title.includes('tech') && !title.includes('hackathon') && !desc.includes('teknologi') && !desc.includes('ai')) return false;
          if (selectedCategory === 'workshop' && !title.includes('masterclass') && !title.includes('workshop') && !desc.includes('workshop')) return false;
          if (selectedCategory === 'seni' && !title.includes('art') && !title.includes('desain') && !desc.includes('desain') && !desc.includes('seni')) return false;
          if (selectedCategory === 'olahraga' && !title.includes('run') && !title.includes('marathon') && !desc.includes('olahraga')) return false;
        }

        // Price filter
        if (priceFilter === 'free' && evt.price > 0) return false;
        if (priceFilter === 'under200k' && evt.price >= 200000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'popularity') return (b.ticket_count || 0) - (a.ticket_count || 0);
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [events, search, selectedCategory, priceFilter, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('semua');
    setPriceFilter('all');
    setSortBy('date');
  };

  return (
    <div className="relative min-h-screen bg-background pb-36">
      {/* Background Glow */}
      <BackgroundGlow variant="subtle" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-5 pt-12 pb-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-primary" />
              Katalog Lengkap
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">
              Jelajahi Event
            </h1>
          </div>
          <div className="text-right bg-primary/5 border border-primary/15 rounded-2xl px-3 py-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Tersedia</span>
            <span className="text-sm font-black text-primary">{filteredEvents.length} Event</span>
          </div>
        </div>

        {/* Search input Origin UI style */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari event, workshop, kota, seminar..."
            className="w-full h-11 pl-10 pr-10 rounded-2xl bg-card border border-border/70 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      {/* Filter & Categories Controls */}
      <div className="px-5 pt-3 space-y-3">
        {/* Horizontal Category Carousel without native scrollbars */}
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 -mx-5 px-5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.Icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={\`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 \${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/30 border border-primary'
                    : 'text-foreground/80 bg-card hover:bg-muted/80 border border-border/70'
                }\`}
              >
                <Icon className={\`w-3.5 h-3.5 \${isSelected ? 'text-white' : 'text-primary'}\`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Row: Price and Sort */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {PRICE_FILTERS.map((pf) => (
              <button
                key={pf.id}
                onClick={() => setPriceFilter(pf.id)}
                className={\`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 \${
                  priceFilter === pf.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/70'
                }\`}
              >
                {pf.label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-card border border-border/70 text-foreground font-bold text-xs rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer shadow-sm"
            >
              <option value="date">Terdekat</option>
              <option value="price-asc">Termurah</option>
              <option value="popularity">Terpopuler</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Events List */}
      <div className="px-5 pt-4">
        {loading ? (
          <EventListSkeleton count={4} />
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-card/60 backdrop-blur-md rounded-3xl border border-dashed border-border"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-base font-bold text-foreground">Tidak ada event yang cocok</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Coba sesuaikan kata kunci atau ubah filter kategori dan harga Anda.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Semua Filter
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('D:/Projects/Eventer/evnter/src/app/(user)/events/page.tsx', code, 'utf8');
console.log('Successfully refined events/page.tsx with anti-slop guidelines!');
