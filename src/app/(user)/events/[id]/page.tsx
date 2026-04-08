'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Event } from '@/types';
import { formatDate, formatTime, formatPrice } from '@/utils/helpers';
import Header from '@/components/Header';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registered, setRegistered] = useState(false);

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

    // Try approval-based registration first
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: params.id }),
    });
    const data = await res.json();

    if (res.ok) {
      if (data.mode === 'direct' && data.ticket) {
        // Fallback: ticket created directly
        router.push(`/tickets/success?ticket_id=${data.ticket.id}`);
      } else {
        // Pending approval
        setRegistered(true);
        setMessage({
          type: 'success',
          text: 'Pendaftaran berhasil! Menunggu persetujuan organizer.',
        });
      }
    } else {
      setMessage({ type: 'error', text: data.error || 'Gagal mendaftar' });
    }
    setRegistering(false);
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

  const isFree = !event.price || event.price === 0;
  const price = formatPrice(event.price);

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
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {event.status === 'published' ? '✅ Tersedia' : '⏸️ Tidak Tersedia'}
              </span>
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                  isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {isFree ? '🎉 Gratis' : `💰 ${price}`}
              </span>
            </div>
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
            {!isFree && (
              <div className="flex items-start gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Harga Tiket</p>
                  <p className="text-sm font-bold text-orange-600">{price}</p>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mb-4">
              <h2 className="font-bold text-gray-800 mb-2">Tentang Event</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Payment info for paid events */}
          {!isFree && event.status === 'published' && !registered && (
            <PaymentInfoCard />
          )}

          {message && (
            <div className="mb-4">
              <StatusMessage type={message.type} message={message.text} />
            </div>
          )}

          {registered ? (
            <Card className="text-center py-4 bg-green-50">
              <p className="text-3xl mb-2">⏳</p>
              <p className="font-bold text-green-800">Menunggu Persetujuan</p>
              <p className="text-sm text-green-700 mt-1">
                Organizer akan segera meninjau pendaftaran Anda
              </p>
            </Card>
          ) : (
            event.status === 'published' && (
              <Button onClick={handleRegister} loading={registering} fullWidth size="lg">
                {isFree ? '🎟️ Daftar Sekarang — Gratis' : `🎟️ Daftar — ${price}`}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentInfoCard() {
  const [settings, setSettings] = useState<{
    payment_name?: string;
    account_number?: string;
    account_name?: string;
    qris_image?: string;
    whatsapp_admin?: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  if (!settings) return null;

  return (
    <Card className="mb-4 bg-blue-50 border border-blue-100">
      <h3 className="font-bold text-blue-800 mb-2">💳 Cara Pembayaran</h3>
      <p className="text-sm text-blue-700 font-semibold">{settings.payment_name}</p>
      <p className="text-sm text-blue-700">No: {settings.account_number}</p>
      <p className="text-sm text-blue-700">Atas nama: {settings.account_name}</p>
      {settings.description && (
        <p className="text-xs text-blue-600 mt-1">{settings.description}</p>
      )}
      {settings.qris_image && (
        <div className="mt-3 flex flex-col items-center">
          <p className="text-xs font-semibold text-blue-700 mb-1">Scan QRIS</p>
          <img
            src={settings.qris_image}
            alt="QRIS"
            className="w-40 h-40 object-contain rounded-xl border border-blue-200"
          />
        </div>
      )}
      {settings.whatsapp_admin && (
        <a
          href={`https://wa.me/62${settings.whatsapp_admin.replace(/^0/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 text-sm text-green-700 font-semibold"
        >
          💬 Konfirmasi ke Admin WhatsApp
        </a>
      )}
    </Card>
  );
}
