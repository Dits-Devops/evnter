'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Ticket } from '@/types';
import { formatDate } from '@/utils/helpers';
import { createWhatsAppMessage } from '@/utils/helpers';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TicketSuccessPage() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticket_id');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
      fetch(`/api/tickets/${ticketId}`)
        .then((res) => res.json())
        .then((data) => setTicket(data.ticket))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [ticketId]);

  if (loading) return <LoadingSpinner size="lg" />;

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-gray-600">Tiket tidak ditemukan</p>
        <Link href="/tickets" className="mt-4 text-blue-600 font-semibold">
          Lihat Tiket Saya
        </Link>
      </div>
    );
  }

  const waLink = ticket.event
    ? createWhatsAppMessage(ticket.ticket_code, ticket.event.title, ticket.event.date)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-7xl mb-3">🎉</div>
          <h1 className="text-2xl font-black text-gray-800">Pendaftaran Berhasil!</h1>
          <p className="text-gray-500 mt-1">Tiket Anda sudah siap digunakan</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-800 text-center mb-1">
            {ticket.event?.title || 'Event'}
          </h2>
          {ticket.event?.date && (
            <p className="text-sm text-blue-600 text-center mb-4">
              📅 {formatDate(ticket.event.date)}
            </p>
          )}
          <div className="flex justify-center mb-4">
            <QRCodeDisplay
              value={ticket.qr_token}
              size={200}
              ticketCode={ticket.ticket_code}
            />
          </div>
          <p className="text-center text-xs text-gray-400">
            Tunjukkan QR Code ini saat check-in
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" fullWidth size="lg">
                💬 Bagikan ke WhatsApp
              </Button>
            </a>
          )}
          <Link href="/tickets">
            <Button fullWidth size="lg">🎟️ Lihat Semua Tiket</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" fullWidth>Kembali ke Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
