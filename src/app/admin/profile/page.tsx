'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  ArrowLeft, 
  User, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  LogOut, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getProfileImageUrl } from '@/utils/helpers';
import { fireConfetti } from '@/lib/confetti';

export default function AdminProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Master Admin',
    whatsapp: user?.whatsapp || '081234567890',
  });
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  async function handleSave() {
    setSaving(true);
    fireConfetti();
    showToast('Profil admin berhasil diperbarui');
    setEditing(false);

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      await refreshUser();
    } catch {
      // offline fallback
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      setLoggingOut(false);
      showToast('Gagal keluar. Coba lagi.');
    }
  }

  return (
    <div className="px-5 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/admin"
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" /> Akun Superuser
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
              Profil Administrator
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-bold text-rose-500 hover:bg-rose-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>

      {/* Toast Notification */}
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

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-card border border-border/80 p-6 shadow-sm text-center relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 to-transparent" />

        {/* Avatar */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-rose-500 via-amber-500 to-primary shadow-lg shadow-primary/20 mb-3">
          <div className="w-full h-full rounded-[22px] bg-card overflow-hidden flex items-center justify-center">
            <Avatar
              src={getProfileImageUrl(user)}
              name={user?.name || 'Admin'}
              size="xl"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Master Administrator
        </div>

        <h2 className="text-xl font-black text-foreground">
          {user?.name || 'Master Admin'}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{user?.email || 'admin@evnter.id'}</p>
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          {editing ? 'Batal edit' : 'Edit profil'}
        </button>

        {/* Edit Form or Details */}
        {editing ? (
          <div className="mt-5 space-y-3 text-left pt-4 border-t border-border/50">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                WhatsApp Hotline
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs shadow-sm hover:shadow active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-border/50 text-left">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                Hak Akses
              </span>
              <span className="text-xs font-black text-foreground">Superuser Root</span>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                Status Akun
              </span>
              <span className="text-xs font-black text-emerald-500">Terverifikasi Aktif</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Switch Hub Navigation */}
      <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
          Beralih Mode Tampilan
        </h3>

        <Link
          href="/#home"
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Mode Pengunjung (Sobat Event)</p>
              <p className="text-[10px] text-muted-foreground">Jelajahi event dan e-pass tiket</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>

        <Link
          href="/organizer/my-events"
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Mode Penyelenggara (Organizer)</p>
              <p className="text-[10px] text-muted-foreground">Kelola event dan scanner tiket</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-black text-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Sesi Admin</span>
      </button>
    </div>
  );
}
