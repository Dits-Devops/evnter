'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Ticket } from '@/types';
import { formatDate, formatTime, createWhatsAppMessage } from '@/utils/helpers';
import Header from '@/components/Header';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';

export default function TicketDetailPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`)
      .then((res) => res.json())
      .then((data) => setTicket(data.ticket))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-gray-600">Tiket tidak ditemukan</p>
      </div>
    );
  }

  const statusConfig = {
    active: { label: 'Aktif', class: 'bg-green-100 text-green-700', emoji: '✅' },
    checked_in: { label: 'Sudah Hadir', class: 'bg-blue-100 text-blue-700', emoji: '🎉' },
    expired: { label: 'Kedaluwarsa', class: 'bg-gray-100 text-gray-500', emoji: '⏸️' },
  };
  const status = statusConfig[ticket.status];

  const waLink = ticket.event
    ? createWhatsAppMessage(ticket.ticket_code, ticket.event.title, ticket.event.date)
    : null;

  return (
    <div>
      <Header title="Detail Tiket" showBack />
      <div className="px-4 py-6">
        {/* Event info */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-1">
            {ticket.event?.title || 'Event'}
          </h2>
          {ticket.event?.date && (
            <p className="text-sm text-blue-600 font-medium">
              📅 {formatDate(ticket.event.date)} · {formatTime(ticket.event.date)}
            </p>
          )}
          {ticket.event?.location && (
            <p className="text-sm text-gray-500 mt-1">📍 {ticket.event.location}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex justify-center mb-6">
          <span className={`px-4 py-2 rounded-full font-bold text-sm ${status.class}`}>
            {status.emoji} {status.label}
          </span>
        </div>

        {/* QR Code */}
        {ticket.status !== 'expired' && (
          <div className="flex justify-center mb-6">
            <QRCodeDisplay
              value={ticket.qr_token}
              size={220}
              ticketCode={ticket.ticket_code}
            />
          </div>
        )}

        {/* Check-in info */}
        {ticket.status === 'checked_in' && ticket.checked_in_at && (
          <div className="bg-blue-50 rounded-2xl p-4 mb-4 text-center">
            <p className="text-sm text-blue-700 font-medium">
              🎉 Check-in pada {formatDate(ticket.checked_in_at)} · {formatTime(ticket.checked_in_at)}
            </p>
          </div>
        )}

        {/* Share via WhatsApp */}
        {waLink && ticket.status === 'active' && (
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" fullWidth>
              💬 Bagikan ke WhatsApp
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
