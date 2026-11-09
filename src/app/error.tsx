'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/Button';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden text-center">
      <BackgroundGlow variant="mesh" />
      
      <div className="relative z-10 max-w-sm w-full bg-card/70 border border-border/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/5">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Oops! Terjadi Masalah</h2>
        <p className="text-xs text-muted-foreground font-medium mb-5 px-2">
          Sistem mengalami kendala sementara saat memuat data ini.
        </p>

        {error.message && (
          <div className="text-[11px] font-mono text-rose-400 bg-rose-950/40 border border-rose-900/50 p-3 rounded-2xl mb-6 w-full max-h-28 overflow-auto text-left">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <Button onClick={reset} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Coba Muat Ulang
          </Button>
          
          <Link href="/" className="w-full">
            <button className="w-full py-3 rounded-2xl border border-border/80 bg-muted/40 text-foreground font-bold text-xs hover:bg-muted transition-all flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
