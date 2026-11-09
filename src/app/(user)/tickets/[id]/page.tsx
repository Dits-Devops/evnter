'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Ticket as TicketIcon,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Ticket } from '@/types';
import { formatDate, formatTime, createWhatsAppMessage } from '@/utils/helpers';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { triggerConfetti } from '@/lib/confetti';
import { MobileDrawer } from '@/components/ui/MobileDrawer';
import { mockTickets } from '@/lib/mockData';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const initialFallback = mockTickets.find((t) => t.id === params.id || t.id === 't1') || mockTickets[0];
  const [ticket, setTicket] = useState<Ticket | null>(initialFallback || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setTicket(data.ticket))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const copyCode = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticket_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
        <div className="w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-foreground">Tiket Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-xs">
          Tiket mungkin telah dipindahkan atau kode tiket tidak valid.
        </p>
        <Link
          href="/tickets"
          className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-md"
        >
          Kembali ke Tiket Saya
        </Link>
      </div>
    );
  }

  const isCheckedIn = ticket.status === 'checked_in';
  const isExpired = ticket.status === 'expired';
  const isActive = ticket.status === 'active';

  const waLink = ticket.event
    ? createWhatsAppMessage(ticket.ticket_code, ticket.event.title, ticket.event.date)
    : null;

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-44">
      <BackgroundGlow variant="mesh" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 pt-11 pb-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-card border border-border/70 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
            Digital Pass
          </span>
          <h1 className="text-sm font-bold text-foreground">Detail Tiket</h1>
        </div>

        <button
          onClick={() => setHelpOpen(true)}
          className="w-10 h-10 rounded-2xl bg-card border border-border/70 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all shadow-sm"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </header>

      {/* Main Boarding Pass Container */}
      <div className="max-w-md mx-auto px-5 pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative bg-card rounded-[2rem] border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden"
        >
          {/* Header Strip with Holographic shimmer */}
          <div className="relative h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 flex items-center justify-between text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <TicketIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100 block">
                  EVNTER PASS
                </span>
                <span className="text-xs font-black tracking-tight text-white">VIP ENTRY PASS</span>
              </div>
            </div>

            {/* Status Chip */}
            <div className="relative z-10">
              {isActive && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-200 text-[11px] font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  VALID & AKTIF
                </span>
              )}
              {isCheckedIn && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/40 text-blue-200 text-[11px] font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                  SUDAH MASUK
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-500/20 backdrop-blur-md border border-gray-400/40 text-gray-300 text-[11px] font-extrabold">
                  KEDALUWARSA
                </span>
              )}
            </div>
          </div>

          {/* Event Info Area */}
          <div className="p-6">
            <h2 className="text-xl font-black text-foreground tracking-tight leading-snug">
              {ticket.event?.title || 'Event Resmi'}
            </h2>

            {/* Bento metadata pills */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="bg-muted/40 border border-border/50 rounded-2xl p-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" /> Tanggal
                </span>
                <p className="text-xs font-bold text-foreground mt-1">
                  {ticket.event?.date ? formatDate(ticket.event.date) : '-'}
                </p>
              </div>

              <div className="bg-muted/40 border border-border/50 rounded-2xl p-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" /> Waktu
                </span>
                <p className="text-xs font-bold text-foreground mt-1">
                  {ticket.event?.date ? `${formatTime(ticket.event.date)} WIB` : '19:00 WIB'}
                </p>
              </div>

              <div className="col-span-2 bg-muted/40 border border-border/50 rounded-2xl p-3 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Lokasi Venue
                  </span>
                  <p className="text-xs font-bold text-foreground mt-0.5 line-clamp-1">
                    {ticket.event?.location || 'Venue Utama'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notch Perforation Divider */}
          <div className="relative py-2 flex items-center justify-between">
            {/* Left cutout circle */}
            <div className="w-6 h-8 bg-background rounded-r-full border-r border-y border-border/80 -ml-1 shadow-inner" />
            
            {/* Dashed line */}
            <div className="flex-1 border-t-2 border-dashed border-border/70 mx-3" />

            {/* Right cutout circle */}
            <div className="w-6 h-8 bg-background rounded-l-full border-l border-y border-border/80 -mr-1 shadow-inner" />
          </div>

          {/* QR Code & Passcode Area */}
          <div className="p-6 pt-3 text-center bg-card">
            {isActive && (
              <div className="space-y-4">
                <div className="relative inline-block p-4 rounded-3xl bg-white shadow-md border border-border/40">
                  <QRCodeDisplay
                    value={ticket.qr_token}
                    size={210}
                    ticketCode={ticket.ticket_code}
                  />
                  {/* Subtle scanner laser line animation */}
                  <div className="absolute inset-x-4 top-4 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse pointer-events-none" />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Tunjukkan QR code ini ke petugas di pintu masuk
                  </span>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/70 border border-border/60">
                    <span className="font-mono text-sm font-black text-foreground tracking-widest">
                      {ticket.ticket_code}
                    </span>
                    <button
                      onClick={copyCode}
                      className="text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                      title="Salin Kode"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isCheckedIn && (
              <div className="py-6 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-foreground">Tiket Telah Digunakan</h3>
                <p className="text-xs text-muted-foreground">
                  Check-in berhasil tercatat pada{' '}
                  <span className="font-bold text-foreground">
                    {ticket.checked_in_at ? `${formatTime(ticket.checked_in_at)} WIB` : 'hari event'}
                  </span>
                </p>
                <div className="pt-2">
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    KODE: {ticket.ticket_code}
                  </span>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="py-6 px-4 bg-muted/50 border border-border/60 rounded-3xl text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-black text-foreground">Tiket Kedaluwarsa</h3>
                <p className="text-xs text-muted-foreground">
                  Event telah selesai diselenggarakan.
                </p>
              </div>
            )}

            {/* Barcode visual decoration */}
            <div className="mt-6 pt-4 border-t border-border/40 flex flex-col items-center">
              <div className="flex items-center gap-1 h-8 opacity-60">
                {[4, 2, 6, 2, 1, 5, 2, 3, 6, 2, 4, 1, 5, 2, 3, 2, 4, 6, 1, 3, 2, 5, 2, 4, 3].map((w, i) => (
                  <div key={i} className="h-full bg-foreground" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground mt-1.5 uppercase">
                DIGITAL ASSET · SECURED BY EVNTER
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          {waLink && isActive && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="block">
              <ShimmerButton className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/20">
                <Share2 className="w-4 h-4" />
                Kirim Tiket via WhatsApp
              </ShimmerButton>
            </a>
          )}

          <button
            onClick={() => {
              triggerConfetti();
              copyCode();
            }}
            className="w-full h-11 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-muted active:scale-98 transition-all shadow-sm"
          >
            <Copy className="w-3.5 h-3.5 text-primary" />
            {copied ? 'Kode Tiket Disalin!' : 'Salin Kode Tiket'}
          </button>

          {/* Safe area spacer */}
          <div className="h-20" />
        </div>
      </div>

      {/* Vaul Bottom Sheet Drawer for Help & Entry Rules */}
      <MobileDrawer
        open={helpOpen}
        onOpenChange={setHelpOpen}
        title="Ketentuan & Akses Masuk"
      >
        <div className="space-y-4 text-xs text-foreground pb-6">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Verifikasi Resmi EVNTER</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Tiket ini adalah tiket resmi yang telah diverifikasi oleh sistem database EVNTER.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-black text-sm text-foreground">Panduan Pintu Masuk:</h4>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Pastikan layar ponsel Anda memiliki kecerahan cukup saat scanning.</li>
              <li>Satu barcode/QR hanya dapat di-scan 1 kali untuk 1 peserta.</li>
              <li>Dilarang membagikan barcode kepada pihak yang tidak berhak.</li>
              <li>Tunjukkan kartu identitas (KTP/Pelajar) jika diminta oleh panitia.</li>
            </ul>
          </div>

          <button
            onClick={() => setHelpOpen(false)}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs mt-2"
          >
            Mengerti, Tutup
          </button>
        </div>
      </MobileDrawer>
    </div>
  );
}
