'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Event, Ticket } from '@/types';
import { formatDate, formatDateTime } from '@/utils/helpers';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';

export default function OrganizerEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [eventRes, ticketsRes] = await Promise.all([
        fetch(`/api/events/${params.id}`),
        fetch(`/api/tickets?event_id=${params.id}`),
      ]);
      if (eventRes.ok) {
        const d = await eventRes.json();
        setEvent(d.event);
      }
      if (ticketsRes.ok) {
        const d = await ticketsRes.json();
        setTickets(d.tickets || []);
      }
      setLoading(false);
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-gray-600">Event tidak ditemukan</p>
      </div>
    );
  }

  const checkedIn = tickets.filter((t) => t.status === 'checked_in').length;

  return (
    <div>
      <Header title="Detail Event" showBack />
      <div className="px-4 py-4">
        {/* Event Summary */}
        <Card className="mb-4">
          <h2 className="font-black text-gray-800 text-xl mb-2">{event.title}</h2>
          <p className="text-sm text-blue-600 mb-1">📅 {formatDate(event.date)}</p>
          <p className="text-sm text-gray-500">📍 {event.location}</p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="text-center">
            <p className="text-3xl font-black text-blue-600">{tickets.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Peserta</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-black text-green-600">{checkedIn}</p>
            <p className="text-xs text-gray-500 mt-1">Sudah Check-in</p>
          </Card>
        </div>

        {/* Participants */}
        <h3 className="font-bold text-gray-800 mb-3">👥 Daftar Peserta</h3>
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">👥</p>
            <p>Belum ada peserta terdaftar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {ticket.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {ticket.user?.name || 'Peserta'}
                  </p>
                  <p className="text-xs text-gray-400">{ticket.ticket_code}</p>
                  {ticket.checked_in_at && (
                    <p className="text-xs text-green-600">
                      ✅ {formatDateTime(ticket.checked_in_at)}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                    ticket.status === 'checked_in'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {ticket.status === 'checked_in' ? 'Hadir' : 'Terdaftar'}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
