'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event, Ticket, EventRegistration } from '@/types';
import { formatDate, formatDateTime } from '@/utils/helpers';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { OrganizerEventSkeleton } from '@/components/Skeleton';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useToast } from '@/context/ToastContext';
import { useAlert } from '@/context/AlertContext';
import { supabase } from '@/lib/supabase';

type TabType = 'menunggu' | 'disetujui' | 'checkin' | 'belum';

export default function OrganizerEventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('menunggu');
  const toast = useToast();
  const alert = useAlert();
  const [processing, setProcessing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [proofModal, setProofModal] = useState<EventRegistration | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const t = Date.now();
      const [eventRes, ticketsRes, regRes] = await Promise.all([
        fetch(`/api/events/${params.id}?t=${t}`, { cache: 'no-store' }),
        fetch(`/api/tickets?event_id=${params.id}&t=${t}`, { cache: 'no-store' }),
        fetch(`/api/registrations?event_id=${params.id}&t=${t}`, { cache: 'no-store' }),
      ]);
      
      console.log(`[Organizer Debug] Fetch Responses - Event: ${eventRes.status}, Tickets: ${ticketsRes.status}, Regs: ${regRes.status}`);

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
        console.log(`[Organizer Debug] Successfully fetched ${d.registrations?.length || 0} registrations`);
        setRegistrations(d.registrations || []);
      } else {
        let errData = {};
        try {
          errData = await regRes.json();
        } catch (e) {
          console.warn('[Organizer Debug] Could not parse error JSON');
        }
        console.error(`[Organizer Debug] API Error ${regRes.status} (${regRes.statusText}):`, errData);
        toast.error(`Gagal memuat pendaftar (${regRes.status}): ${errData.details || 'Server Error'}`);
      }
    } catch (err) {
      console.error('Fetch Data Error:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchData();

    // Subscribe to REALTIME updates for this event
    const channel = supabase
      .channel(`organizer_event_${params.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${params.id}`,
        },
        () => {
          console.log('[Realtime] Registration changed, refreshing...');
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `event_id=eq.${params.id}`,
        },
        () => {
          console.log('[Realtime] Ticket changed, refreshing...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, params.id]);

  async function handleApproval(regId: string, action: 'approve' | 'reject') {
    setProcessing(regId);
    const res = await fetch(`/api/registrations/${regId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || 'Berhasil memperbarui status');
      await fetchData();
    } else {
      await alert.error('Gagal', data.error || 'Gagal memproses');
    }
    setProcessing(null);
  }

  async function handleTogglePublish() {
    if (!event) return;
    setProcessing('publish');
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === 'published' ? 'Event berhasil diaktifkan' : 'Event berhasil dinonaktifkan');
      await fetchData();
    } else {
      await alert.error('Gagal', 'Gagal mengubah status event');
    }
    setProcessing(null);
  }

  async function handleDelete() {
    if (!event) return;
    
    const isConfirm = await alert.confirm(
      'Yakin ingin menghapus?',
      `Hapus event "${event.title}" secara permanen berserta tiketnya? Data tidak bisa dikembalikan.`
    );
    if (!isConfirm) return;

    setDeleting(true);
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
    if (res.ok) {
      await alert.success('Berhasil', 'Event telah dihapus permanen.');
      router.replace('/organizer/my-events');
    } else {
      await alert.error('Gagal', 'Gagal menghapus event, silakan coba lagi.');
      setDeleting(false);
    }
  }

  if (loading) return <OrganizerEventSkeleton />;
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
    { key: 'disetujui', label: 'Disetujui', count: approvedRegs.length, color: 'text-blue-600' },
    { key: 'checkin', label: 'Check-in', count: checkedInTickets.length, color: 'text-green-600' },
    { key: 'belum', label: 'Belum Hadir', count: notCheckedIn.length, color: 'text-gray-600' },
  ];

  return (
    <div>
      <Header title="Detail Event" showBack />
      <div className="px-4 py-4">
        {/* Event Summary */}
        <Card className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="font-black text-gray-800 text-xl flex-1">{event.title}</h2>
            <span
              className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                event.status === 'published' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {event.status === 'published' ? 'Aktif' : 'Draft'}
            </span>
          </div>
          <p className="text-sm text-blue-600 mb-1">📅 {formatDate(event.date)}</p>
          <p className="text-sm text-gray-500 mb-3">📍 {event.location}</p>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl mb-4 border border-gray-100">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Pendaftar</p>
              <p className="text-lg font-black text-gray-800">{registrations.length} Orang</p>
            </div>
            <button 
              onClick={() => fetchData()}
              disabled={loading}
              className="text-xs font-bold text-primary bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? '...' : '🔄 Segarkan'}
            </button>
          </div>

          {/* Event Management Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => router.push(`/organizer/events/${event.id}/edit`)}
              className="text-sm font-semibold bg-gray-50 text-gray-700 rounded-xl py-2 px-3 flex-1"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleTogglePublish}
              disabled={processing === 'publish'}
              className={`flex-1 text-sm font-semibold rounded-xl py-2 px-3 disabled:opacity-50 ${
                event.status === 'published'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {processing === 'publish'
                ? '...'
                : event.status === 'published'
                ? '⏸ Nonaktifkan'
                : '▶ Aktifkan'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm font-semibold bg-red-50 text-red-600 rounded-xl py-2 px-3 flex-1 disabled:opacity-50"
            >
              {deleting ? 'Menghapus...' : '🗑 Hapus'}
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="text-center py-3">
            <p className="text-2xl font-black text-yellow-600">{pendingRegs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Menunggu</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-black text-blue-600">{approvedRegs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Peserta</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-black text-green-600">{checkedInTickets.length}</p>
            <p className="text-xs text-gray-500 mt-1">Check-in</p>
          </Card>
        </div>

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
                      <p className="text-xs text-gray-500 mb-1">{reg.user?.whatsapp}</p>
                      <p className="text-xs text-yellow-600 font-semibold mb-2">Menunggu Persetujuan</p>
                      
                      {reg.payment_proof_url && (
                        <div className="mt-2 text-left">
                          <button
                            onClick={() => setProofModal(reg)}
                            className="text-[11px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                          >
                            📸 Lihat Bukti TF
                          </button>
                        </div>
                      )}
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
            {approvedRegs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">👥</p>
                <p>Belum ada peserta yang disetujui</p>
              </div>
            ) : (
              approvedRegs.map((reg) => {
                const ticket = tickets.find(t => t.registration_id === reg.id);
                return (
                  <Card key={reg.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {reg.user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{reg.user?.name || 'Peserta'}</p>
                      {ticket && <p className="text-xs text-gray-400 font-mono">{ticket.ticket_code}</p>}
                      <p className="text-xs text-gray-500">{reg.user?.whatsapp}</p>
                    </div>
                    {ticket && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                          ticket.status === 'checked_in'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {ticket.status === 'checked_in' ? 'Hadir' : 'Aktif'}
                      </span>
                    )}
                  </Card>
                );
              })
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

      {proofModal && proofModal.payment_proof_url && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex flex-col justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setProofModal(null)}
        >
          <div className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden flex flex-col pt-3 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 pb-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">📸 Bukti Transfer</h3>
              <button 
                onClick={() => setProofModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold active:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-50 flex-1 overflow-y-auto">
              <a href={proofModal.payment_proof_url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={proofModal.payment_proof_url} 
                  alt="Bukti Transfer" 
                  className="w-full h-auto max-h-[50vh] object-contain rounded-2xl bg-white shadow-sm border border-gray-100"
                />
              </a>
              
              <div className="mt-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-500 font-medium">Peserta</span>
                    <span className="text-sm font-bold text-gray-800">{proofModal.user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-500 font-medium">WhatsApp</span>
                    <span className="text-sm font-bold text-gray-800">{proofModal.user?.whatsapp || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-500 font-medium">Waktu Upload</span>
                    <span className="text-xs font-bold text-gray-800 tracking-tight">{formatDateTime(proofModal.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-gray-500 font-medium">Status</span>
                    <span className="text-[10px] uppercase font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
                      {proofModal.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white flex gap-3 border-t border-gray-100">
               <Button
                  size="lg"
                  onClick={() => {
                    handleApproval(proofModal.id, 'approve');
                    setProofModal(null);
                  }}
                  loading={processing === proofModal.id}
                  className="flex-1"
                >
                  ✅ Setujui
                </Button>
                <Button
                  size="lg"
                  variant="danger"
                  onClick={() => {
                    handleApproval(proofModal.id, 'reject');
                    setProofModal(null);
                  }}
                  loading={processing === proofModal.id}
                  className="flex-1"
                >
                  ❌ Tolak
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
