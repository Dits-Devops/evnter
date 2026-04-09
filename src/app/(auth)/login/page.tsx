'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import StatusMessage from '@/components/StatusMessage';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
    const result = await login(form.email, form.password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
  }

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Selamat Datang Kembali</h2>
        <p className="text-sm text-muted-foreground mt-1">Silakan masuk ke akun Anda</p>
      </div>

      {error && <StatusMessage type="error" message={error} />}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="email@example.com"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Masukkan password Anda"
          required
        />
        <Button type="submit" loading={submitting} fullWidth size="lg" className="mt-2">
          <LogIn className="w-5 h-5 mr-1 hidden" />
          Masuk Sekarang
        </Button>
      </form>
      
      <p className="text-center text-sm text-muted-foreground mt-8">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary font-bold hover:underline transition-all">
          Daftar Gratis
        </Link>
      </p>
    </div>
  );
}
