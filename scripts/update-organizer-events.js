const fs = require('fs');

const code = `'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import { formatDate } from '@/utils/helpers';
import { 
  CalendarDays, 
  Trash2, 
  Plus, 
  MapPin, 
  Ticket, 
  TrendingUp, 
  Sparkles, 
  ScanLine, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { ShimmerButton } from '@/components/ui/ShimmerButton';

export default function MyEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'draft'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(\`/api/events?organizer_id=\${user.id}&status=all&t=\${Date.now()}\`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleToggleStatus(event: Event) {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    setProcessing(event.id);
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e)));

    try {
      await fetch(\`/api/events/\${event.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  }

  async function handleDelete(eventId: string) {
    setProcessing(eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      await fetch(\`/api/events/\${eventId}\`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmDelete(null);
      setProcessing(null);
    }
  }

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const published = events.filter((e) => e.status === 'published').length;
    const totalTicketsSold = events.reduce((acc, curr) => acc + (curr.ticket_count || 0), 0);
    const totalGross = events.reduce((acc, curr) => acc + (curr.ticket_count || 0) * (curr.price || 0), 0);
    return { totalEvents, published, totalTicketsSold, totalGross };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filterTab === 'published') return events.filter((e) => e.status === 'published');
    if (filterTab === 'draft') return events.filter((e) => e.status === 'draft');
    return events;
  }, [events, filterTab]);

  return (
    <div className="relative min-h-screen bg-background pb-36">
      <BackgroundGlow variant="mesh" />

      {/* Header Organizer */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-5 pt-12 pb-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-primary" />
              Organizer Studio
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">
              Manajemen Event
            </h1>
          </div>

          <Link href="/organizer/create-event">
            <ShimmerButton className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Buat Event</span>
            </ShimmerButton>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all \${
              filterTab === 'all'
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/70'
            }\`}
          >
            Semua ({events.length})
          </button>
          <button
            onClick={() => setFilterTab('published')}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 \${
              filterTab === 'published'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/70'
            }\`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live ({events.filter((e) => e.status === 'published').length})</span>
          </button>
          <button
            onClick={() => setFilterTab('draft')}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all \${
              filterTab === 'draft'
                ? 'bg-muted-foreground text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/70'
            }\`}
          >
            Draft ({events.filter((e) => e.status === 'draft').length})
          </button>
        </div>
      </header>

      {/* Metrics Bento Row */}
      <div className="px-5 pt-4">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-card/70 backdrop-blur-md p-3 rounded-2xl border border-border/70">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <CalendarDays className="w-3 h-3 text-primary" />
              <span>Acara Aktif</span>
            </div>
            <p className="text-xl font-black text-foreground mt-1">{stats.published}</p>
          </div>

          <div className="bg-card/70 backdrop-blur-md p-3 rounded-2xl border border-border/70">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <Ticket className="w-3 h-3 text-blue-500" />
              <span>Peserta</span>
            </div>
            <p className="text-xl font-black text-foreground mt-1">{stats.totalTicketsSold.toLocaleString('id-ID')}</p>
          </div>

          <div className="bg-card/70 backdrop-blur-md p-3 rounded-2xl border border-border/70">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Omset</span>
            </div>
            <p className="text-sm font-black text-emerald-600 mt-2 truncate">
              {stats.totalGross > 0 ? \`Rp \${(stats.totalGross / 1000000).toFixed(1)}Jt\` : 'Rp 0'}
            </p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="px-5 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-card/60 animate-pulse rounded-3xl border border-border/60" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4 bg-card/60 backdrop-blur-md rounded-3xl border border-dashed border-border"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-7 h-7 text-primary/60" />
            </div>
            <h3 className="text-base font-bold text-foreground">Belum ada event di sini</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto mb-5">
              Publikasikan konser, workshop, atau festival Anda sekarang untuk mulai menjual tiket.
            </p>
            <Link href="/organizer/create-event">
              <ShimmerButton className="px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Buat Event Baru</span>
              </ShimmerButton>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, idx) => {
                const isPublished = event.status === 'published';
                const count = event.ticket_count || 0;
                const max = event.max_peserta || 100;
                const percent = Math.min(Math.round((count / max) * 100), 100);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
                    className="bg-card/90 backdrop-blur-md rounded-3xl border border-border/70 overflow-hidden shadow-sm"
                  >
                    {/* Top Row: Poster & Basic Info */}
                    <div className="p-4 flex gap-3.5">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-muted">
                        {event.poster_url ? (
                          <Image
                            src={event.poster_url}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <ImageIcon className="w-6 h-6 text-primary/40" />
                          </div>
                        )}
                        <span
                          className={\`absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase \${
                            isPublished ? 'bg-emerald-500 text-white' : 'bg-muted-foreground text-white'
                          }\`}
                        >
                          {isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mt-1">
                            <CalendarDays className="w-3.5 h-3.5 text-primary" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="font-bold text-primary">
                            {event.price === 0 ? 'Gratis' : \`Rp \${(event.price || 0).toLocaleString('id-ID')}\`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Kuota */}
                    <div className="px-4 py-2 bg-muted/30 border-t border-border/40">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
                        <span>Penjualan Tiket ({percent}%)</span>
                        <span className="font-bold text-foreground">
                          {count} / {max}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: \`\${percent}%\` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="p-3 bg-card border-t border-border/50 flex items-center gap-2">
                      <Link
                        href={\`/organizer/events/\${event.id}\`}
                        className="flex-1 h-9 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm shadow-primary/20"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Kelola</span>
                      </Link>

                      <Link
                        href="/organizer/scanner"
                        className="h-9 px-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <ScanLine className="w-3.5 h-3.5" />
                        <span>Scan QR</span>
                      </Link>

                      <button
                        disabled={processing === event.id}
                        onClick={() => handleToggleStatus(event)}
                        className={\`h-9 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-50 \${
                          isPublished
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                        }\`}
                      >
                        {processing === event.id ? '...' : isPublished ? 'Jadikan Draft' : 'Aktifkan'}
                      </button>

                      <button
                        disabled={processing === event.id}
                        onClick={() => setConfirmDelete(event.id)}
                        className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all"
                        title="Hapus Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Inline Delete Confirmation Dialog */}
                    {confirmDelete === event.id && (
                      <div className="p-3 bg-rose-500/10 border-t border-rose-500/20 flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-600">Yakin ingin menghapus event ini?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2.5 py-1 rounded-lg bg-card text-foreground font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('D:/Projects/Eventer/evnter/src/app/(organizer)/organizer/my-events/page.tsx', code, 'utf8');
console.log('Successfully updated organizer/my-events/page.tsx');
