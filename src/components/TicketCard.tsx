'use client';
import Link from 'next/link';
import { Ticket as TicketType } from '@/types';
import { formatDate } from '@/utils/helpers';
import { Calendar, QrCode, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface TicketCardProps {
  ticket: TicketType;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const statusLabels = {
    active: { 
      label: 'TIKET AKTIF', 
      class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
      badgeDot: 'bg-emerald-500',
    },
    checked_in: { 
      label: 'SUDAH SCAN', 
      class: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
      badgeDot: 'bg-blue-500',
    },
    expired: { 
      label: 'KEDALUWARSA', 
      class: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20',
      badgeDot: 'bg-neutral-400',
    },
  };
  const status = statusLabels[ticket.status] || statusLabels.active;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/tickets/${ticket.id}`} prefetch={true} className="block group">
        <div className="relative flex overflow-hidden rounded-[24px] border border-border/80 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_36px_-8px_rgba(37,99,235,0.15)] hover:border-primary/40 transition-all duration-300">
          
          {/* Perforated ticket cutout circles */}
          <div className="absolute top-1/2 left-[90px] -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-background rounded-full border border-border/80 z-20" />
          
          {/* Left QR Stub */}
          <div className="p-4 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent flex items-center justify-center border-r border-dashed border-border/80 w-[90px] flex-col shrink-0 relative overflow-hidden group-hover:from-primary/15 transition-colors">
            <div className="relative">
              <QrCode className="w-9 h-9 text-primary mb-1 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-[9px] font-black tracking-widest text-primary uppercase">E-PASS</span>
          </div>

          {/* Right Ticket Info */}
          <div className="flex-1 p-4 min-w-0 flex flex-col justify-between bg-card">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-full border ${status.class}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.badgeDot} animate-pulse`} />
                  {status.label}
                </span>
                <span className="text-[10px] font-mono font-bold text-muted-foreground/80 tracking-wider">
                  {ticket.ticket_code}
                </span>
              </div>

              <h3 className="font-extrabold text-foreground truncate text-sm group-hover:text-primary transition-colors">
                {ticket.event?.title || 'Tiket Masuk Event'}
              </h3>
            </div>

            <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              {ticket.event?.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">{formatDate(ticket.event.date)}</span>
                </div>
              )}
              {ticket.event?.location && (
                <div className="flex items-center gap-1 truncate max-w-[120px]">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate">{ticket.event.location}</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </Link>
    </motion.div>
  );
}
