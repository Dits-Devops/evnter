const fs = require('fs');
const path = require('path');

// ==========================================
// 1. UPDATE TICKETS PAGE
// ==========================================
const ticketsContent = `'use client';

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

export default function TicketsPage() {
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
    <div className="max-w-md mx-auto min-h-screen bg-background pb-28">
      {/* Header with gradient backdrop */}
      <div className="relative pt-6 pb-4 px-5 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit mb-1">
              <Sparkles className="w-3 h-3" /> E-Pass Wallet
            </span>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Tiket Saya</h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-muted-foreground">Total Tiket</span>
            <p className="text-lg font-black text-foreground">{tickets.length}</p>
          </div>
        </div>

        {/* Origin UI Inspired Segmented Tabs */}
        <div className="flex bg-muted/70 p-1 rounded-2xl border border-border/50 relative">
          <button
            onClick={() => setTab('aktif')}
            className="flex-1 relative py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 z-10"
          >
            {tab === 'aktif' && (
              <motion.div
                layoutId="ticketTabPill"
                className="absolute inset-0 bg-card rounded-xl shadow-sm border border-border/40 -z-10"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <TicketIcon className={\`w-3.5 h-3.5 \${tab === 'aktif' ? 'text-primary' : 'text-muted-foreground'}\`} />
            <span className={tab === 'aktif' ? 'text-foreground' : 'text-muted-foreground'}>
              Tiket Aktif ({activeTickets.length})
            </span>
          </button>

          <button
            onClick={() => setTab('riwayat')}
            className="flex-1 relative py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 z-10"
          >
            {tab === 'riwayat' && (
              <motion.div
                layoutId="ticketTabPill"
                className="absolute inset-0 bg-card rounded-xl shadow-sm border border-border/40 -z-10"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <History className={\`w-3.5 h-3.5 \${tab === 'riwayat' ? 'text-primary' : 'text-muted-foreground'}\`} />
            <span className={tab === 'riwayat' ? 'text-foreground' : 'text-muted-foreground'}>
              Riwayat ({historyTickets.length})
            </span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="px-5 pt-2">
        {loading ? (
          <TicketListSkeleton count={2} />
        ) : displayTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
          >
            <div className="w-20 h-20 bg-muted/60 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 border border-border/50 shadow-sm">
              {tab === 'aktif' ? '🎫' : '📖'}
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              {tab === 'aktif' ? 'Belum Ada Tiket Aktif' : 'Riwayat Masih Kosong'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
              {tab === 'aktif'
                ? 'Daftarkan diri kamu ke festival musik, hackathon, atau workshop seru di EVNTER!'
                : 'Event yang sudah selesai atau tiket yang sudah di-scan akan muncul di sini.'}
            </p>
            {tab === 'aktif' && (
              <Link href="/">
                <ShimmerButton className="h-11 px-6 text-xs font-bold mx-auto">
                  <Compass className="w-3.5 h-3.5 mr-1.5" /> Jelajahi Event Sekarang
                </ShimmerButton>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayTickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: idx * 0.08 }}
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

// ==========================================
// 2. UPDATE PROFILE PAGE
// ==========================================
const profileContent = `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, ShieldCheck, Sparkles, 
  LogOut, Edit3, ChevronRight, Ticket, Calendar,
  CreditCard, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { getProfileImageUrl } from '@/utils/helpers';
import { ShimmerButton } from '@/components/ui/ShimmerButton';

export default function ProfilePage() {
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

  const profileImageUrl = getProfileImageUrl(user);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background pb-32">
      {/* Top Banner with Aceternity Glow */}
      <div className="relative pt-10 pb-8 px-5 bg-gradient-to-b from-blue-600 via-indigo-600 to-background overflow-hidden rounded-b-[36px]">
        {/* Glow orb */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar with Ring Glow */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-xl shadow-black/20">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-background">
                {profileImageUrl ? (
                  <Image src={profileImageUrl} alt={user?.name || 'User'} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-primary">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-background shadow-sm">
              ✓
            </span>
          </div>

          {/* User Info */}
          <h2 className="text-xl font-black text-white tracking-tight">{user?.name || 'Sobat Event'}</h2>
          <p className="text-xs text-blue-100 font-medium mb-3">{user?.email || 'user@evnter.id'}</p>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              Role: {user?.role?.toUpperCase() || 'USER'}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 backdrop-blur-md text-amber-200 border border-amber-300/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {user?.pro_status === 'approved' ? 'PRO ORGANIZER' : 'FREE MEMBER'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bento Row */}
      <div className="px-5 -mt-4 relative z-20">
        <div className="grid grid-cols-3 gap-2.5 bg-card/90 backdrop-blur-xl p-3.5 rounded-2xl border border-border/70 shadow-lg shadow-black/5">
          <div className="text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Tiket</p>
            <p className="text-base font-black text-foreground">1 Aktif</p>
          </div>
          <div className="text-center border-x border-border/60">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Event</p>
            <p className="text-base font-black text-foreground">3 Selesai</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Poin</p>
            <p className="text-base font-black text-primary">450 XP</p>
          </div>
        </div>
      </div>

      {/* Menu & Settings */}
      <div className="px-5 pt-6 space-y-4">
        {/* Upgrade Pro Card (if not yet approved) */}
        {user?.role === 'user' && (
          <Link href="/organizer/upgrade">
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">Upgrade</span>
                  <h4 className="font-black text-sm">Gabung Jadi Organizer PRO</h4>
                  <p className="text-[11px] text-white/90">Bikin event, jual tiket, dan kelola scan QR</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/90 shrink-0" />
              </div>
            </div>
          </Link>
        )}

        {/* Account Details Box */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Informasi Akun</h3>
            <button
              onClick={() => {
                setForm({
                  name: user?.name || '',
                  whatsapp: user?.whatsapp || '',
                  profile_image: user?.profile_image || '',
                });
                setEditing(!editing);
              }}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {editing ? 'Batal' : 'Ubah'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <ShimmerButton
                onClick={handleSave}
                disabled={saving}
                className="w-full h-10 text-xs font-bold mt-2"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </ShimmerButton>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Email
                </span>
                <span className="font-semibold text-foreground">{user?.email || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> WhatsApp
                </span>
                <span className="font-semibold text-foreground">{user?.whatsapp || '08993977909'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/50 text-xs space-y-2">
          <p className="font-bold text-foreground">💡 Switch Cepat Akun Demo</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'dits@evnter.id', password: 'password123' })
                }).then(() => window.location.href = '/');
              }}
              className="py-1.5 px-2 bg-card rounded-xl font-bold border border-border/60 hover:border-primary text-center"
            >
              User
            </button>
            <button
              onClick={() => {
                fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'organizer@evnter.id', password: 'password123' })
                }).then(() => window.location.href = '/organizer/my-events');
              }}
              className="py-1.5 px-2 bg-card rounded-xl font-bold border border-border/60 hover:border-primary text-center text-primary"
            >
              Organizer
            </button>
            <button
              onClick={() => {
                fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'admin@evnter.id', password: 'password123' })
                }).then(() => window.location.href = '/admin');
              }}
              className="py-1.5 px-2 bg-card rounded-xl font-bold border border-border/60 hover:border-primary text-center text-purple-600"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 active:scale-95 transition-transform"
        >
          <LogOut className="w-4 h-4" /> Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '../src/app/(user)/tickets/page.tsx'), ticketsContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../src/app/(user)/profile/page.tsx'), profileContent, 'utf8');
console.log('TICKETS_AND_PROFILE_PAGES_UPDATED_SUCCESSFULLY');
