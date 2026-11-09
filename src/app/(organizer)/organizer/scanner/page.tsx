'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScanLine, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Camera, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  Ticket, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { triggerConfetti } from '@/lib/confetti';
import { formatTime } from '@/utils/helpers';

const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });

interface ScanResult {
  success: boolean;
  message?: string;
  error?: string;
  ticket?: {
    ticket_code: string;
    checked_in_at?: string;
    user?: { name: string };
    event?: { title: string };
  };
}

export default function ScannerPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  async function handleScan(token: string) {
    if (processing) return;
    setProcessing(true);
    setScanning(false);

    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_token: token }),
      });
      const data = await res.json();
      setResult(data);

      if (data.success) {
        triggerConfetti();
        setScanHistory((prev) => [data, ...prev.slice(0, 4)]);
      }
    } catch {
      setResult({ success: false, error: 'Koneksi gagal atau offline' });
    } finally {
      setProcessing(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await handleScan(manualCode.trim());
  }

  function resetScanner() {
    setResult(null);
    setManualCode('');
    setScanning(true);
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white pb-44">
      <BackgroundGlow variant="mesh" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-white/10 px-5 pt-11 pb-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
            <ScanLine className="w-3 h-3" />
            Live Check-in
          </div>
          <h1 className="text-sm font-bold text-white">Scanner Tiket Peserta</h1>
        </div>

        <button
          onClick={resetScanner}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white active:scale-95 transition-all"
          title="Reset"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Scanner Section */}
      <div className="max-w-md mx-auto px-5 pt-4 space-y-4">
        {/* Origin UI Style Mode Switch */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => { setMode('camera'); resetScanner(); }}
            className={'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ' + (mode === 'camera' ? 'bg-primary text-white shadow-md' : 'text-neutral-400 hover:text-white')}
          >
            <Camera className="w-3.5 h-3.5" />
            Kamera Barcode
          </button>
          <button
            onClick={() => { setMode('manual'); setScanning(false); }}
            className={'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ' + (mode === 'manual' ? 'bg-primary text-white shadow-md' : 'text-neutral-400 hover:text-white')}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Input Kode Manual
          </button>
        </div>

        {/* Viewfinder Area */}
        {mode === 'camera' && (
          <div className="relative rounded-[2.5rem] overflow-hidden bg-black border border-white/15 shadow-2xl aspect-square flex flex-col items-center justify-center">
            {scanning && !result && !processing && (
              <>
                <QRScanner onScan={handleScan} active={scanning} />

                {/* Holographic HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                  {/* Corner Target Reticles */}
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                    <div className="w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                  </div>

                  {/* Red/Cyan Laser Scanline */}
                  <motion.div
                    className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]"
                    animate={{ y: [-80, 80] }}
                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5, ease: 'easeInOut' }}
                  />

                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                    <div className="w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                  </div>
                </div>

                <div className="absolute bottom-5 inset-x-0 text-center pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-neutral-300 border border-white/10">
                    Arahkan kotak ke QR code peserta
                  </span>
                </div>
              </>
            )}

            {processing && (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-neutral-300 tracking-wide uppercase">
                  Memvalidasi Tiket...
                </p>
              </div>
            )}

            {!scanning && !processing && !result && (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mx-auto text-3xl">
                  📷
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Kamera Dihentikan</h3>
                  <p className="text-xs text-neutral-400 mt-1">Tekan tombol di bawah untuk memulai kembali scan.</p>
                </div>
                <button
                  onClick={() => setScanning(true)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg"
                >
                  Mulai Kamera
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Code Input Mode */}
        {mode === 'manual' && !result && (
          <form onSubmit={handleManualSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Kode Tiket Peserta
              </label>
              <p className="text-[11px] text-neutral-400">
                Masukkan kode alfabet unik (Contoh: EVT-SW882910)
              </p>
            </div>

            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="EVT-XXXXXX"
              className="w-full h-12 px-4 rounded-2xl bg-black border border-white/20 text-center font-mono text-base font-black tracking-widest text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />

            <ShimmerButton
              type="submit"
              disabled={processing || !manualCode.trim()}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-primary/20"
            >
              {processing ? 'Memeriksa...' : 'Validasi Kode Tiket'}
            </ShimmerButton>
          </form>
        )}

        {/* Scan Result Card (Aceternity style banner) */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={'rounded-3xl border p-5 shadow-2xl space-y-4 ' + (
                result.success
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100 shadow-emerald-900/30'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-100 shadow-rose-900/30'
              )}
            >
              <div className="flex items-start gap-3.5">
                <div className={'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ' + (
                  result.success ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                )}>
                  {result.success ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>

                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block">
                    {result.success ? 'VERIFIKASI BERHASIL' : 'VERIFIKASI GAGAL'}
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {result.message || result.error}
                  </h3>
                  {result.ticket && (
                    <p className="font-mono text-xs font-bold text-white/90 mt-1">
                      KODE: {result.ticket.ticket_code}
                    </p>
                  )}
                </div>
              </div>

              {result.ticket && (
                <div className="bg-black/30 rounded-2xl p-3.5 border border-white/10 space-y-1.5 text-xs text-neutral-200">
                  {result.ticket.user?.name && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>Nama Peserta: <strong className="text-white">{result.ticket.user.name}</strong></span>
                    </div>
                  )}
                  {result.ticket.event?.title && (
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-blue-400" />
                      <span className="line-clamp-1">Event: <strong className="text-white">{result.ticket.event.title}</strong></span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={resetScanner}
                className="w-full h-11 rounded-2xl bg-white text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-98 transition-all shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Peserta Berikutnya
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Scan History */}
        {scanHistory.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 px-1">
              Riwayat Check-in Sesi Ini:
            </h4>
            <div className="space-y-1.5">
              {scanHistory.map((h, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">
                        {h.ticket?.user?.name || 'Peserta Terverifikasi'}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {h.ticket?.ticket_code}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {formatTime(new Date().toISOString())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Safe area spacer for floating dock */}
        <div className="h-20" />
      </div>
    </div>
  );
}
