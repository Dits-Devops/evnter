const fs = require('fs');

const code = `'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Phone, Sparkles, UserPlus, ArrowRight } from 'lucide-react';
import StatusMessage from '@/components/StatusMessage';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { triggerConfetti } from '@/lib/confetti';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'organizer') router.replace('/organizer');
      else router.replace('/');
    }
  }, [user, loading, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal');
        setSubmitting(false);
        return;
      }

      triggerConfetti();
      setTimeout(() => {
        if (role === 'organizer') router.replace('/organizer/my-events');
        else router.replace('/');
      }, 700);
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Mulai Petualangan Anda
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Buat Akun Baru</h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Dapatkan akses tiket eksklusif dan pengalaman event terbaik se-Indonesia.
        </p>
      </div>

      {/* Role Picker Pills */}
      <div className="flex p-1 bg-muted/80 backdrop-blur-md rounded-2xl border border-border/70">
        <button
          type="button"
          onClick={() => setRole('user')}
          className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all \${
            role === 'user'
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground'
          }\`}
        >
          🎟️ Peserta Event
        </button>
        <button
          type="button"
          onClick={() => setRole('organizer')}
          className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all \${
            role === 'organizer'
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground'
          }\`}
        >
          🎪 Penyelenggara
        </button>
      </div>

      {error && <StatusMessage type="error" message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Nama Lengkap */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">
            Nama Lengkap
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Raditya Pratama"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/70 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">
            Alamat Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/70 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">
            Nomor WhatsApp
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="whatsapp"
              type="tel"
              required
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="081234567890"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/70 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/70 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="pt-2">
          <ShimmerButton
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Membuat Akun...'
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </ShimmerButton>
        </div>
      </form>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Sudah memiliki akun?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Masuk di sini
        </Link>
      </p>
    </motion.div>
  );
}
`;

fs.writeFileSync('D:/Projects/Eventer/evnter/src/app/(auth)/register/page.tsx', code, 'utf8');
console.log('Successfully upgraded register/page.tsx');
