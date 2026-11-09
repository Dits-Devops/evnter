'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { 
  Award, 
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
  Calendar, 
  ScanLine, 
  PlusCircle, 
  ChevronRight 
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getProfileImageUrl } from '@/utils/helpers';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { fireConfetti } from '@/lib/confetti';

export default function OrganizerProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Sarah Organizer',
    whatsapp: user?.whatsapp || '089876543210',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  async function handleSave() {
    setSaving(true);
    fireConfetti();
    showToast('Profil organizer berhasil diperbarui');
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
    await logout();
    router.replace('/login');
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-44">
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
                <Sparkles className="w-3 h-3" /> Akun Kreator
              </div>
              <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
                Profil Organizer
              </h1>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-primary transition-all active:scale-95"
          >
            {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-5">
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
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-500/15 to-transparent" />

          {/* Avatar */}
          <div className="relative mx-auto w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 shadow-lg shadow-amber-500/20 mb-3">
            <div className="w-full h-full rounded-[22px] bg-card overflow-hidden flex items-center justify-center">
              <Avatar
                src={getProfileImageUrl(user)}
                name={user?.name || 'Organizer'}
                size="xl"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" /> Mitra Organizer Resmi
          </div>

          <h2 className="text-xl font-black text-foreground">
            {user?.name || 'Sarah Organizer'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user?.email || 'organizer@evnter.id'}
          </p>

          {/* Edit Form or Details */}
          {editing ? (
            <div className="mt-5 space-y-3 text-left pt-4 border-t border-border/50">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Nama Lengkap / Komunitas
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
                  Nomor WhatsApp Kontak
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
                <span>Simpan Profil</span>
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-border/50 text-left">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                  Status Akun
                </span>
                <span className="text-xs font-black text-emerald-500">PRO Terverifikasi</span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                  Kapasitas Event
                </span>
                <span className="text-xs font-black text-foreground">Unlimited Host</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Nav Hub */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
            Menu Penyelenggara
          </h3>

          <Link
            href="/organizer/my-events"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Event Saya</p>
                <p className="text-[10px] text-muted-foreground">Kelola event dan pantau tiket terjual</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            href="/organizer/scanner"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <ScanLine className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Scanner QR Tiket</p>
                <p className="text-[10px] text-muted-foreground">Check-in cepat peserta di gate venue</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            href="/organizer/create-event"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Buat Event Baru</p>
                <p className="text-[10px] text-muted-foreground">Publikasikan acara musik atau seminar</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            href="/#home"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Lihat Tampilan Pengguna</p>
                <p className="text-[10px] text-muted-foreground">Jelajahi beranda utama EVNTER</p>
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
          <span>Keluar Akun</span>
        </button>
        {/* Safe area spacer for floating dock */}
        <div className="h-20" />
      </div>
    </div>
  );
}
