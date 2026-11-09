'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Ticket, 
  DollarSign, 
  CreditCard, 
  Upload, 
  Image as ImageIcon,
  CheckCircle2, 
  FileText,
  Users,
  QrCode
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAlert } from '@/context/AlertContext';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { triggerConfetti } from '@/lib/confetti';

export default function CreateEventPage() {
  const router = useRouter();
  const alert = useAlert();
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    price: '',
    poster_url: '',
    max_peserta: '',
    metode_pembayaran: '',
    nomor_rekening: '',
    nama_pemilik: '',
    catatan_pembayaran: '',
    qris_image: '',
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.price ? parseInt(form.price) : 0,
          max_peserta: form.max_peserta ? parseInt(form.max_peserta) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerConfetti();
        await alert.success('Berhasil!', 'Event baru Anda berhasil dipublikasikan.');
        router.push(`/organizer/events/${data.event?.id || 'my-events'}`);
      } else {
        await alert.error('Gagal', data.error || 'Gagal membuat event');
      }
    } catch {
      await alert.error('Error', 'Terjadi gangguan jaringan');
    } finally {
      setSubmitting(false);
    }
  }

  const isFree = !form.price || parseInt(form.price) === 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-44">
      <BackgroundGlow variant="mesh" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 pt-11 pb-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-card border border-border/70 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
            Studio Organizer
          </span>
          <h1 className="text-sm font-bold text-foreground">Buat Event Baru</h1>
        </div>

        <div className="w-10" />
      </header>

      <div className="max-w-md mx-auto px-5 pt-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Informasi Utama */}
          <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>1. Detail Event</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Nama / Judul Event <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Contoh: Jakarta Tech & AI Summit 2026"
                required
                className="w-full h-11 px-3.5 rounded-2xl bg-background border border-border/70 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Deskripsi Event
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Jelaskan daya tarik, bintang tamu, benefit tiket, dan rundown event..."
                className="w-full p-3.5 rounded-2xl bg-background border border-border/70 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm resize-none"
              />
            </div>

            {/* Poster Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Poster / Banner Event
              </label>
              <ImageUpload
                placeholder="Pilih atau seret gambar poster di sini"
                value={form.poster_url || null}
                onChange={(url) => setForm((prev) => ({ ...prev, poster_url: url || '' }))}
              />
            </div>
          </div>

          {/* Section 2: Waktu & Lokasi */}
          <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>2. Jadwal & Lokasi</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Tanggal & Jam Mulai <span className="text-destructive">*</span>
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full h-11 px-3.5 rounded-2xl bg-background border border-border/70 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Lokasi / Venue <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Contoh: Balai Sarbini / Online Zoom"
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-background border border-border/70 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tiket, Harga, & Kuota */}
          <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Ticket className="w-4 h-4" />
              <span>3. Tiket & Pembayaran</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Harga Tiket (Rp)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0 (Gratis)"
                  className="w-full h-11 px-3.5 rounded-2xl bg-background border border-border/70 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Kuota Peserta
                </label>
                <input
                  type="number"
                  name="max_peserta"
                  min="0"
                  value={form.max_peserta}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  className="w-full h-11 px-3.5 rounded-2xl bg-background border border-border/70 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
                />
              </div>
            </div>

            {/* Price Preview Badge */}
            <div className="px-3.5 py-2 rounded-xl bg-muted/60 border border-border/50 text-xs flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Tipe Akses:</span>
              <span className={'font-black ' + (isFree ? 'text-emerald-500' : 'text-primary')}>
                {isFree ? '🎟️ Event Gratis' : `Rp ${parseInt(form.price).toLocaleString('id-ID')} / Tiket`}
              </span>
            </div>

            {/* Rekening & Pembayaran (Hanya jika berbayar) */}
            {!isFree && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3.5 mt-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-primary block">
                  💳 Rekening Tujuan Pembayaran
                </span>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground block">
                    Nama Bank / E-Wallet
                  </label>
                  <input
                    type="text"
                    name="metode_pembayaran"
                    value={form.metode_pembayaran}
                    onChange={handleChange}
                    placeholder="BCA / Mandiri / GoPay / OVO"
                    required={!isFree}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border/70 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      name="nomor_rekening"
                      value={form.nomor_rekening}
                      onChange={handleChange}
                      placeholder="1234567890"
                      required={!isFree}
                      className="w-full h-10 px-3 rounded-xl bg-background border border-border/70 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Atas Nama
                    </label>
                    <input
                      type="text"
                      name="nama_pemilik"
                      value={form.nama_pemilik}
                      onChange={handleChange}
                      placeholder="Nama Pemilik"
                      required={!isFree}
                      className="w-full h-10 px-3 rounded-xl bg-background border border-border/70 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground block">
                    Catatan Transfer (Opsional)
                  </label>
                  <input
                    type="text"
                    name="catatan_pembayaran"
                    value={form.catatan_pembayaran}
                    onChange={handleChange}
                    placeholder="Contoh: Sertakan kode unik 3 digit"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border/70 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <ShimmerButton
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/25"
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? 'Memproses Event...' : '🚀 Terbitkan Event Sekarang'}
            </ShimmerButton>
          </div>
          {/* Safe area spacer for floating dock */}
          <div className="h-20" />
        </form>
      </div>
    </div>
  );
}
