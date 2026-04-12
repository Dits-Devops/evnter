'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import Card from '@/components/Card';
import AvatarUpload from '@/components/AvatarUpload';
import { getInitials, getProfileImageUrl } from '@/utils/helpers';
import { useAlert } from '@/context/AlertContext';

export default function OrganizerProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    whatsapp: user?.whatsapp || '',
    profile_image: user?.profile_image || null as string | null
  });
  const [saving, setSaving] = useState(false);
  const alert = useAlert();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          whatsapp: form.whatsapp,
          profile_image: form.profile_image
        }),
      });

      if (res.ok) {
        await refreshUser();
        await alert.success('Berhasil', 'Foto profil berhasil diperbarui');
        setEditing(false);
      } else {
        const data = await res.json();
        await alert.error('Gagal', data.error || 'Foto profil gagal diperbarui');
      }
    } catch (err) {
      console.error('Update Organizer Profile Error:', err);
      await alert.error('Gagal', 'Terjadi kesalahan sistem');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const profileImageUrl = getProfileImageUrl(user);

  return (
    <div>
      <Header title="👤 Profil Organizer" />
      <div className="px-4 py-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-card rounded-3xl shadow-soft flex items-center justify-center p-1.5 mb-4 border border-card/40">
            {editing && form.profile_image ? (
              <div className="relative w-full h-full overflow-hidden rounded-[1.25rem]">
                <Image src={form.profile_image} alt="Preview" fill className="object-cover" />
              </div>
            ) : profileImageUrl ? (
              <div className="relative w-full h-full overflow-hidden rounded-[1.25rem]">
                <Image src={profileImageUrl} alt={user?.name || 'Profile'} fill className="object-cover" />
              </div>
            ) : (
             <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 rounded-[1.25rem] flex items-center justify-center text-3xl font-black text-white">
               {user ? getInitials(user.name) : '?'}
             </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
            ⭐ Organizer Pro
          </span>
        </div>



        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Informasi Akun</h3>
            {!editing && (
              <button
                onClick={() => {
                  setEditing(true);
                  setForm({ 
                    name: user?.name || '', 
                    whatsapp: user?.whatsapp || '',
                    profile_image: user?.profile_image || null 
                  });
                }}
                className="text-sm text-blue-600 font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          {editing ? (
            <div className="flex flex-col gap-6 items-center">
              <AvatarUpload 
                value={form.profile_image} 
                onUploadSuccess={(url) => setForm(p => ({ ...p, profile_image: url }))} 
              />
              <div className="w-full space-y-4">
                <Input label="Nama" name="name" value={form.name} onChange={handleChange} required />
                <Input
                  label="WhatsApp"
                  name="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">
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

        <Button variant="danger" fullWidth onClick={handleLogout}>
          🚪 Keluar
        </Button>
      </div>
    </div>
  );
}
