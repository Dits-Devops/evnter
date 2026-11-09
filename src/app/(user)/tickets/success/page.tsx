'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Ticket } from '@/types';
import { formatDate, formatTime, createWhatsAppMessage } from '@/utils/helpers';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { triggerConfetti } from '@/lib/confetti';
import { Sparkles, CheckCircle2, Ticket as TicketIcon, Share2, ArrowRight, Home } from 'lucide-react';

export default function TicketSuccessPage() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticket_id');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger celebratory confetti
    triggerConfetti();

    if (ticketId) {
      fetch(`/api/tickets/${ticketId}?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => setTicket(data.ticket))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const waLink = ticket?.event
    ? createWhatsAppMessage(ticket.ticket_code, ticket.event.title, ticket.event.date)
    : null;

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-5 pb-24">
      <BackgroundGlow variant="spotlight" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm space-y-6 text-center relative z-10"
      >
        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-emerald-500/30 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25 border border-emerald-400/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Pendaftaran Berhasil!</h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            E-Tiket resmi Anda telah diterbitkan dan siap digunakan untuk masuk ke venue.
          </p>
        </div>

        {/* Ticket Mini Card Preview */}
        {ticket && (
          <div className="bg-card/90 backdrop-blur-md rounded-3xl border border-border/80 p-5 shadow-lg space-y-4 text-left">
            <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-wider">
              <TicketIcon className="w-3.5 h-3.5" />
              <span>Tiket Terverifikasi</span>
            </div>

            <div>
              <h3 className="text-base font-black text-foreground line-clamp-1">
                {ticket.event?.title || 'Event Resmi'}
              </h3>
              {ticket.event?.date && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  📅 {formatDate(ticket.event.date)} · {formatTime(ticket.event.date)} WIB
                </p>
              )}
            </div>

            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <QRCodeDisplay
                value={ticket.qr_token}
                size={160}
                ticketCode={ticket.ticket_code}
              />
              <span className="font-mono text-xs font-black text-black tracking-widest mt-2">
                {ticket.ticket_code}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="block">
              <ShimmerButton className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/20">
                <Share2 className="w-4 h-4" />
                Kirim Tiket ke WhatsApp
              </ShimmerButton>
            </a>
          )}

          <Link href={ticket ? `/tickets/${ticket.id}` : '/tickets'} className="block">
            <button className="w-full h-11 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-muted active:scale-98 transition-all shadow-sm">
              <TicketIcon className="w-3.5 h-3.5 text-primary" />
              Buka E-Pass Lengkap
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>

          <Link href="/" className="block">
            <button className="w-full h-10 text-muted-foreground hover:text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors">
              <Home className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
