'use client';

import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden text-center">
      <BackgroundGlow variant="spotlight" />

      <div className="relative z-10 max-w-sm w-full bg-card/70 border border-border/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/10 animate-bounce duration-1000">
          <Compass className="w-10 h-10" />
        </div>

        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 mb-2">
          404
        </span>

        <h2 className="text-xl font-black text-foreground mb-2 tracking-tight">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground font-medium mb-8 px-2">
          Halaman yang Anda tuju mungkin sudah dipindahkan atau URL yang dimasukkan salah.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/" className="w-full">
            <button className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </Link>

          <button 
            onClick={() => window.history.back()}
            className="w-full py-3 rounded-2xl border border-border/80 bg-muted/40 hover:bg-muted text-foreground font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Ke Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
