'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Event, EventRegistration, Ticket } from '@/types';
import { formatDate, formatTime, formatPrice } from '@/utils/helpers';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ImageUpload from '@/components/ImageUpload';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [registrationObj, setRegistrationObj] = useState<EventRegistration | null>(null);
  const alert = useAlert();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();

    // Subscribe to REALTIME status updates
    let channel: { unsubscribe: () => void } | null = null;
    if (user) {
      channel = supabase
        .channel(`status_sync_${params.id}_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_registrations',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tickets',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchData();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, user?.id]);

  async function fetchData() {
    // Fetch Event
    const eventRes = await fetch(`/api/events/${params.id}?t=${Date.now()}`);
    if (eventRes.ok) {
      const data = await eventRes.json();
      setEvent(data.event);
    }
    
    // Fetch User's Registration for this specific event
    if (user) {
      const regRes = await fetch(`/api/registrations?t=${Date.now()}`);
      if (regRes.ok) {
        const regData = await regRes.json();
        const existing = regData.registrations.find((r: EventRegistration) => r.event_id === params.id);
        setRegistrationObj(existing || null);
      }
    }
    setLoading(false);
  }

  const isFree = !event || !event.price || event.price === 0;

  async function handleActionClick() {
    // If ALREADY approved, navigate to Ticket
    if (registrationObj?.approval_status === 'approved') {
      await alert.success('Berhasil', 'Tiket kamu sudah tersedia');
      
      const ticketsRes = await fetch(`/api/tickets?t=${Date.now()}`);
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        const tkt = ticketsData.tickets.find((t: Ticket) => t.event_id === params.id);
        if (tkt) {
          router.push(`/tickets/${tkt.id}`);
          return;
        }
      }
      return;
    }

    // Default: Start Registration
    handleRegister();
  }

  async function handleRegister() {
    if (!user) return router.push('/login');
    if (!event) return;

    setRegistering(true);
    // Optimistic UI: Set a temporary registration object so the button changes immediately
    setRegistrationObj({ approval_status: 'pending_approval' });

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event_id: event.id,
          payment_proof_url: paymentProof 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Realtime will handle the refresh, but we set it here too for safety
        setRegistrationObj(data.registration);
        alert.success('Berhasil', 'Pendaftaran kamu sedang diproses');
      } else {
        // Rollback optimistic state
        setRegistrationObj(null);
        alert.error('Gagal', data.error || 'Terjadi kesalahan');
      }
    } catch {
      setRegistrationObj(null);
      alert.error('Gagal', 'Gagal menghubungi server');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <div className="h-56 bg-gray-200 animate-pulse rounded-2xl" />
      <div className="h-8 bg-gray-200 animate-pulse w-3/4 rounded-lg" />
      <div className="h-24 bg-gray-200 animate-pulse rounded-2xl" />
    </div>
  );
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-gray-600">Event tidak ditemukan</p>
      </div>
    );
  }

  const price = formatPrice(event.price || 0);

  return (
    <div>
      <Header title="" showBack />
      <div>
        {event.poster_url ? (
          <div className="relative w-full h-56 overflow-hidden">
            <Image src={event.poster_url} alt={event.title} fill className="object-cover" />
          </div>
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
          </div>

          {event.description && (
            <div className="mb-4">
              <h2 className="font-bold text-gray-800 mb-2">Tentang Event</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Payment info for paid events ONLY if not registered yet */}
          {!isFree && event.status === 'published' && !registrationObj && (
            <>
              <PaymentInfoCard event={event} />
              <Card className="mb-4">
                <h3 className="font-bold text-gray-800 mb-3">Upload Bukti Transfer</h3>
                <ImageUpload
                  label="Bukti Pembayaran (Wajib)"
                  value={paymentProof}
                  onChange={(url) => setPaymentProof(url)}
                  placeholder="Pilih atau seret struk ke sini"
                />
              </Card>
            </>
          )}

          {event.status === 'published' && (
            <div className="space-y-3 mt-8">
              {registrationObj?.approval_status === 'pending_approval' ? (
                <>
                  <Button disabled fullWidth size="lg" className="!bg-amber-500 hover:!bg-amber-600 !text-white opacity-100 disabled:opacity-100 shadow-amber-500/30">
                    ⏳ Menunggu Tiket
                  </Button>
                  <p className="text-center text-xs font-semibold text-gray-500">
                    Pendaftaran kamu sedang menunggu persetujuan organizer.
                  </p>
                </>
              ) : registrationObj?.approval_status === 'rejected' ? (
                <Button disabled fullWidth size="lg" variant="danger">
                  ❌ Pendaftaran Ditolak
                </Button>
              ) : registrationObj?.approval_status === 'approved' ? (
                <Button onClick={handleActionClick} fullWidth size="lg" className="!bg-emerald-500 hover:!bg-emerald-600 !text-white shadow-emerald-500/30">
                  🎟️ Lihat Tiket
                </Button>
              ) : (
                <>
                  <Button onClick={handleActionClick} loading={registering} fullWidth size="lg">
                    {isFree ? '🎟️ Dapatkan Tiket' : `🎟️ Dapatkan Tiket`}
                  </Button>
                  {isFree && (
                    <p className="text-center text-xs font-semibold text-gray-500">
                      Organizer akan melakukan verifikasi maksimal 1x24 jam
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentInfoCard({ event }: { event: Event }) {
  if (!event.metode_pembayaran) {
    return (
      <Card className="mb-4 bg-orange-50 border border-orange-100">
         <p className="text-sm text-orange-700">Metode pembayaran belum diatur oleh Organizer.</p>
      </Card>
    );
  }

  return (
    <Card className="mb-4 bg-blue-50 border border-blue-100">
      <h3 className="font-bold text-blue-800 mb-2">💳 Cara Pembayaran</h3>
      <p className="text-sm text-blue-700 font-semibold">{event.metode_pembayaran}</p>
      <p className="text-sm text-blue-700">No: {event.nomor_rekening}</p>
      <p className="text-sm text-blue-700">Atas nama: {event.nama_pemilik}</p>
      {event.catatan_pembayaran && (
        <p className="text-xs text-blue-600 mt-1 italic">{event.catatan_pembayaran}</p>
      )}
      {event.qris_image && (
        <div className="mt-3 flex flex-col items-center">
          <p className="text-xs font-semibold text-blue-700 mb-1">Scan QRIS</p>
          <div className="relative w-40 h-40 overflow-hidden rounded-xl border border-blue-200 bg-white">
            <Image
              src={event.qris_image}
              alt="QRIS"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
      {event.organizer?.whatsapp && (
        <a
          href={`https://wa.me/62${event.organizer.whatsapp.replace(/^0/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 text-sm text-green-700 font-semibold"
        >
          💬 Konfirmasi ke Organizer
        </a>
      )}
    </Card>
  );
}
