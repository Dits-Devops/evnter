'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import Card from '@/components/Card';
import AvatarUpload from '@/components/AvatarUpload';
import { useAlert } from '@/context/AlertContext';
import { getInitials, getProfileImageUrl } from '@/utils/helpers';
import Header from '@/components/Header';
import { Sparkles, Edit2, LogOut, CheckCircle, Mail, Phone, Clock } from 'lucide-react';

export default function ProfilePage() {
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
    } catch {
      console.error('Update Profile Error');
      await alert.error('Gagal', 'Terjadi kesalahan sistem');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const proStatusLabels = {
    free: { label: 'Plan Gratis', class: 'bg-muted text-muted-foreground', icon: Clock },
    pending: { label: 'Menunggu Verifikasi', class: 'bg-orange-100 text-orange-700', icon: Clock },
    approved: { label: 'Pro Organizer', class: 'bg-green-100 text-green-700', icon: CheckCircle },
  };
  const proStatus = user ? proStatusLabels[user.pro_status] : proStatusLabels.free;
  const StatusIcon = proStatus.icon;

  const profileImageUrl = getProfileImageUrl(user);

  return (
    <div className="pb-28 animate-in-slide-up">
      <Header title="👤 Profil Saya" />
      {/* Cover background */}
      <div className="h-32 bg-primary w-full rounded-b-[2rem] absolute top-0 left-0 z-0 opacity-80" />
      
      <div className="px-5 pt-16 relative z-10 max-w-md mx-auto">
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
             <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[1.25rem] flex items-center justify-center text-3xl font-black text-white">
              {user ? getInitials(user.name) : '?'}
             </div>
            )}
          </div>
          <h2 className="text-2xl font-black text-foreground">{user?.name}</h2>
          <span className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${proStatus.class}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {proStatus.label}
          </span>
        </div>

        <div className="space-y-4">
          <Card padding={false} className="overflow-hidden">
            <div className="bg-muted/30 px-5 py-4 flex items-center justify-between border-b border-border/50">
              <h3 className="font-bold text-foreground">Detail Akun</h3>
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
                  className="p-1.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-5">
              {editing ? (
                <div className="flex flex-col gap-6 items-center">
                  <AvatarUpload 
                    value={form.profile_image} 
                    onUploadSuccess={(url) => {
                      setForm(p => ({ ...p, profile_image: url }));
                      // Auto-save or wait for Save button? 
                      // The user asked for "instant everywhere", 
                      // but they still have a "Simpan" button for Name/WA.
                      // I'll keep the button flow but the image URL is now in state.
                    }} 
                  />
                  <div className="w-full space-y-4">
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
                  </div>
                  <div className="flex gap-3 mt-2">
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
                <div className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                      <p className="font-medium text-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-border/40" />
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">WhatsApp</p>
                      <p className="font-medium text-foreground">{user?.whatsapp || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {user?.pro_status === 'free' && (
            <button
              onClick={() => router.push('/organizer/upgrade')}
              className="w-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-[1.5rem] p-5 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-soft relative overflow-hidden text-left"
            >
              <div className="absolute -top-10 -right-10 p-4 opacity-10"><Sparkles className="w-32 h-32 text-white"/></div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm z-10">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="z-10">
                <p className="font-extrabold text-white text-base">Gabung Pro Organizer</p>
                <p className="text-orange-100 text-xs font-medium mt-0.5">Mulai buat event pertama kamu!</p>
              </div>
            </button>
          )}

          <Button variant="danger" fullWidth onClick={handleLogout} className="mt-2" size="lg">
            <LogOut className="w-5 h-5" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );
}
