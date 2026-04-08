'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';
import { getInitials } from '@/utils/helpers';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', whatsapp: user?.whatsapp || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      await refreshUser();
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setEditing(false);
    } else {
      setMessage({ type: 'error', text: data.error || 'Gagal menyimpan' });
    }
    setSaving(false);
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const proStatusLabels = {
    free: { label: 'Gratis', class: 'bg-gray-100 text-gray-600' },
    pending: { label: 'Menunggu Verifikasi', class: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Pro Organizer', class: 'bg-green-100 text-green-700' },
  };
  const proStatus = user ? proStatusLabels[user.pro_status] : proStatusLabels.free;

  return (
    <div>
      <Header title="👤 Profil Saya" />
      <div className="px-4 py-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3">
            {user ? getInitials(user.name) : '?'}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full ${proStatus.class}`}>
            {proStatus.label}
          </span>
        </div>

        {message && (
          <div className="mb-4">
            <StatusMessage type={message.type} message={message.text} />
          </div>
        )}

        {/* Edit Form */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Informasi Akun</h3>
            {!editing && (
              <button
                onClick={() => {
                  setEditing(true);
                  setForm({ name: user?.name || '', whatsapp: user?.whatsapp || '' });
                }}
                className="text-sm text-blue-600 font-semibold"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-3">
              <Input
                label="Nama Lengkap"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Nomor WhatsApp"
                name="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={handleChange}
                required
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button onClick={handleSave} loading={saving} className="flex-1">
                  Simpan
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">WhatsApp</p>
                <p className="font-medium text-gray-800">{user?.whatsapp}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Upgrade to Organizer */}
        {user?.pro_status === 'free' && (
          <button
            onClick={() => router.push('/upgrade')}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-4 flex items-center gap-3 mb-4"
          >
            <span className="text-3xl">⭐</span>
            <div className="text-left">
              <p className="font-bold text-white text-sm">Upgrade ke Organizer Pro</p>
              <p className="text-orange-100 text-xs">Buat dan kelola event Anda sendiri</p>
            </div>
          </button>
        )}

        <Button variant="danger" fullWidth onClick={handleLogout}>
          🚪 Keluar
        </Button>
      </div>
    </div>
  );
}
