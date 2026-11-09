'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket as TicketIcon, History, Sparkles, Compass } from 'lucide-react';
import { Ticket } from '@/types';
import TicketCard from '@/components/TicketCard';
import { TicketListSkeleton } from '@/components/Skeleton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { cachedFetch } from '@/lib/cache';
import { mockTickets } from '@/lib/mockData';

export default function TicketsView({ onNavigate }: { onNavigate?: (hash: string) => void }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'aktif' | 'riwayat'>('aktif');

  const fetchTickets = async () => {
    try {
      const data = await cachedFetch<{ tickets: Ticket[] }>('/api/tickets');
      if (data.tickets && data.tickets.length > 0) {
        setTickets(data.tickets);
      } else if (!user) {
        setTickets(mockTickets);
      } else {
        setTickets([]);
      }
    } catch {
      if (!user) setTickets(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    if (user) {
      // Skip realtime if Supabase is in mock mode
      const channel = supabase.channel
        ? supabase
            .channel(`user_tickets_${user.id}`)
            .on(
              'postgres_changes' as any,
              {
                event: '*',
                schema: 'public',
                table: 'tickets',
                filter: `user_id=eq.${user.id}`,
              },
              () => fetchTickets()
            )
            .subscribe()
        : null;

      return () => {
        if (channel) {
          try { supabase.removeChannel?.(channel); } catch {}
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeTickets = tickets.filter((t) => t.status === 'active');
  const historyTickets = tickets.filter((t) => t.status === 'checked_in' || t.status === 'expired');
  const displayTickets = tab === 'aktif' ? activeTickets : historyTickets;

  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Header with gradient backdrop */}
      <div className="relative pt-6 pb-4 px-5 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit mb-1">
              <Sparkles className="w-3 h-3" /> E-Pass Wallet
            </span>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Tiket Saya
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center justify-center text-primary">
            <TicketIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Tab Pills */}
        <div className="bg-muted/70 p-1 rounded-2xl flex relative border border-border/40">
          <button
            onClick={() => setTab('aktif')}
            className={`relative flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
              tab === 'aktif' ? 'text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'aktif' && (
              <motion.div
                layoutId="ticketTabPill"
                className="absolute inset-0 bg-card rounded-xl border border-border/50"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <TicketIcon className="w-3.5 h-3.5" />
              Aktif ({activeTickets.length})
            </span>
          </button>

          <button
            onClick={() => setTab('riwayat')}
            className={`relative flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
              tab === 'riwayat' ? 'text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'riwayat' && (
              <motion.div
                layoutId="ticketTabPill"
                className="absolute inset-0 bg-card rounded-xl border border-border/50"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Riwayat ({historyTickets.length})
            </span>
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="px-5 pt-3">
        {loading ? (
          <TicketListSkeleton />
        ) : displayTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/50 border border-dashed border-border rounded-3xl mt-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <TicketIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1">
              {tab === 'aktif' ? 'Belum Ada Tiket Aktif' : 'Belum Ada Riwayat Tiket'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-[240px] mb-6">
              {tab === 'aktif'
                ? 'Tiket yang kamu beli akan muncul di sini dengan kode QR check-in.'
                : 'Tiket event yang sudah selesai atau telah kamu gunakan akan diarsipkan di sini.'}
            </p>
            <button
              onClick={() => onNavigate ? onNavigate('#events') : (window.location.hash = '#events')}
              className="w-full max-w-[200px]"
            >
              <ShimmerButton className="w-full text-xs py-2.5">
                <Compass className="w-3.5 h-3.5 mr-1.5" /> Jelajahi Event
              </ShimmerButton>
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TicketCard ticket={ticket} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Safe area spacer for floating dock */}
        <div className="h-20" />
      </div>
    </div>
  );
}
