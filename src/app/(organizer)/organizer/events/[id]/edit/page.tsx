'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  MapPin, 
  DollarSign, 
  CreditCard, 
  ImageIcon, 
  CheckCircle2, 
  FileText,
  Users,
  QrCode,
  Save
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { fireConfetti } from '@/lib/confetti';
import { mockEvents } from '@/lib/mockData';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params?.id as string) || 'evt-1';
  const targetId = (rawId === 'e1' || rawId === '1') ? 'evt-1' : rawId;
  const initialEv = mockEvents.find((e) => e.id === targetId || e.id === rawId) || mockEvents[0];
  const initialDate = initialEv.date ? new Date(initialEv.date).toISOString().slice(0, 16) : '';

  const [form, setForm] = useState({
    title: initialEv.title || '',
    date: initialDate,
    location: initialEv.location || '',
    description: initialEv.description || '',
    price: initialEv.price ? String(initialEv.price) : '0',
    poster_url: initialEv.poster_url || '',
    max_peserta: initialEv.max_peserta ? String(initialEv.max_peserta) : '1000',
    metode_pembayaran: initialEv.metode_pembayaran || 'QRIS & Transfer BCA',
    nomor_rekening: initialEv.nomor_rekening || '8271039941',
    nama_pemilik: initialEv.nama_pemilik || 'PT EVNTER KREATIF NUSANTARA',
    catatan_pembayaran: initialEv.catatan_pembayaran || 'Unggah bukti transfer untuk verifikasi otomatis tiket Anda.',
    qris_image: initialEv.qris_image || '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          const e = data.event;
          const formattedDate = e.date ? new Date(e.date).toISOString().slice(0, 16) : '';
          setForm({
            title: e.title || '',
            date: formattedDate,
            location: e.location || '',
            description: e.description || '',
            price: e.price ? String(e.price) : '',
            poster_url: e.poster_url || '',
            max_peserta: e.max_peserta ? String(e.max_peserta) : '',
            metode_pembayaran: e.metode_pembayaran || '',
            nomor_rekening: e.nomor_rekening || '',
            nama_pemilik: e.nama_pemilik || '',
            catatan_pembayaran: e.catatan_pembayaran || '',
            qris_image: e.qris_image || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.price ? parseInt(form.price) : 0,
          max_peserta: form.max_peserta ? parseInt(form.max_peserta) : 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fireConfetti();
        setMessage('Perubahan berhasil disimpan!');
        setTimeout(() => {
          router.push(`/organizer/events/${data.event?.id || params.id}`);
        }, 1200);
      } else {
        setMessage(data.error || 'Gagal menyimpan perubahan');
      }
    } catch {
      setMessage('Terjadi kesalahan koneksi');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Memuat Event..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-28">
      <BackgroundGlow variant="mesh" />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/organizer/events/${params.id}`}
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" /> Pembaruan Data
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
              Edit Event
            </h1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Section 1: Detail Dasar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-3.5"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" /> Informasi Utama
            </h3>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Judul Event *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="cth. Konser Musik Indie 2026"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" /> Tanggal & Waktu *
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" /> Lokasi / Venue *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="cth. Balai Sarbini, Jakarta"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Deskripsi Lengkap</label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Jelaskan rundown, ketentuan, dan benefit peserta..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>
          </motion.div>

          {/* Section 2: Tiket & Kapasitas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-3.5"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Tiket & Kuota
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Harga Tiket (Rp)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0 jika Gratis"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" /> Maks. Peserta
                </label>
                <input
                  type="number"
                  name="max_peserta"
                  value={form.max_peserta}
                  onChange={handleChange}
                  placeholder="Kosongkan jika tak terbatas"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Section 3: Media Poster */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-3.5"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary" /> Poster Acara
            </h3>

            <ImageUpload
              value={form.poster_url}
              onChange={(url) => setForm((prev) => ({ ...prev, poster_url: url || '' }))}
            />
          </motion.div>

          {/* Section 4: Pembayaran */}
          {parseInt(form.price || '0') > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-3.5"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Pengaturan Pembayaran
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    name="metode_pembayaran"
                    value={form.metode_pembayaran}
                    onChange={handleChange}
                    placeholder="BCA / Mandiri / GoPay"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    name="nomor_rekening"
                    value={form.nomor_rekening}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  name="nama_pemilik"
                  value={form.nama_pemilik}
                  onChange={handleChange}
                  placeholder="Nama Lengkap Pemilik"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/50 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-purple-500" /> Unggah QRIS (Opsional)
                </label>
                <ImageUpload
                  value={form.qris_image}
                  onChange={(url) => setForm((prev) => ({ ...prev, qris_image: url || '' }))}
                />
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <ShimmerButton
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}</span>
            </ShimmerButton>
          </div>
        </form>
      </div>
    </div>
  );
}
