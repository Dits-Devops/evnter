'use client';

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
    <div className="min-h-screen bg-background pb-44">
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

        {/* Safe area spacer for floating dock */}
        <div className="h-20" />
      </div>
    </div>
  );
}
