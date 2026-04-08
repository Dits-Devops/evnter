'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';

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
    // AuthContext handles redirect via user state update
  }

  if (loading) return null;

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Masuk ke Akun</h2>
      {error && <div className="mb-4"><StatusMessage type="error" message={error} /></div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          placeholder="Masukkan password"
          required
        />
        <Button type="submit" loading={submitting} fullWidth size="lg">
          Masuk
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Belum punya akun?{' '}
        <Link href="/register" className="text-blue-600 font-semibold">
          Daftar Sekarang
        </Link>
      </p>
    </Card>
  );
}
