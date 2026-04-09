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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Header title="Detail Tiket" showBack />
      <div className="px-5 py-8">
        <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100 relative">
          
          {/* Top colored accent bar */}
          <div className="h-3 w-full bg-primary" />
          
          <div className="p-6">
            {/* Event info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-800 mb-2 leading-tight">
                {ticket.event?.title || 'Event'}
              </h2>
              {ticket.event?.date && (
                <div className="inline-flex flex-col items-center justify-center bg-blue-50/50 px-4 py-2 rounded-2xl">
                  <p className="text-sm text-blue-700 font-semibold mb-0.5">
                    📅 {formatDate(ticket.event.date)}
                  </p>
                  <p className="text-sm text-blue-600/80 font-medium">
                    ⏰ {formatTime(ticket.event.date)} WIB
                  </p>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-8">
              <span className={`px-4 py-1.5 rounded-full font-bold text-sm shadow-sm border border-black/5 ${status.class}`}>
                {status.emoji} {status.label}
              </span>
            </div>

            {/* Divider */}
            <div className="relative h-px w-full bg-dashed bg-gray-200 my-6">
              <div className="absolute -left-8 -top-3 w-6 h-6 bg-gray-50/50 rounded-full border-r border-gray-200" />
              <div className="absolute -right-8 -top-3 w-6 h-6 bg-gray-50/50 rounded-full border-l border-gray-200" />
            </div>

            {/* QR Code Section */}
            {ticket.status === 'active' && (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mix-blend-multiply">
                  <QRCodeDisplay
                    value={ticket.qr_token}
                    size={240}
                    ticketCode={ticket.ticket_code}
                  />
                </div>
                <p className="mt-4 font-mono text-gray-500 tracking-widest font-semibold">{ticket.ticket_code}</p>
              </div>
            )}

            {/* Check-in info */}
            {ticket.status === 'checked_in' && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm border border-emerald-200/50">
                  ✅
                </div>
                <h3 className="text-xl font-black text-emerald-800 mb-2">Sudah Hadir</h3>
                {ticket.checked_in_at && (
                  <p className="text-sm text-emerald-700/80 font-medium bg-white/50 py-1.5 px-3 rounded-full inline-block">
                    🕒 {formatTime(ticket.checked_in_at)} WIB
                  </p>
                )}
              </div>
            )}
            
            {/* Expired info */}
            {ticket.status === 'expired' && (
              <div className="mt-4 flex justify-center">
                 <p className="font-mono text-gray-400 tracking-widest line-through">{ticket.ticket_code}</p>
              </div>
            )}
          </div>
        </div>

        {/* Share via WhatsApp */}
        {waLink && ticket.status === 'active' && (
          <div className="max-w-sm mx-auto mt-6">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" fullWidth size="lg">
                💬 Bagikan ke WhatsApp
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
