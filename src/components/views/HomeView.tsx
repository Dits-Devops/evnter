'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import EventCard from '@/components/EventCard';
import { EventListSkeleton } from '@/components/Skeleton';
import { Search, Sparkles, Flame, Ticket, Music, Cpu, Utensils, Palette, Compass, Zap, ArrowRight } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { cachedFetch } from '@/lib/cache';
import { mockEvents } from '@/lib/mockData';

const CATEGORIES = [
  { id: 'all', label: 'Semua', icon: Compass },
  { id: 'music', label: 'Musik', icon: Music },
  { id: 'tech', label: 'Tech', icon: Cpu },
  { id: 'workshop', label: 'Workshop', icon: Palette },
  { id: 'kuliner', label: 'Kuliner', icon: Utensils },
];

export default function HomeView({ 
  onNavigate,
  initialEvents 
}: { 
  onNavigate?: (hash: string) => void;
  initialEvents?: Event[];
}) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>(initialEvents && initialEvents.length > 0 ? initialEvents : mockEvents);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const nav = (hash: string) => {
    if (onNavigate) onNavigate(hash);
    else window.location.hash = hash;
  };

  const fetchEvents = useCallback(async () => {
    const params = new URLSearchParams({ status: 'published' });
    if (search) params.set('search', search);
    try {
      const data = await cachedFetch<{ events: Event[] }>(`/api/events?${params}`);
      setEvents(data.events || []);
    } catch {
      // Fallback handled by API
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!initialEvents || initialEvents.length === 0 || search) {
      fetchEvents();
    }
  }, [fetchEvents, search, initialEvents]);

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'all') return true;
    const text = (ev.title + ' ' + (ev.description || '')).toLowerCase();
    if (selectedCategory === 'music') return text.includes('music') || text.includes('festival') || text.includes('konser');
    if (selectedCategory === 'tech') return text.includes('tech') || text.includes('developer') || text.includes('horizons');
    if (selectedCategory === 'workshop') return text.includes('workshop') || text.includes('masterclass') || text.includes('ui/ux');
    if (selectedCategory === 'kuliner') return text.includes('culinary') || text.includes('kuliner') || text.includes('expo');
    return true;
  });

  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="bg-background min-h-screen pb-44">
      {/* Hero Header with Aceternity style Spotlight & Glowing Orbs */}
      <div className="relative rounded-b-[2.5rem] bg-gradient-to-b from-blue-600 via-indigo-600 to-blue-700 px-6 pt-12 pb-9 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.35)] overflow-hidden">
        {/* Glow Spheres */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cyan-400/30 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-500/30 blur-[70px]" />
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }} 
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>EVNTER Experience 2026</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Halo, {user?.name?.split(' ')[0] || 'Sobat Event'}! 👋
              </h1>
              <p className="text-blue-100/90 text-xs mt-0.5 font-medium">Jelajahi tiket dan event hits terdekat</p>
            </div>

            {/* Role Badge Indicator */}
            <div className="flex flex-col items-end">
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/30">
                {user?.role || 'Guest'}
              </span>
            </div>
          </div>

          {/* Search Input with Origin UI style */}
          <div className="mt-5 relative shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] rounded-2xl group">
            <input
              type="text"
              placeholder="Cari konser, tech summit, workshop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3.5 pl-11 rounded-2xl bg-white/95 backdrop-blur-md text-foreground text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-white/30 transition-all placeholder:text-muted-foreground/70"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/60 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* Category Pills (iOS / Origin UI segmented scroll) */}
        <div>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-5 px-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 select-none cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] scale-102'
                      : 'bg-card text-muted-foreground border border-border/80 hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upgrade Banner for free users */}
        {user?.pro_status === 'free' && user?.role === 'user' && (
          <button 
            onClick={() => nav('#upgrade')}
            className="w-full text-left active:scale-98 transition-transform cursor-pointer"
          >
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-4 shadow-lg text-white relative overflow-hidden flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm">Upgrade ke Organizer PRO</span>
                  <span className="bg-white/30 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">NEW</span>
                </div>
                <p className="text-white/85 text-[11px] truncate mt-0.5">Bikin event, jual tiket & scan QR tanpa limit</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 shrink-0" />
            </div>
          </button>
        )}

        {/* Bento Grid: Featured Highlights */}
        {selectedCategory === 'all' && (
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" />
                Kategori Populer
              </h2>
            </div>
            <BentoGrid>
              <BentoCard
                title="Konser & Festival"
                description="Live gigs, EDM & artis ternama"
                badge="HOT"
                gradient="from-pink-500/15 via-rose-500/10 to-transparent"
                onClick={() => setSelectedCategory('music')}
                icon={<Music className="w-5 h-5" />}
              />
              <BentoCard
                title="Tech & AI Summit"
                description="Coding, hackathon & networking"
                badge="TRENDING"
                gradient="from-cyan-500/15 via-blue-500/10 to-transparent"
                onClick={() => setSelectedCategory('tech')}
                icon={<Cpu className="w-5 h-5" />}
              />
            </BentoGrid>
          </div>
        )}

        {/* Upcoming Hits (Carousel) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Lagi Hits Minggu Ini
            </h2>
            <button 
              onClick={() => nav('#events')} 
              className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5">
              <div className="min-w-[270px] w-[75vw] shrink-0">
                <div className="bg-card rounded-3xl p-4 shadow-sm border border-border space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-muted rounded-2xl" />
                  <div className="w-3/4 h-5 bg-muted rounded" />
                </div>
              </div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-3xl border border-dashed border-border">
              <Ticket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground font-semibold text-xs">Belum ada event hits</p>
            </div>
          ) : (
            <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 hide-scrollbar -mx-5 px-5 snap-x snap-mandatory">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="min-w-[270px] w-[78vw] snap-center shrink-0">
                  <EventCard event={event} variant="featured" />
                </div>
              ))}
              <div className="w-1 shrink-0" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* All Events Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-base font-extrabold text-foreground">
              🗓️ {selectedCategory === 'all' ? 'Semua Event Pilihan' : `Event: ${selectedCategory.toUpperCase()}`}
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">
              {filteredEvents.length} Acara
            </span>
          </div>

          {loading ? (
            <EventListSkeleton count={4} />
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border">
              <Ticket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground font-bold text-xs">Tidak menemukan event yang cocok</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearch(''); }}
                className="mt-3 text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Safe area spacer for floating dock */}
        <div className="h-20" />
      </div>
    </div>
  );
}
