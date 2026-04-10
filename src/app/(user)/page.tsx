'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import EventCard from '@/components/EventCard';
import { EventListSkeleton } from '@/components/Skeleton';
import { Search, Sparkles, Flame, Ticket, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'published' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/events?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const upcomingEvents = events.slice(0, 3);
  const allEvents = events;

  return (
    <div className="bg-background min-h-screen pb-24 animate-in-fade">
      {/* Hero Header */}
      <div className="bg-primary rounded-b-[2.5rem] px-6 pt-14 pb-10 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="w-64 h-64 bg-white rounded-full blur-[80px] absolute -top-10 -right-10 mix-blend-overlay"></div>
          <div className="w-64 h-64 bg-indigo-400 rounded-full blur-[80px] absolute -bottom-20 -left-20 mix-blend-overlay"></div>
        </div>
        
        <div className="relative z-10">
          <p className="text-primary-foreground/80 text-sm font-medium mb-1">Selamat datang 👋</p>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            Halo, {user?.name?.split(' ')[0] || 'Pengguna'}!
          </h1>
          <p className="text-primary-foreground/90 text-sm">Temukan event seru hari ini</p>

          {/* Search */}
          <div className="mt-6 relative shadow-lg rounded-2xl group">
            <input
              type="text"
              placeholder="Cari konser, seminar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-4 pl-12 rounded-2xl bg-white/95 backdrop-blur-sm text-foreground text-sm font-medium focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-muted-foreground placeholder:font-normal"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 pb-4">
        {/* Upgrade Banner for free users */}
        {user?.pro_status === 'free' && user?.role === 'user' && (
          <Link href="/organizer/upgrade" className="block active:scale-95 transition-transform duration-200">
            <div className="bg-gradient-to-r from-orange-400 to-rose-500 rounded-2xl p-5 mb-8 flex items-center gap-4 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles className="w-16 h-16 text-white"/></div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-white text-base">Jadilah Organizer Pro!</p>
                <p className="text-orange-100 text-xs mt-0.5">Kelola event tanpa batas</p>
              </div>
              <ChevronRight className="text-white w-6 h-6" />
            </div>
          </Link>
        )}

        {/* Upcoming Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Lagi Hits
            </h2>
            <Link href="/events" className="text-sm text-primary font-bold hover:underline">
              Lihat Semua
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5">
              <div className="min-w-[280px] w-[80vw] shrink-0">
                <div className="bg-white rounded-3xl p-4 shadow-soft space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded-2xl" />
                  <div className="w-3/4 h-6 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-3xl border border-border/50 border-dashed">
              <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium text-sm">Belum ada event hits</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 hide-scrollbar -mx-5 px-5 snap-x snap-mandatory">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="min-w-[280px] w-[80vw] snap-center shrink-0">
                  <EventCard event={event} />
                </div>
              ))}
              {/* Spacer empty div to ensure padding right is respected in all browsers */}
              <div className="w-1 shrink-0" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* All Events */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-extrabold text-foreground">🗓️ Semua Event</h2>
          </div>
          
          {loading ? (
            <EventListSkeleton count={4} />
          ) : allEvents.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-2xl border border-border/50 border-dashed">
              <Ticket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium text-xs">Tidak menemukan event</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {allEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
