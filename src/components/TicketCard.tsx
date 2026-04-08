'use client';
import Link from 'next/link';
import { Ticket } from '@/types';
import { formatDate } from '@/utils/helpers';
import Card from './Card';

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const statusLabels = {
    active: { label: 'Aktif', class: 'bg-green-100 text-green-700' },
    checked_in: { label: 'Sudah Hadir', class: 'bg-blue-100 text-blue-700' },
    expired: { label: 'Kedaluwarsa', class: 'bg-gray-100 text-gray-500' },
  };
  const status = statusLabels[ticket.status];
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="flex gap-3 items-center">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          🎟️
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate">{ticket.event?.title || 'Event'}</h3>
          {ticket.event?.date && (
            <p className="text-sm text-gray-500">{formatDate(ticket.event.date)}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{ticket.ticket_code}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${status.class}`}>
          {status.label}
        </span>
      </Card>
    </Link>
  );
}
