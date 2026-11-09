'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Clock, 
  MessageCircle, 
  Mail, 
  Eye, 
  ZoomIn, 
  Check, 
  X, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fireConfetti } from '@/lib/confetti';

interface Payment {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  pro_status: string;
  pro_payment_proof_url: string;
  updated_at: string;
}

const defaultPayments: Payment[] = [
  {
    id: 'pay-1',
    name: 'Alif Kurniawan',
    email: 'alif@techfest.id',
    whatsapp: '085711223344',
    pro_status: 'pending',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'pay-2',
    name: 'Nadia Putri',
    email: 'nadia@soundfest.com',
    whatsapp: '087899887766',
    pro_status: 'pending',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'pay-3',
    name: 'Fauzan Akbar',
    email: 'fauzan@gamecon.id',
    whatsapp: '081298761234',
    pro_status: 'pending',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'pay-4',
    name: 'Sarah Organizer',
    email: 'sarah@evnter.id',
    whatsapp: '089876543210',
    pro_status: 'approved',
    pro_payment_proof_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80',
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(defaultPayments);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const res = await fetch('/api/admin/payments?t=' + Date.now());
      if (res.ok) {
        const d = await res.json();
        if (d.payments && d.payments.length > 0) {
          setPayments(d.payments);
        }
      }
    } catch {
      // offline fallback
    }
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  async function handleAction(paymentId: string, action: 'approve' | 'reject') {
    setProcessingId(paymentId);
    if (action === 'approve') {
      fireConfetti();
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, pro_status: action === 'approve' ? 'approved' : 'free' }
          : p
      )
    );

    showToast(
      action === 'approve'
        ? 'Pembayaran disetujui! Pengguna kini Organizer Pro ⭐'
        : 'Pembayaran ditolak'
    );

    try {
      await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: paymentId, action }),
      });
    } catch {
      // offline fallback
    } finally {
      setProcessingId(null);
    }
  }

  const pendingList = payments.filter((p) => p.pro_status === 'pending');
  const approvedList = payments.filter((p) => p.pro_status === 'approved');

  return (
    <div className="px-5 pt-4 space-y-4 pb-24">
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
              <Sparkles className="w-3 h-3" /> Verifikasi Tagihan
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
              Pembayaran Pro
            </h1>
          </div>
        </div>

        {pendingList.length > 0 && (
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            {pendingList.length} Menunggu
          </span>
        )}
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

      {/* Content */}
      <div className="space-y-4">
        {/* Section: Pending Review */}
        {pendingList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 px-1">
              <Clock className="w-3.5 h-3.5" /> Menunggu Persetujuan ({pendingList.length})
            </h2>

            {pendingList.map((p, idx) => {
              const cleanWa = p.whatsapp ? p.whatsapp.replace(/[^0-9]/g, '') : '';
              const waUrl = cleanWa
                ? `https://wa.me/${cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa}`
                : null;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-3xl bg-card border-2 border-amber-500/30 p-4 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Upgrade Organizer Pro
                      </span>
                      <h3 className="text-base font-black text-foreground mt-1.5">{p.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground" /> {p.email}
                      </p>
                      {p.whatsapp && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MessageCircle className="w-3 h-3 text-emerald-500" /> {p.whatsapp}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-foreground">Rp 99.000</span>
                      <span className="block text-[10px] text-muted-foreground">Biaya Aktivasi</span>
                    </div>
                  </div>

                  {/* Proof of Transfer Preview */}
                  {p.pro_payment_proof_url && (
                    <div 
                      className="relative rounded-2xl overflow-hidden bg-muted/60 border border-border group cursor-pointer"
                      onClick={() => setPreviewImage(p.pro_payment_proof_url)}
                    >
                      <div className="relative w-full h-36">
                        <Image
                          src={p.pro_payment_proof_url}
                          alt="Bukti Transfer"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                        <ZoomIn className="w-4 h-4" /> Perbesar Bukti
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-2xl bg-muted text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Konfirmasi WA
                      </a>
                    )}

                    <button
                      onClick={() => handleAction(p.id, 'reject')}
                      disabled={processingId === p.id}
                      className="flex-1 py-2 px-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-extrabold transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Tolak
                    </button>

                    <button
                      onClick={() => handleAction(p.id, 'approve')}
                      disabled={processingId === p.id}
                      className="flex-1 py-2 px-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Setujui Pro
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Section: Approved History */}
        {approvedList.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Riwayat Disetujui ({approvedList.length})
            </h2>

            {approvedList.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-card border border-border/80 p-3.5 flex items-center justify-between shadow-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground">{p.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{p.email}</p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Aktif Pro
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div 
              className="relative max-w-sm w-full bg-card rounded-3xl p-3 border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-black/10">
                <Image
                  src={previewImage}
                  alt="Bukti Transfer Detail"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-3 flex justify-between items-center px-1">
                <span className="text-xs font-bold text-foreground">Bukti Pembayaran</span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-3 py-1 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
