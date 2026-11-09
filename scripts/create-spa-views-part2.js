const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../src/components/views');
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir, { recursive: true });
}

// 2. TicketsView
const ticketsViewCode = `'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket as TicketIcon, History, Sparkles, Compass } from 'lucide-react';
import { Ticket } from '@/types';
import TicketCard from '@/components/TicketCard';
import { TicketListSkeleton } from '@/components/Skeleton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ShimmerButton } from '@/components/ui/ShimmerButton';

export default function TicketsView({ onNavigate }: { onNavigate?: (hash: string) => void }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'aktif' | 'riwayat'>('aktif');

  const fetchTickets = async () => {
    try {
      const res = await fetch(\`/api/tickets?t=\${Date.now()}\`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    if (user) {
      const channel = supabase
        .channel(\`user_tickets_\${user.id}\`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
            filter: \`user_id=eq.\${user.id}\`,
          },
          () => fetchTickets()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const activeTickets = tickets.filter((t) => t.status === 'active');
  const historyTickets = tickets.filter((t) => t.status === 'checked_in' || t.status === 'expired');
  const displayTickets = tab === 'aktif' ? activeTickets : historyTickets;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header with gradient backdrop */}
      <div className="relative pt-6 pb-4 px-5 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit mb-1">
              <Sparkles className="w-3 h-3" /> E-Pass Wallet
            </span>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Tiket Saya
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center justify-center text-primary">
            <TicketIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Tab Pills */}
        <div className="bg-muted/70 p-1 rounded-2xl flex relative border border-border/40">
          <button
            onClick={() => setTab('aktif')}
            className={\`relative flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer \${
              tab === 'aktif' ? 'text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }\`}
          >
            {tab === 'aktif' && (
              <motion.div
                layoutId="ticketTabPill"
                className="absolute inset-0 bg-card rounded-xl border border-border/50"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <TicketIcon className="w-3.5 h-3.5" />
              Aktif ({activeTickets.length})
            </span>
          </button>

          <button
            onClick={() => setTab('riwayat')}
            className={\`relative flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer \${
              tab === 'riwayat' ? 'text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }\`}
          >
            {tab === 'riwayat' && (
              <motion.div
                layoutId="ticketTabPill"
                className="absolute inset-0 bg-card rounded-xl border border-border/50"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Riwayat ({historyTickets.length})
            </span>
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="px-5 pt-3">
        {loading ? (
          <TicketListSkeleton />
        ) : displayTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/50 border border-dashed border-border rounded-3xl mt-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <TicketIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1">
              {tab === 'aktif' ? 'Belum Ada Tiket Aktif' : 'Belum Ada Riwayat Tiket'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-[240px] mb-6">
              {tab === 'aktif'
                ? 'Tiket yang kamu beli akan muncul di sini dengan kode QR check-in.'
                : 'Tiket event yang sudah selesai atau telah kamu gunakan akan diarsipkan di sini.'}
            </p>
            <button
              onClick={() => onNavigate ? onNavigate('#events') : (window.location.hash = '#events')}
              className="w-full max-w-[200px]"
            >
              <ShimmerButton className="w-full text-xs py-2.5">
                <Compass className="w-3.5 h-3.5 mr-1.5" /> Jelajahi Event
              </ShimmerButton>
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TicketCard ticket={ticket} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'TicketsView.tsx'), ticketsViewCode, 'utf8');
console.log('TicketsView.tsx created');

// 3. NotificationsView
const notifViewCode = `'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, 
  Calendar, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Ticket as TicketIcon,
  Sparkles,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsView() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'tickets'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(\`/api/notifications?t=\${Date.now()}\`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const channel = supabase
        .channel(\`user_notifications_page_\${user.id}\`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: \`user_id=eq.\${user.id}\`,
          },
          () => fetchNotifications()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications', { method: 'PUT', body: JSON.stringify({}) });
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await fetch(\`/api/notifications/\${id}\`, { method: 'PUT' });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return !n.is_read;
      if (activeTab === 'tickets') return n.type === 'ticket' || n.type === 'success';
      return true;
    });
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket':
      case 'success':
        return <TicketIcon className="w-4 h-4 text-emerald-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <BackgroundGlow variant="spotlight" />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" /> Update Terkini
            </span>
            <h1 className="text-xl font-black tracking-tight">Pemberitahuan</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* Tab Filter */}
        <div className="flex gap-2">
          {(['all', 'unread', 'tickets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer \${
                activeTab === tab
                  ? 'border-primary/50 bg-primary/10 text-primary font-bold'
                  : 'border-border/60 text-muted-foreground hover:bg-muted/40'
              }\`}
            >
              {tab === 'all' && \`Semua (\${notifications.length})\`}
              {tab === 'unread' && \`Belum Dibaca (\${unreadCount})\`}
              {tab === 'tickets' && 'Tiket & Event'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">Kotak Masuk Bersih</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Tidak ada notifikasi baru untuk kategori ini. Kami akan mengabari saat tiketmu terbit atau ada event seru!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => (
              <motion.div
                key={n.id}
                onClick={() => markSingleRead(n.id)}
                whileTap={{ scale: 0.98 }}
                className={\`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-start \${
                  n.is_read
                    ? 'bg-card/40 border-border/40 opacity-75'
                    : 'bg-card border-primary/20 shadow-sm shadow-primary/5 ring-1 ring-primary/10'
                }\`}
              >
                <div className="p-2.5 rounded-xl bg-muted/80 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={\`text-xs leading-snug \${n.is_read ? 'text-foreground' : 'font-bold text-foreground'}\`}>
                      {n.message}
                    </p>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(n.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'NotificationsView.tsx'), notifViewCode, 'utf8');
console.log('NotificationsView.tsx created');

// 4. ProfileView
const profileViewCode = `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, ShieldCheck, Sparkles, 
  LogOut, Edit3, ChevronRight, Ticket, Calendar,
  CreditCard, CheckCircle2, ArrowUpRight, ScanLine, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { getProfileImageUrl } from '@/utils/helpers';
import { ShimmerButton } from '@/components/ui/ShimmerButton';

export default function ProfileView({ onNavigate }: { onNavigate?: (hash: string) => void }) {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const alert = useAlert();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    whatsapp: user?.whatsapp || '',
    profile_image: user?.profile_image || '',
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await refreshUser();
        await alert.success('Berhasil', 'Profil berhasil diperbarui');
        setEditing(false);
      } else {
        const data = await res.json();
        await alert.error('Gagal', data.error || 'Gagal menyimpan perubahan');
      }
    } catch {
      await alert.error('Gagal', 'Terjadi kesalahan sistem');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const nav = (hash: string) => {
    if (onNavigate) onNavigate(hash);
    else window.location.hash = hash;
  };

  const profileImageUrl = getProfileImageUrl(user);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Banner with Aceternity Glow */}
      <div className="relative pt-10 pb-8 px-5 bg-gradient-to-b from-blue-600 via-indigo-600 to-background overflow-hidden rounded-b-[36px]">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full border-4 border-card/80 shadow-2xl overflow-hidden relative bg-muted">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-black text-3xl">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            {user?.role === 'admin' ? (
              <span className="absolute bottom-0 right-0 bg-red-600 text-white p-1.5 rounded-full ring-2 ring-card shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
            ) : user?.is_pro ? (
              <span className="absolute bottom-0 right-0 bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 p-1.5 rounded-full ring-2 ring-card shadow-lg">
                <Sparkles className="w-4 h-4" />
              </span>
            ) : null}
          </div>

          <h1 className="text-xl font-black text-white tracking-tight">{user?.name || 'Pengguna EVNTER'}</h1>
          <p className="text-xs text-white/80 font-medium mb-3">{user?.email}</p>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
              Role: {user?.role || 'user'}
            </span>
            {user?.is_pro && (
              <span className="text-[11px] font-black tracking-wider px-3 py-1 rounded-full bg-amber-400 text-amber-950 shadow-sm">
                ⭐ PRO Organizer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-5 pt-4 space-y-4">
        {/* PRO Upgrade Card Banner if not Pro */}
        {!user?.is_pro && user?.role !== 'admin' && (
          <div 
            onClick={() => nav('#upgrade')}
            className="p-4 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-blue-500/20 flex items-center justify-between cursor-pointer group hover:border-blue-500/40 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-xs">Upgrade ke PRO Organizer</h4>
                <p className="text-[10px] text-muted-foreground">Bikin event tak terbatas & terima pembayaran</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        )}

        {/* Shortcuts for organizer & admin */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => nav('#tickets')}
            className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-center gap-3 text-left hover:border-primary/40 transition-colors shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Tiket Saya</p>
              <p className="text-[10px] text-muted-foreground">E-Pass & QR</p>
            </div>
          </button>

          {user?.role === 'organizer' ? (
            <button
              onClick={() => nav('#scanner')}
              className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-center gap-3 text-left hover:border-primary/40 transition-colors shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <ScanLine className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Scan Tiket</p>
                <p className="text-[10px] text-muted-foreground">Check-in</p>
              </div>
            </button>
          ) : user?.role === 'admin' ? (
            <button
              onClick={() => nav('#admin')}
              className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-center gap-3 text-left hover:border-primary/40 transition-colors shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Admin Console</p>
                <p className="text-[10px] text-muted-foreground">Panel Master</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => nav('#upgrade')}
              className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-center gap-3 text-left hover:border-primary/40 transition-colors shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">PRO Member</p>
                <p className="text-[10px] text-muted-foreground">Lihat Tier</p>
              </div>
            </button>
          )}
        </div>

        {/* Profile Info Details */}
        <div className="p-4 rounded-3xl bg-card border border-border/70 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Informasi Akun</span>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> {editing ? 'Batal' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-xs">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-semibold text-foreground ml-auto">{user?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold text-foreground ml-auto truncate max-w-[180px]">{user?.email || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">WhatsApp:</span>
                <span className="font-semibold text-foreground ml-auto">{user?.whatsapp || '-'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(viewsDir, 'ProfileView.tsx'), profileViewCode, 'utf8');
console.log('ProfileView.tsx created');

console.log('All views created successfully');
