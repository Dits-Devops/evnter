const fs = require('fs');
const path = require('path');

const content = `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  Crown, 
  Sparkles, 
  Check, 
  Copy, 
  Zap, 
  QrCode, 
  CreditCard, 
  ShieldCheck, 
  MessageSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  Ticket,
  Users
} from 'lucide-react';
import { createWhatsAppUpgradeMessage } from '@/utils/helpers';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { triggerConfetti } from '@/lib/confetti';

interface Settings {
  payment_name?: string;
  account_number?: string;
  account_name?: string;
  qris_image?: string;
  whatsapp_admin?: string;
  description?: string;
}

export default function UpgradePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    payment_name: 'BCA Virtual Account',
    account_number: '88201993977909',
    account_name: 'PT EVNTER KREATIF NUSANTARA',
    whatsapp_admin: '085882846665',
    description: 'Transfer ke nomor rekening/VA resmi di atas atau scan QRIS.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings(d.settings); })
      .catch((e) => console.error(e));
  }, []);

  const copyAccount = () => {
    if (!settings.account_number) return;
    navigator.clipboard.writeText(settings.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleSendWhatsApp() {
    if (!user) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/users/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_proof_url: 'via-whatsapp' }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        triggerConfetti();
        setMessage({ type: 'success', text: data.message || 'Permintaan berhasil dikirim!' });
        const waLink = createWhatsAppUpgradeMessage(user.name, user.email);
        window.open(waLink, '_blank');
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal submit upgrade' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setSubmitting(false);
    }
  }

  // Pending State
  if (user?.pro_status === 'pending') {
    return (
      <div className="relative min-h-screen bg-background text-foreground pb-28">
        <BackgroundGlow variant="spotlight" />
        <header className="px-5 pt-11 pb-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-card border border-border/70 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-black">Status Verifikasi Pro</h1>
        </header>

        <div className="px-5 pt-8 text-center max-w-sm mx-auto space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">Menunggu Verifikasi Admin</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
              Bukti pembayaran Anda sedang diproses oleh admin. Akun akan otomatis aktif dalam 1×24 jam.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                const waLink = createWhatsAppUpgradeMessage(user?.name || '', user?.email || '');
                window.open(waLink, '_blank');
              }}
              className="w-full h-12 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-muted active:scale-98 transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Konfirmasi via WhatsApp Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Approved State
  if (user?.pro_status === 'approved' || user?.role === 'organizer' || user?.role === 'admin') {
    return (
      <div className="relative min-h-screen bg-background text-foreground pb-28">
        <BackgroundGlow variant="spotlight" />
        <header className="px-5 pt-11 pb-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-card border border-border/70 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-black">Organizer Pro</h1>
        </header>

        <div className="px-5 pt-8 text-center max-w-sm mx-auto space-y-5">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-amber-400/30 rounded-3xl blur-xl" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-xl shadow-amber-500/25">
              <Crown className="w-10 h-10" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Anda Sudah PRO!</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Akun Anda memiliki akses penuh ke fitur penerbitan tiket, dashboard analitik, dan scanner QR.
            </p>
          </div>

          <ShimmerButton
            onClick={() => router.push('/organizer/my-events')}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/20"
          >
            Buka Dashboard Organizer
            <ArrowRight className="w-4 h-4" />
          </ShimmerButton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-32">
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
            Membership Plan
          </span>
          <h1 className="text-sm font-bold text-foreground">Upgrade ke Organizer</h1>
        </div>

        <div className="w-10" />
      </header>

      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        {/* Hero Card */}
        <div className="relative rounded-[2rem] p-6 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-xl shadow-orange-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider mb-3">
            <Crown className="w-3.5 h-3.5 text-yellow-200" />
            Organizer Pro Access
          </div>

          <h2 className="text-2xl font-black tracking-tight leading-tight">
            Publikasikan Event & Jual Tiket Mandiri
          </h2>
          <p className="text-xs text-orange-100 mt-1 leading-relaxed">
            Tingkatkan skala komunitas dan event komersil Anda dengan platform tiket all-in-one.
          </p>

          <div className="mt-5 pt-4 border-t border-white/20 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight">Rp 99.000</span>
            <span className="text-xs text-orange-200 font-semibold">/ sekali bayar seumur hidup</span>
          </div>
        </div>

        {/* Benefits Bento */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
            Keuntungan Menjadi Pro:
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Ticket, title: 'Event Tak Terbatas', desc: 'Buat & publikasi ribuan tiket tanpa batas kuota' },
              { icon: Zap, title: 'QR Scanner Cepat', desc: 'Validasi peserta 0.1 detik dengan live camera' },
              { icon: TrendingUp, title: 'Laporan Real-Time', desc: 'Pantau omzet dan statistik kehadiran live' },
              { icon: Users, title: 'Support Prioritas', desc: 'Bantuan admin WhatsApp 24/7 dedicated' },
            ].map((b, i) => (
              <div key={i} className="bg-card/70 backdrop-blur-md border border-border/70 rounded-2xl p-3.5 space-y-1">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                  <b.icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">{b.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-snug">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Account Details */}
        <div className="bg-card/90 backdrop-blur-md rounded-3xl border border-border/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Instruksi Transfer</span>
          </div>

          <div className="bg-muted/50 border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-semibold">Bank Tujuan:</span>
              <span className="text-xs font-black text-foreground">{settings.payment_name}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-semibold">Nomor Rekening / VA:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-black text-foreground tracking-wider">
                  {settings.account_number}
                </span>
                <button
                  onClick={copyAccount}
                  className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
                  title="Salin Nomor"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-semibold">Atas Nama:</span>
              <span className="text-xs font-bold text-foreground">{settings.account_name}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-semibold">Total Transfer:</span>
              <span className="text-xs font-black text-primary">Rp 99.000</span>
            </div>
          </div>

          {settings.qris_image ? (
            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center border border-border/60">
              <span className="text-[11px] font-bold text-neutral-800 mb-2">Scan QRIS Nasional</span>
              <img
                src={settings.qris_image}
                alt="QRIS"
                className="w-44 h-44 object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <span className="text-[11px] text-muted-foreground">
                Mendukung transfer semua bank (BCA, Mandiri, BRI, BNI) dan E-Wallet (GoPay, OVO, Dana).
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          {message && (
            <div className={'p-3 rounded-2xl text-xs font-semibold ' + (message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20')}>
              {message.text}
            </div>
          )}

          <ShimmerButton
            onClick={handleSendWhatsApp}
            disabled={submitting}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/20"
          >
            <MessageSquare className="w-4 h-4" />
            {submitting ? 'Memproses...' : 'Kirim Bukti Transfer ke Admin WhatsApp'}
          </ShimmerButton>
          
          <p className="text-[11px] text-center text-muted-foreground">
            Verifikasi instan via WhatsApp Admin: {settings.whatsapp_admin || '085882846665'}
          </p>
        </div>
      </div>
    </div>
  );
}
`;

const targetPath = path.join(__dirname, '../src/app/(user)/upgrade/page.tsx');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully written to', targetPath);
