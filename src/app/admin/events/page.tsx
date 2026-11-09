'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Search, 
  ArrowLeft, 
  MapPin, 
  Ticket, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Power,
  Tag
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import { Event } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'ended'>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events?status=all&t=' + Date.now())
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  async function toggleStatus(event: Event) {
    const nextStatus: 'published' | 'ended' =
      event.status === 'published' ? 'ended' : 'published';

    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: nextStatus } : e))
    );
    showToast(
      nextStatus === 'published'
        ? `"${event.title}" kini ditayangkan`
        : `"${event.title}" diakhiri`
    );

    try {
      await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // offline fallback
    }
  }

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-5 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" /> Kurasi Acara
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
              Kelola Event
            </h1>
          </div>
        </div>

        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          {events.length} Event
        </span>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul event atau lokasi..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'published', 'draft', 'ended'] as const).map((s) => {
          const count =
            s === 'all' ? events.length : events.filter((e) => e.status === s).length;
          const isActive = statusFilter === s;
          const labels: Record<string, string> = {
            all: 'Semua',
            published: 'Tayang',
            draft: 'Draf',
            ended: 'Selesai',
          };
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {labels[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Memuat Katalog Event..." />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-foreground">Tidak ada event ditemukan</p>
          <p className="text-xs text-muted-foreground">Coba kata kunci pencarian lain</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredEvents.map((event, idx) => {
            const isPublished = event.status === 'published';
            const isDraft = event.status === 'draft';

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="overflow-hidden rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all"
              >
                <div className="p-4 flex gap-3.5">
                  {/* Poster Thumbnail */}
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/50">
                    {event.poster_url ? (
                      <Image
                        src={event.poster_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-indigo-600/30 flex items-center justify-center text-primary">
                        <Calendar className="w-8 h-8" />
                      </div>
                    )}
                    <span
                      className={`absolute top-1.5 left-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-sm ${
                        isPublished
                          ? 'bg-emerald-500 text-white'
                          : isDraft
                          ? 'bg-amber-500 text-white'
                          : 'bg-muted-foreground text-white'
                      }`}
                    >
                      {isPublished ? 'Tayang' : isDraft ? 'Draf' : 'Berakhir'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground line-clamp-1">
                        {event.title}
                      </h3>

                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{formatDate(event.date)}</span>
                      </p>

                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{event.location || 'Online / Venue TBA'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-black text-primary">
                        {event.price ? `Rp ${event.price.toLocaleString('id-ID')}` : 'Gratis'}
                      </span>

                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Kapasitas: {event.max_peserta || '∞'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="px-4 py-2.5 bg-muted/30 border-t border-border/50 flex items-center justify-between gap-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Pratinjau
                  </Link>

                  <button
                    onClick={() => toggleStatus(event)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      isPublished
                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {isPublished ? 'Tutup Event' : 'Publikasikan'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
