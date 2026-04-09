'use client';
import Link from 'next/link';
import { Ticket as TicketType } from '@/types';
import { formatDate } from '@/utils/helpers';
import { Ticket, Calendar, QrCode } from 'lucide-react';
import Card from './Card';

interface TicketCardProps {
  ticket: TicketType;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const statusLabels = {
    active: { label: '🎫 Aktif', class: 'bg-primary/10 text-primary border-primary/20' },
    checked_in: { label: '✅ Selesai', class: 'bg-green-100 text-green-700 border-green-200' },
    expired: { label: 'Kedaluwarsa', class: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const status = statusLabels[ticket.status];
  
  return (
    <Link href={`/tickets/${ticket.id}`} className="block group">
      <Card padding={false} className="flex overflow-hidden relative active:scale-[0.98] transition-transform">
        
        {/* Pass Cutout visual effects */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-background rounded-full border-r border-border z-10" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-background rounded-full border-l border-border z-10" />
        
        <div className="p-4 bg-primary/5 flex items-center justify-center border-r border-dashed border-border w-[90px] flex-col shrink-0">
          <QrCode className="w-8 h-8 text-primary mb-1" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">SCAN</span>
        </div>
        
        <div className="flex-1 p-4 min-w-0 flex flex-col justify-center bg-card">
          <h3 className="font-extrabold text-foreground truncate text-base group-hover:text-primary transition-colors">
            {ticket.event?.title || 'Event Ticket'}
          </h3>
          
          {ticket.event?.date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(ticket.event.date)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs font-mono font-bold text-muted-foreground tracking-widest">{ticket.ticket_code}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${status.class}`}>
              {status.label}
            </span>
          </div>
        </div>
        
      </Card>
    </Link>
  );
}
