'use client';
import { useState, useEffect } from 'react';
import { Ticket } from '@/types';
import TicketCard from '@/components/TicketCard';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header title="🎟️ Tiket Saya" />
      <div className="px-4 py-4">
        {loading ? (
          <LoadingSpinner />
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-6xl mb-3">🎟️</p>
            <p className="text-lg font-semibold">Belum ada tiket</p>
            <p className="text-sm mt-1">Daftarkan diri ke event favorit Anda!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
