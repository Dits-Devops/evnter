'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import StatusMessage from '@/components/StatusMessage';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
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
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal');
        setSubmitting(false);
        return;
      }

      router.replace('/');
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Buat Akun Baru</h2>
        <p className="text-sm text-muted-foreground mt-1">Daftar untuk mulai memesan tiket</p>
      </div>

      {error && <StatusMessage type="error" message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nama Lengkap"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="M. Fulan"
          required
        />
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
          placeholder="Minimal 6 karakter"
          required
        />
        <Input
          label="Nomor WhatsApp"
          name="whatsapp"
          type="tel"
          value={form.whatsapp}
          onChange={handleChange}
          placeholder="08xxxxxxxxxx"
          required
        />
        <Button type="submit" loading={submitting} fullWidth size="lg" className="mt-2">
          <UserPlus className="w-5 h-5 mr-1 hidden" />
          Daftar Sekarang
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline transition-all">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
