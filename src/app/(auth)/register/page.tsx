'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';

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
  }

  if (loading) return null;

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Daftar Akun</h2>
      {error && <div className="mb-4"><StatusMessage type="error" message={error} /></div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nama Lengkap"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap"
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
        <Button type="submit" loading={submitting} fullWidth size="lg">
          Daftar Sekarang
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-blue-600 font-semibold">
          Masuk
        </Link>
      </p>
    </Card>
  );
}
