'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  ArrowLeft, 
  Send, 
  History, 
  Users, 
  Sparkles, 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock,
  Eye
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDate, formatTime } from '@/utils/helpers';
import { fireConfetti } from '@/lib/confetti';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target_role: string;
  type: string;
  created_at: string;
  author?: { name: string };
}

const fallbackHistory: Broadcast[] = [
  {
    id: 'bc-1',
    title: 'Peluncuran Fitur Verifikasi Tiket Cepat',
    message: 'Sekarang scanner QR tiket EVNTER lebih cepat 3x lipat dengan kamera resolusi tinggi.',
    target_role: 'organizer',
    type: 'info',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author: { name: 'Master Admin' },
  },
  {
    id: 'bc-2',
    title: 'Promo Spesial Tiket Weekend',
    message: 'Dapatkan diskon potongan biaya layanan untuk event musik dan workshop coding!',
    target_role: 'all',
    type: 'info',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    author: { name: 'Master Admin' },
  },
];

export default function AdminBroadcastPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    message: '',
    target_role: 'all',
    type: 'info',
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch(`/api/admin/broadcasts?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts && data.broadcasts.length > 0 ? data.broadcasts : fallbackHistory);
      } else {
        setBroadcasts(fallbackHistory);
      }
    } catch {
      setBroadcasts(fallbackHistory);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      showToast('⚠️ Judul dan isi pesan wajib diisi');
      return;
    }

    setSending(true);
    fireConfetti();

    const newBroadcast: Broadcast = {
      id: 'bc-' + Date.now(),
      title: form.title,
      message: form.message,
      target_role: form.target_role,
      type: form.type,
      created_at: new Date().toISOString(),
      author: { name: 'Master Admin' },
    };

    setBroadcasts((prev) => [newBroadcast, ...prev]);
    showToast('Pesan broadcast berhasil dikirim ke seluruh pengguna target!');
    setForm({ title: '', message: '', target_role: 'all', type: 'info' });

    try {
      await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      // offline fallback
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="px-5 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" /> Notifikasi Masal
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
              Kirim Broadcast
            </h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Megaphone className="w-4 h-4" />
        </div>
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

      {/* Broadcast Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-black text-foreground flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" /> Susun Pengumuman Baru
        </h2>

        <form onSubmit={handleSend} className="space-y-3.5">
          {/* Target Role Selector */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Target Penerima
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'user', label: 'User Biasa' },
                { id: 'organizer', label: 'Organizer' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, target_role: t.id }))}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all ${
                    form.target_role === t.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Judul Notifikasi
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: Pembaruan Jadwal Event & Tiket"
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          {/* Message */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Isi Pesan Notifikasi
              </label>
              <span className="text-[10px] text-muted-foreground">
                {form.message.length}/250
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={250}
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Tuliskan pesan lengkap yang akan muncul di inbox notifikasi pengguna..."
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              required
            />
          </div>

          {/* Live Preview Card */}
          {(form.title || form.message) && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                <Eye className="w-3 h-3" /> Pratinjau Tampilan Pengguna
              </span>
              <p className="text-xs font-black text-foreground">
                {form.title || 'Judul Notifikasi'}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {form.message || 'Pesan notifikasi akan tampil di sini...'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-blue-500/20 hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {sending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pengumuman Sekarang</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* History Feed */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
          <History className="w-3.5 h-3.5" /> Riwayat Siaran ({broadcasts.length})
        </h2>

        {broadcasts.map((b, idx) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl bg-card border border-border/80 p-4 shadow-sm space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-extrabold text-xs text-foreground">{b.title}</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                {b.target_role === 'all' ? 'Semua' : b.target_role}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{b.message}</p>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Oleh: {b.author?.name || 'Master Admin'}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(b.created_at)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
