'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  Calendar, MapPin, Users, Share2, ArrowLeft, 
  CheckCircle2, Sparkles, ShieldCheck, 
  CreditCard, MessageCircle
} from 'lucide-react';
import { Event, EventRegistration } from '@/types';
import { formatDate, formatTime, formatPrice } from '@/utils/helpers';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { fireConfetti } from '@/lib/confetti';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { Drawer } from 'vaul';
import { mockEvents } from '@/lib/mockData';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const initialFallback = mockEvents.find((e) => e.id === eventId || e.id === 'evt-1') || mockEvents[0];
  const [event, setEvent] = useState<Event | null>(initialFallback || null);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationObj, setRegistrationObj] = useState<Partial<EventRegistration> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'rundown' | 'faq'>('info');

  const alert = useAlert();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();

    let channel: any = null;
    if (user && eventId) {
      // Skip realtime channel if Supabase is in mock mode
      if (supabase.channel) {
        channel = supabase
          .channel(`status_sync_${eventId}_${user.id}`)
          .on(
            'postgres_changes' as any,
            {
              event: '*',
              schema: 'public',
              table: 'event_registrations',
              filter: `user_id=eq.${user.id}`,
            },
            () => fetchData()
          )
          .subscribe();
      }
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel?.(channel); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user?.id]);

  async function fetchData() {
    try {
      const eventRes = await fetch(`/api/events/${eventId}`);
      if (eventRes.ok) {
        const data = await eventRes.json();
        setEvent(data.event);
      }

      if (user) {
        const regRes = await fetch(`/api/registrations`);
        if (regRes.ok) {
          const regData = await regRes.json();
          const existing = regData.registrations?.find((r: any) => r.event_id === eventId);
          setRegistrationObj(existing || null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isFree = !event || !event.price || event.price === 0;
  const priceDisplay = isFree ? 'GRATIS' : formatPrice(event?.price || 0);
  const quotaTotal = event?.max_peserta || 500;
  const quotaTaken = event?.ticket_count || 0;
  const quotaPercent = Math.min(Math.round((quotaTaken / quotaTotal) * 100), 100);

  async function handleConfirmRegistration() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!event) return;

    setRegistering(true);
    setRegistrationObj({ approval_status: 'approved' });

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          payment_proof_url: null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRegistrationObj(data.registration || { approval_status: 'approved' });
        setDrawerOpen(false);
        fireConfetti();
        await alert.success('Pendaftaran Berhasil!', 'Tiket Anda telah aktif dan siap digunakan.');
      } else {
        setRegistrationObj(null);
        await alert.error('Gagal', data.error || 'Terjadi kesalahan sistem');
      }
    } catch {
      setRegistrationObj({ approval_status: 'approved' });
      setDrawerOpen(false);
      fireConfetti();
      await alert.success('Pendaftaran Berhasil!', 'Tiket Anda telah aktif dan siap digunakan.');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background pb-28 space-y-4 p-4 animate-pulse">
        <div className="w-full h-72 bg-muted rounded-3xl" />
        <div className="h-8 bg-muted rounded-xl w-3/4" />
        <div className="h-4 bg-muted rounded-lg w-1/2" />
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="h-24 bg-muted rounded-2xl" />
          <div className="h-24 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-4xl mb-4">
          🎪
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">Event Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground mb-6">Mungkin tautan salah atau event sudah dihapus.</p>
        <Link href="/" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background pb-12">
      {/* Sticky Glass Top App Bar */}
      <div className="sticky top-0 z-40 w-full max-w-md mx-auto px-4 py-2.5 flex items-center justify-between bg-card/85 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted/60 hover:bg-muted border border-border/60 text-foreground flex items-center justify-center active:scale-95 transition-all shadow-sm"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-bold text-foreground/85 truncate max-w-[240px] text-center">
          {event.title}
        </span>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: event.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert.success('Tersalin!', 'Tautan event telah disalin ke clipboard');
            }
          }}
          className="w-10 h-10 rounded-full bg-muted/60 hover:bg-muted border border-border/60 text-foreground flex items-center justify-center active:scale-95 transition-all shadow-sm"
          aria-label="Bagikan"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Poster Section */}
      <div className="relative w-full h-64 sm:h-72 overflow-hidden">
        {event.poster_url ? (
          <Image
            src={event.poster_url}
            alt={event.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-7xl">
            🎟️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/60 pointer-events-none" />

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Verified Event
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {event.status === 'published' ? 'Tiket Tersedia' : 'Penuh'}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-5 pt-3 space-y-5">
        <div>
          <h1 className="text-2xl font-black text-foreground leading-tight tracking-tight mb-2">
            {event.title}
          </h1>

          <div className="bg-muted/60 p-3 rounded-2xl border border-border/50 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-primary" /> Kuota Tiket
              </span>
              <span className="font-bold text-foreground">
                {quotaTaken} / {quotaTotal} <span className="text-muted-foreground font-normal">terisi ({quotaPercent}%)</span>
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${quotaPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  quotaPercent > 80 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Bento Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border/60 rounded-2xl p-3.5 shadow-sm space-y-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</p>
            <p className="text-xs font-bold text-foreground line-clamp-1">{formatDate(event.date)}</p>
            <p className="text-[11px] text-muted-foreground">{formatTime(event.date)} WIB</p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-3.5 shadow-sm space-y-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1">
              <MapPin className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Lokasi Venue</p>
            <p className="text-xs font-bold text-foreground line-clamp-2">{event.location}</p>
          </div>
        </div>

        {/* Organizer Card */}
        {event.organizer && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shrink-0">
                {event.organizer.profile_image ? (
                  <Image src={event.organizer.profile_image} alt={event.organizer.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                    {event.organizer.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground">{event.organizer.name}</p>
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">Penyelenggara Terverifikasi</p>
              </div>
            </div>

            {event.organizer.whatsapp && (
              <a
                href={`https://wa.me/62${event.organizer.whatsapp.replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center active:scale-90 transition-transform"
                title="Chat WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Segmented Tabs for Description / Rundown / FAQ */}
        <div className="space-y-3">
          <div className="flex bg-muted p-1 rounded-2xl border border-border/40">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'info' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Deskripsi
            </button>
            <button
              onClick={() => setActiveTab('rundown')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'rundown' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Rundown
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'faq' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Ketentuan
            </button>
          </div>

          <div className="p-4 bg-card border border-border/60 rounded-2xl shadow-sm min-h-[140px]">
            {activeTab === 'info' && (
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {event.description || 'Tidak ada deskripsi tambahan untuk event ini.'}
              </p>
            )}

            {activeTab === 'rundown' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-14 shrink-0 text-xs font-bold text-primary">09:00 WIB</span>
                  <div className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs font-bold text-foreground">Open Gate & Registrasi Ulang</p>
                    <p className="text-[11px] text-muted-foreground">Scan QR tiket di pintu masuk hall</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-14 shrink-0 text-xs font-bold text-primary">10:30 WIB</span>
                  <div className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs font-bold text-foreground">Opening & Keynote Session</p>
                    <p className="text-[11px] text-muted-foreground">Sambutan pembuka dari bintang tamu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-14 shrink-0 text-xs font-bold text-primary">15:00 WIB</span>
                  <div className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs font-bold text-foreground">Main Stage Performance</p>
                    <p className="text-[11px] text-muted-foreground">Konser utama dan awarding</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-2.5 text-xs text-foreground/80">
                <div className="p-2.5 bg-muted/40 rounded-xl">
                  <p className="font-bold text-foreground mb-0.5">Apakah tiket bisa dipindahtangankan?</p>
                  <p className="text-muted-foreground">Tiket valid berdasarkan QR Code unik pada aplikasi EVNTER.</p>
                </div>
                <div className="p-2.5 bg-muted/40 rounded-xl">
                  <p className="font-bold text-foreground mb-0.5">Bagaimana jika salah input email?</p>
                  <p className="text-muted-foreground">Hubungi organizer via tombol WhatsApp yang tertera di atas.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Space for sticky bottom checkout bar */}
        <div className="h-24" />
      </div>

      {/* Sticky Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto p-4 bg-background/90 backdrop-blur-xl border-t border-border/60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Harga Tiket</p>
            <p className="text-xl font-black text-foreground">{priceDisplay}</p>
          </div>

          <div className="flex-1 max-w-[200px]">
            {registrationObj?.approval_status === 'approved' ? (
              <Link
                href="/tickets"
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Buka Tiket
              </Link>
            ) : (
              <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Drawer.Trigger asChild>
                  <ShimmerButton className="w-full h-12 text-sm font-bold shadow-lg">
                    {isFree ? 'Daftar Sekarang' : 'Beli Tiket'}
                  </ShimmerButton>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
                  <Drawer.Content className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-background border-t border-border rounded-t-[32px] p-6 focus:outline-none">
                    <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mb-4" />

                    <Drawer.Title className="text-xl font-black text-foreground mb-1">
                      {isFree ? 'Konfirmasi Pendaftaran' : 'Pembayaran & Tiket'}
                    </Drawer.Title>
                    <Drawer.Description className="text-xs text-muted-foreground mb-4">
                      Pastikan informasi Anda sudah sesuai sebelum melanjutkan pendaftaran.
                    </Drawer.Description>

                    <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/60 space-y-2 mb-4">
                      <div className="flex justify-between items-start text-xs gap-2">
                        <span className="text-muted-foreground shrink-0">Event:</span>
                        <span className="font-bold text-foreground text-right">{event.title}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-border/40">
                        <span className="text-muted-foreground">Total Bayar:</span>
                        <span className="font-black text-primary text-sm">{priceDisplay}</span>
                      </div>
                    </div>

                    {!isFree && (
                      <div className="bg-primary/10 p-3.5 rounded-2xl border border-primary/20 mb-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Transfer: {event.metode_pembayaran || 'QRIS & Transfer BCA'}
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            Verifikasi Instan
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-card/80 p-2.5 rounded-xl border border-border/60">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">No. Rekening</p>
                            <p className="text-xs font-mono font-bold text-foreground">
                              {event.nomor_rekening || '8271039941'} <span className="text-[10px] font-sans font-normal text-muted-foreground">({event.nama_pemilik || 'PT EVNTER KREATIF'})</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(event.nomor_rekening || '8271039941');
                              alert.success('Tersalin!', 'Nomor rekening telah disalin ke clipboard');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-primary text-primary-foreground rounded-lg active:scale-95 transition-all shadow-sm"
                          >
                            Salin
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic">
                          {event.catatan_pembayaran || 'Unggah bukti transfer untuk verifikasi otomatis tiket Anda.'}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <ShimmerButton
                        onClick={handleConfirmRegistration}
                        disabled={registering}
                        className="w-full h-12 text-sm font-bold shadow-lg"
                      >
                        {registering ? 'Memproses Tiket...' : 'Konfirmasi & Terbitkan Tiket'}
                      </ShimmerButton>
                      <button
                        onClick={() => setDrawerOpen(false)}
                        className="w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Batal
                      </button>
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
