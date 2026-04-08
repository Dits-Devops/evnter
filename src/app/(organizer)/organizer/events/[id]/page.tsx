'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Event, Ticket, EventRegistration } from '@/types';
import { formatDate, formatDateTime } from '@/utils/helpers';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusMessage from '@/components/StatusMessage';

type TabType = 'menunggu' | 'disetujui' | 'checkin' | 'belum';

export default function OrganizerEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('menunggu');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [eventRes, ticketsRes, regRes] = await Promise.all([
      fetch(`/api/events/${params.id}`),
      fetch(`/api/tickets?event_id=${params.id}`),
      fetch(`/api/registrations?event_id=${params.id}`),
    ]);
    if (eventRes.ok) {
      const d = await eventRes.json();
      setEvent(d.event);
    }
    if (ticketsRes.ok) {
      const d = await ticketsRes.json();
      setTickets(d.tickets || []);
    }
    if (regRes.ok) {
      const d = await regRes.json();
      setRegistrations(d.registrations || []);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleApproval(regId: string, action: 'approve' | 'reject') {
    setProcessing(regId);
    setActionMsg(null);
    const res = await fetch(`/api/registrations/${regId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) {
      setActionMsg({ type: 'success', text: data.message });
      await fetchData();
    } else {
      setActionMsg({ type: 'error', text: data.error || 'Gagal memproses' });
    }
    setProcessing(null);
  }

  if (loading) return <LoadingSpinner size="lg" />;
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-gray-600">Event tidak ditemukan</p>
      </div>
    );
  }

  const pendingRegs = registrations.filter((r) => r.approval_status === 'pending_approval');
  const approvedRegs = registrations.filter((r) => r.approval_status === 'approved');
  const checkedInTickets = tickets.filter((t) => t.status === 'checked_in');
  const notCheckedIn = tickets.filter((t) => t.status === 'active');

  const tabs: { key: TabType; label: string; count: number; color: string }[] = [
    { key: 'menunggu', label: 'Menunggu', count: pendingRegs.length, color: 'text-yellow-600' },
    { key: 'disetujui', label: 'Disetujui', count: approvedRegs.length + tickets.length, color: 'text-blue-600' },
    { key: 'checkin', label: 'Check-in', count: checkedInTickets.length, color: 'text-green-600' },
    { key: 'belum', label: 'Belum Hadir', count: notCheckedIn.length, color: 'text-gray-600' },
  ];

  return (
    <div>
      <Header title="Detail Event" showBack />
      <div className="px-4 py-4">
        {/* Event Summary */}
        <Card className="mb-4">
          <h2 className="font-black text-gray-800 text-xl mb-2">{event.title}</h2>
          <p className="text-sm text-blue-600 mb-1">📅 {formatDate(event.date)}</p>
          <p className="text-sm text-gray-500 mb-1">📍 {event.location}</p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="text-center py-3">
            <p className="text-2xl font-black text-yellow-600">{pendingRegs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Menunggu</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-black text-blue-600">{approvedRegs.length + tickets.length}</p>
            <p className="text-xs text-gray-500 mt-1">Peserta</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-black text-green-600">{checkedInTickets.length}</p>
            <p className="text-xs text-gray-500 mt-1">Check-in</p>
          </Card>
        </div>

        {actionMsg && (
          <div className="mb-4">
            <StatusMessage type={actionMsg.type} message={actionMsg.text} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 ${tab.color} font-bold`}>({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'menunggu' && (
          <div className="flex flex-col gap-2">
            {pendingRegs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">⏳</p>
                <p>Tidak ada yang menunggu persetujuan</p>
              </div>
            ) : (
              pendingRegs.map((reg) => (
                <Card key={reg.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {reg.user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{reg.user?.name || 'Peserta'}</p>
                      <p className="text-xs text-gray-500">{reg.user?.whatsapp}</p>
                      <p className="text-xs text-yellow-600 font-semibold mt-0.5">Menunggu Persetujuan</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(reg.id, 'approve')}
                      loading={processing === reg.id}
                      className="flex-1"
                    >
                      ✅ Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleApproval(reg.id, 'reject')}
                      loading={processing === reg.id}
                      className="flex-1"
                    >
                      ❌ Tolak
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'disetujui' && (
          <div className="flex flex-col gap-2">
            {tickets.length === 0 && approvedRegs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">👥</p>
                <p>Belum ada peserta yang disetujui</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                    {ticket.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{ticket.user?.name || 'Peserta'}</p>
                    <p className="text-xs text-gray-400 font-mono">{ticket.ticket_code}</p>
                    <p className="text-xs text-gray-500">{ticket.user?.whatsapp}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                      ticket.status === 'checked_in'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {ticket.status === 'checked_in' ? 'Hadir' : 'Aktif'}
                  </span>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="flex flex-col gap-2">
            {checkedInTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p>Belum ada peserta yang check-in</p>
              </div>
            ) : (
              checkedInTickets.map((ticket) => (
                <Card key={ticket.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                    {ticket.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{ticket.user?.name || 'Peserta'}</p>
                    <p className="text-xs text-gray-400 font-mono">{ticket.ticket_code}</p>
                    {ticket.checked_in_at && (
                      <p className="text-xs text-green-600">✅ {formatDateTime(ticket.checked_in_at)}</p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'belum' && (
          <div className="flex flex-col gap-2">
            {notCheckedIn.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🎉</p>
                <p>Semua peserta sudah check-in!</p>
              </div>
            ) : (
              notCheckedIn.map((ticket) => (
                <Card key={ticket.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                    {ticket.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{ticket.user?.name || 'Peserta'}</p>
                    <p className="text-xs text-gray-400 font-mono">{ticket.ticket_code}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold flex-shrink-0">
                    Belum Hadir
                  </span>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
