'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StatusMessage from '@/components/StatusMessage';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { fireConfetti } from '@/lib/confetti';
import { LogIn, Mail, Lock, User, ShieldCheck, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

type RoleTab = 'user' | 'organizer' | 'admin';

const DEMO_PRESETS: Record<RoleTab, { email: string; pass: string; title: string }> = {
  user: {
    email: 'dits@evnter.id',
    pass: 'password123',
    title: 'Pengunjung (Sobat Event)',
  },
  organizer: {
    email: 'organizer@evnter.id',
    pass: 'password123',
    title: 'Penyelenggara Event',
  },
  admin: {
    email: 'admin@evnter.id',
    pass: 'password123',
    title: 'Master Administrator',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleTab>('user');
  const [form, setForm] = useState({
    email: DEMO_PRESETS.user.email,
    password: DEMO_PRESETS.user.pass,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'organizer') router.replace('/organizer/my-events');
      else router.replace('/');
    }
  }, [user, router]);

  function handleRoleChange(role: RoleTab) {
    setSelectedRole(role);
    setForm({
      email: DEMO_PRESETS[role].email,
      password: DEMO_PRESETS[role].pass,
    });
    setError('');
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(form.email, form.password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    fireConfetti();
    setTimeout(() => {
      if (selectedRole === 'admin') window.location.href = '/admin';
      else if (selectedRole === 'organizer') window.location.href = '/organizer/my-events';
      else window.location.href = '/';
    }, 400);
  }

  return (
    <div className="space-y-6">
      {/* Role Picker Segmented Tabs (Origin UI & iOS style) */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
          Pilih Peran Demo / Akun
        </label>
        <SegmentedTabs<RoleTab>
          tabs={[
            { id: 'user', label: 'User', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'organizer', label: 'Organizer', icon: <Briefcase className="w-3.5 h-3.5" /> },
            { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ]}
          activeTab={selectedRole}
          onChange={handleRoleChange}
        />
      </div>

      {/* Glass Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[28px] border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)]"
      >
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mode Masuk: {DEMO_PRESETS[selectedRole].title}</span>
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Masuk untuk menjelajahi event, tiket, & fitur eksklusif
          </p>
        </div>

        {error && <StatusMessage type="error" message={error} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/50 border border-border/80 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground">Password</label>
              <span className="text-[10px] text-muted-foreground font-mono">demo: password123</span>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/50 border border-border/80 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Magic UI Shimmer Button */}
          <div className="mt-2">
            <ShimmerButton
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Memproses Masuk...' : 'Masuk ke EVNTER'}</span>
            </ShimmerButton>
          </div>
        </form>

        {/* 1-Tap Quick Credentials Banner */}
        <div className="mt-4 pt-3.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            1-Klik demo login siap pakai
          </span>
          <button
            type="button"
            onClick={() => handleRoleChange(selectedRole)}
            className="text-primary font-bold hover:underline"
          >
            Isi Ulang
          </button>
        </div>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground font-medium">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary font-extrabold hover:underline">
          Daftar Sekarang Gratis
        </Link>
      </p>
    </div>
  );
}
