'use client';
import { useState, useEffect } from 'react';
import { Ticket } from '@/types';
import TicketCard from '@/components/TicketCard';
import Header from '@/components/Header';
import { TicketListSkeleton } from '@/components/Skeleton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'aktif' | 'riwayat'>('aktif');

  const fetchTickets = async () => {
    const res = await fetch(`/api/tickets?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();

    if (user) {
      const channel = supabase
        .channel(`user_tickets_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchTickets()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const activeTickets = tickets.filter((t) => t.status === 'active');
  const historyTickets = tickets.filter((t) => t.status === 'checked_in' || t.status === 'expired');

  const displayTickets = tab === 'aktif' ? activeTickets : historyTickets;

  return (
    <div className="pb-24 animate-in-fade">
      <Header title="🎟️ Tiket Saya" />
      <div className="px-5 py-4">
        {/* Segmented Control */}
        <div className="flex bg-card border border-border/50 p-1 rounded-[1rem] shadow-soft mb-6">
          <button
            onClick={() => setTab('aktif')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              tab === 'aktif'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Tiket Aktif
          </button>
          <button
            onClick={() => setTab('riwayat')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              tab === 'riwayat'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Riwayat Kehadiran
          </button>
        </div>

        {loading ? (
          <TicketListSkeleton count={3} />
        ) : displayTickets.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-6xl mb-3">{tab === 'aktif' ? '🎫' : '📖'}</p>
            <p className="text-lg font-bold text-foreground">Kosong</p>
            <p className="text-sm mt-1">
              {tab === 'aktif'
                ? 'Daftarkan diri ke event favorit Anda!'
                : 'Anda belum menghadiri event apapun.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
