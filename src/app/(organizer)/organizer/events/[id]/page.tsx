'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Event, Ticket, EventRegistration } from '@/types';
import { formatDate, formatDateTime, getProfileImageUrl } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { mockEvents, mockTickets, mockRegistrations } from '@/lib/mockData';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  Edit3, 
  Power, 
  Trash2, 
  Clock, 
  Users, 
  CheckCircle2, 
  UserCheck, 
  XCircle, 
  ZoomIn, 
  MessageCircle, 
  Check, 
  X, 
  Sparkles,
  Ticket as TicketIcon
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';

type TabType = 'menunggu' | 'disetujui' | 'checkin' | 'belum';

export default function OrganizerEventPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'evt-1';
  const targetId = (rawId === 'e1' || rawId === '1') ? 'evt-1' : rawId;

  const initialEv = mockEvents.find((e) => e.id === targetId || e.id === rawId) || mockEvents[0];
  const initialTkts = mockTickets.filter((t) => t.event_id === targetId || t.event_id === rawId);
  const initialRegs = mockRegistrations.filter((r) => r.event_id === targetId || r.event_id === rawId);

  const [event, setEvent] = useState<Event | null>(initialEv);
  const [tickets, setTickets] = useState<Ticket[]>(initialTkts);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(
    initialRegs.length > 0 ? initialRegs : mockRegistrations
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('menunggu');
  const [processing, setProcessing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [proofModal, setProofModal] = useState<EventRegistration | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      const t = Date.now();
      const [eventRes, ticketsRes, regRes] = await Promise.all([
        fetch(`/api/events/${params.id}?t=${t}`).catch(() => null),
        fetch(`/api/tickets?event_id=${params.id}&t=${t}`).catch(() => null),
        fetch(`/api/registrations?event_id=${params.id}&t=${t}`).catch(() => null),
      ]);

      if (eventRes && eventRes.ok) {
        const d = await eventRes.json();
        setEvent(d.event);
      }
      if (ticketsRes && ticketsRes.ok) {
        const d = await ticketsRes.json();
        setTickets(d.tickets || []);
      }
      if (regRes && regRes.ok) {
        const d = await regRes.json();
        setRegistrations(d.registrations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  async function handleApproval(regId: string, action: 'approve' | 'reject') {
    setProcessing(regId);
    if (action === 'approve') fireConfetti();

    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === regId
          ? { ...r, approval_status: action === 'approve' ? 'approved' : 'rejected' }
          : r
      )
    );
    showToast(action === 'approve' ? 'Pendaftaran disetujui & tiket terbit!' : 'Pendaftaran ditolak');

    try {
      await fetch(`/api/registrations/${regId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      await fetchData(true);
    } catch {
      // offline fallback
    } finally {
      setProcessing(null);
    }
  }

  async function handleTogglePublish() {
    if (!event) return;
    setProcessing('publish');
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    setEvent((prev) => (prev ? { ...prev, status: newStatus } : prev));
    showToast(newStatus === 'published' ? 'Event dipublikasikan' : 'Event diubah ke Draf');

    try {
      await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // offline fallback
    } finally {
      setProcessing(null);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm(`Hapus event "${event.title}" secara permanen? Data tidak dapat dikembalikan.`)) return;

    setDeleting(true);
    try {
      await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      router.replace('/organizer/my-events');
    } catch {
      router.replace('/organizer/my-events');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Memuat Data Event..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground space-y-3">
        <div className="w-14 h-14 rounded-3xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
          <TicketIcon className="w-7 h-7" />
        </div>
        <p className="text-base font-bold text-foreground">Event Tidak Ditemukan</p>
        <Link href="/organizer/my-events" className="text-xs font-bold text-primary">
          ← Kembali ke Event Saya
        </Link>
      </div>
    );
  }

  const pendingRegs = registrations.filter((r) => r.approval_status === 'pending_approval');
  const approvedRegs = registrations.filter((r) => r.approval_status === 'approved');
  const checkedInTickets = tickets.filter((t) => t.status === 'checked_in');
  const notCheckedIn = tickets.filter((t) => t.status === 'active');

  const tabs: { key: TabType; label: string; count: number; icon: any }[] = [
    { key: 'menunggu', label: 'Menunggu', count: pendingRegs.length, icon: Clock },
    { key: 'disetujui', label: 'Peserta', count: approvedRegs.length, icon: Users },
    { key: 'checkin', label: 'Hadir', count: checkedInTickets.length, icon: CheckCircle2 },
    { key: 'belum', label: 'Belum Hadir', count: notCheckedIn.length, icon: UserCheck },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-28">
      <BackgroundGlow variant="mesh" />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/organizer/my-events"
              className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-500">
                <Sparkles className="w-3 h-3" /> Manajemen Acara
              </div>
              <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
                Kelola Event
              </h1>
            </div>
          </div>

          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-primary transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Card Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-3.5 relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span
                className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-1.5 ${
                  event.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}
              >
                {event.status === 'published' ? 'Tayang Aktif' : 'Draf Pribadi'}
              </span>
              <h2 className="text-lg font-black text-foreground leading-snug">{event.title}</h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-black text-primary">
                {event.price ? `Rp ${event.price.toLocaleString('id-ID')}` : 'Gratis'}
              </span>
              <span className="block text-[10px] text-muted-foreground font-semibold">
                Kapasitas: {event.max_peserta || '∞'}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{formatDate(event.date)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{event.location || 'Venue TBA'}</span>
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-border/50 flex items-center gap-2">
            <button
              onClick={() => router.push(`/organizer/events/${event.id}/edit`)}
              className="flex-1 py-2 px-3 rounded-2xl bg-muted text-foreground hover:bg-muted/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>

            <button
              onClick={handleTogglePublish}
              disabled={processing === 'publish'}
              className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                event.status === 'published'
                  ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {event.status === 'published' ? 'Nonaktifkan' : 'Aktifkan'}
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="py-2 px-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-card border border-border/80 p-3 text-center shadow-sm">
            <p className="text-xl font-black text-amber-500">{pendingRegs.length}</p>
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Menunggu</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/80 p-3 text-center shadow-sm">
            <p className="text-xl font-black text-blue-500">{approvedRegs.length}</p>
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Peserta</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/80 p-3 text-center shadow-sm">
            <p className="text-xl font-black text-emerald-500">{checkedInTickets.length}</p>
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Check-in</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-3 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {activeTab === 'menunggu' && (
            pendingRegs.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-xs font-extrabold text-foreground">Tidak Ada Antrean Pendaftar</p>
                <p className="text-[11px] text-muted-foreground">Semua pendaftar telah diverifikasi</p>
              </div>
            ) : (
              pendingRegs.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-3xl bg-card border-2 border-amber-500/30 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 font-black text-sm flex items-center justify-center shrink-0">
                      {reg.user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-foreground truncate">
                        {reg.user?.name || 'Peserta'}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{reg.user?.whatsapp}</p>
                      <span className="inline-block text-[10px] font-black uppercase text-amber-500 mt-0.5">
                        Menunggu Persetujuan Tiket
                      </span>
                    </div>

                    {reg.payment_proof_url && (
                      <button
                        onClick={() => setProofModal(reg)}
                        className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1 shrink-0"
                      >
                        <ZoomIn className="w-3.5 h-3.5" /> Bukti TF
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleApproval(reg.id, 'reject')}
                      disabled={processing === reg.id}
                      className="flex-1 py-2 px-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-extrabold transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" /> Tolak
                    </button>
                    <button
                      onClick={() => handleApproval(reg.id, 'approve')}
                      disabled={processing === reg.id}
                      className="flex-1 py-2 px-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" /> Setujui
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'disetujui' && (
            approvedRegs.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs font-extrabold text-foreground">Belum Ada Peserta Disetujui</p>
                <p className="text-[11px] text-muted-foreground">Peserta akan tampil saat disetujui</p>
              </div>
            ) : (
              approvedRegs.map((reg) => {
                const ticket = tickets.find(
                  (t) => (t.registration_id && t.registration_id === reg.id) || t.user_id === reg.user_id
                );
                return (
                  <div
                    key={reg.id}
                    className="rounded-2xl bg-card border border-border/80 p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={getProfileImageUrl(reg.user)} name={reg.user?.name} size="md" />
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-foreground truncate">{reg.user?.name}</p>
                        <p className="text-[11px] font-mono font-bold text-primary">
                          {ticket?.ticket_code || 'EVT-SW882910'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{reg.user?.whatsapp || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          ticket?.status === 'checked_in'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}
                      >
                        {ticket?.status === 'checked_in' ? 'Hadir' : 'Disetujui'}
                      </span>
                      {reg.user?.whatsapp && (
                        <a
                          href={`https://wa.me/${reg.user.whatsapp.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(
                            reg.user?.name || ''
                          )},%20tiket%20Anda%20untuk%20${encodeURIComponent(event?.title || 'event')}%20telah%20disetujui!`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center justify-center"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )
          )}

          {activeTab === 'checkin' && (
            checkedInTickets.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-extrabold text-foreground">Belum Ada Check-in</p>
                <p className="text-[11px] text-muted-foreground">Scan QR tiket di gate venue untuk check-in</p>
              </div>
            ) : (
              checkedInTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl bg-card border border-border/80 p-3.5 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={getProfileImageUrl(ticket.user)} name={ticket.user?.name} size="md" />
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-foreground truncate">{ticket.user?.name}</p>
                      <p className="text-[11px] font-mono font-bold text-primary">{ticket.ticket_code}</p>
                      {ticket.checked_in_at && (
                        <p className="text-[10px] text-emerald-500 font-semibold">
                          Hadir: {formatDateTime(ticket.checked_in_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                    Verified
                  </span>
                </div>
              ))
            )
          )}

          {activeTab === 'belum' && (
            notCheckedIn.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-extrabold text-foreground">Semua Peserta Sudah Hadir!</p>
                <p className="text-[11px] text-muted-foreground">100% tingkat kehadiran event</p>
              </div>
            ) : (
              notCheckedIn.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl bg-card border border-border/80 p-3.5 flex items-center justify-between gap-3 shadow-sm opacity-85"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={getProfileImageUrl(ticket.user)} name={ticket.user?.name} size="md" />
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-foreground truncate">{ticket.user?.name}</p>
                      <p className="text-[11px] font-mono font-bold text-muted-foreground">{ticket.ticket_code}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                    Belum Hadir
                  </span>
                </div>
              ))
            )
          )}
          {/* Safe area spacer for floating dock */}
          <div className="h-20" />
        </div>
      </div>

      {/* Proof Modal */}
      <AnimatePresence>
        {proofModal && proofModal.payment_proof_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setProofModal(null)}
          >
            <div
              className="relative max-w-sm w-full bg-card rounded-3xl p-4 border border-border shadow-2xl space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="text-xs font-black text-foreground">Bukti Transfer Pendaftar</h3>
                <button
                  onClick={() => setProofModal(null)}
                  className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black/10">
                <Image
                  src={proofModal.payment_proof_url}
                  alt="Bukti Transfer"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground">Peserta: {proofModal.user?.name}</p>
                <p className="text-muted-foreground">WhatsApp: {proofModal.user?.whatsapp || '-'}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/50">
                <button
                  onClick={() => {
                    handleApproval(proofModal.id, 'reject');
                    setProofModal(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-black transition-all"
                >
                  Tolak
                </button>
                <button
                  onClick={() => {
                    handleApproval(proofModal.id, 'approve');
                    setProofModal(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-black transition-all shadow-sm"
                >
                  Setujui Tiket
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
