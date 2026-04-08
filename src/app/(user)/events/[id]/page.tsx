'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Event } from '@/types';
import { formatDate, formatTime } from '@/utils/helpers';
import Header from '@/components/Header';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusMessage from '@/components/StatusMessage';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchEvent() {
    const res = await fetch(`/api/events/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setEvent(data.event);
    }
    setLoading(false);
  }

  async function handleRegister() {
    setRegistering(true);
    setMessage(null);
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: params.id }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/tickets/success?ticket_id=${data.ticket.id}`);
    } else {
      setMessage({ type: 'error', text: data.error || 'Gagal mendaftar' });
      setRegistering(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" />;
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-gray-600">Event tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="" showBack />
      <div>
        {event.poster_url ? (
          <img src={event.poster_url} alt={event.title} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-7xl">🎪</span>
          </div>
        )}
        <div className="px-4 py-5">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
              {event.status === 'published' ? '✅ Tersedia' : '⏸️ Tidak Tersedia'}
            </span>
            <h1 className="text-2xl font-black text-gray-800 mb-3">{event.title}</h1>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Tanggal</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(event.date)}</p>
                <p className="text-sm text-gray-600">{formatTime(event.date)} WIB</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Lokasi</p>
                <p className="text-sm font-semibold text-gray-800">{event.location}</p>
              </div>
            </div>
            {event.organizer && (
              <div className="flex items-start gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Organizer</p>
                  <p className="text-sm font-semibold text-gray-800">{event.organizer.name}</p>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mb-6">
              <h2 className="font-bold text-gray-800 mb-2">Tentang Event</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          )}

          {message && (
            <div className="mb-4">
              <StatusMessage type={message.type} message={message.text} />
            </div>
          )}

          {event.status === 'published' && (
            <Button onClick={handleRegister} loading={registering} fullWidth size="lg">
              🎟️ Daftar Sekarang — GRATIS
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
