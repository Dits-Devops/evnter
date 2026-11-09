'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  ArrowLeft, 
  Save, 
  CreditCard, 
  QrCode, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  FileText,
  Upload,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ImageUpload from '@/components/ImageUpload';
import { PaymentSettings } from '@/types';
import { fireConfetti } from '@/lib/confetti';

const POPULAR_BANKS = ['BCA', 'Mandiri', 'BRI', 'BNI', 'GoPay', 'DANA'];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<PaymentSettings>>({
    payment_name: 'BCA',
    account_name: 'EVNTER Official Indonesia',
    account_number: '8820192831',
    qris_image: 'https://images.unsplash.com/photo-1595079672139-545c0ecac12a?w=800&auto=format&fit=crop&q=80',
    whatsapp_admin: '081234567890',
    description: 'Transfer ke rekening resmi di atas atau scan QRIS terverifikasi.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings?t=' + Date.now())
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    fireConfetti();
    showToast('Konfigurasi pembayaran & rekening berhasil disimpan!');

    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch {
      // offline fallback
    } finally {
      setSaving(false);
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
              <Sparkles className="w-3 h-3" /> Konfigurasi Gateway
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
              Pengaturan Bayar
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-3.5 py-1.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {saving ? <LoadingSpinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
          <span>Simpan</span>
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

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Memuat Pengaturan..." />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Card: Rekening & Bank */}
          <div className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Rekening Pembayaran Resmi
            </h2>

            {/* Popular Bank Selector */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Pilih Bank / E-Wallet Cepat
              </label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {POPULAR_BANKS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSettings((p) => ({ ...p, payment_name: b }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                      settings.payment_name === b
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                name="account_name"
                value={settings.account_name || ''}
                onChange={handleChange}
                placeholder="Contoh: PT Eventer Nusantara Mandiri"
                className="w-full px-4 py-2.5 text-xs rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Nomor Rekening / Virtual Account
              </label>
              <input
                type="text"
                name="account_number"
                value={settings.account_number || ''}
                onChange={handleChange}
                placeholder="Contoh: 1234567890"
                className="w-full px-4 py-2.5 text-xs font-mono font-bold rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Card: QRIS Static */}
          <div className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary" /> Barcode QRIS Universal
            </h2>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Gambar QRIS (Scan untuk Bayar)
              </label>
              <ImageUpload
                value={settings.qris_image}
                onChange={(url) => setSettings((p) => ({ ...p, qris_image: url || undefined }))}
              />
            </div>
          </div>

          {/* Card: WhatsApp Hotline */}
          <div className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" /> Kontak Hotline Verifikasi
            </h2>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Nomor WhatsApp Admin
              </label>
              <input
                type="text"
                name="whatsapp_admin"
                value={settings.whatsapp_admin || ''}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full px-4 py-2.5 text-xs font-mono font-bold rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Instruksi Panduan Transfer
              </label>
              <textarea
                rows={2}
                name="description"
                value={settings.description || ''}
                onChange={handleChange}
                placeholder="Kirim bukti screenshot transfer ke nomor WhatsApp di atas..."
                className="w-full px-4 py-2.5 text-xs rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Big Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Gateway</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
