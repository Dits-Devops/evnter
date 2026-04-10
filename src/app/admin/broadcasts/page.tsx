'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/shared/Input';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAlert } from '@/context/AlertContext';
import { Megaphone, History } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/helpers';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target_role: string;
  type: string;
  created_at: string;
  author?: { name: string };
}

export default function AdminBroadcastPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const alert = useAlert();

  const [form, setForm] = useState({
    title: '',
    message: '',
    target_role: 'all', // 'all', 'user', 'organizer'
    type: 'info' // 'info', 'warning'
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch(`/api/admin/broadcasts?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.message) {
      await alert.warning('Perhatian', 'Judul dan isi pesan wajib diisi');
      return;
    }

    const confirm = await alert.confirm(
      'Kirim Broadcast?', 
      'Notifikasi akan dikirim ke penerima yang dipilih.'
    );
    if (!confirm) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        await alert.success('Berhasil', `Broadcast berhasil dikirim ke ${data.recipients} penerima`);
        setForm({ title: '', message: '', target_role: 'all', type: 'info' });
        fetchHistory();
      } else {
        await alert.error('Gagal', data.error || 'Gagal mengirim broadcast');
      }
    } catch {
      await alert.error('Gagal', 'Terjadi kesalahan sistem');
    } finally {
      setSending(false);
    }
  }

  const roleLabels: Record<string, string> = {
    'all': 'Semua User dan Organizer',
    'user': 'Semua User',
    'organizer': 'Semua Organizer'
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <Header title="Broadcast" showBack />
      
      <div className="p-5">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600" />
            Kirim Pengumuman
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kirim notifikasi in-app kepada pengguna yang dipilih
          </p>
        </div>

        <Card className="mb-8">
          <form onSubmit={handleSend} className="space-y-4">
            <Input
              label="Judul Notifikasi"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Contoh: Info Update Fitur Baru"
              required
            />

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Isi Pesan
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tulis pesan lengkap di sini..."
                rows={4}
                required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-[1rem] focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-4 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Target Penerima
                </label>
                <select
                  name="target_role"
                  value={form.target_role}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-[1rem] p-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 active:scale-[0.98] transition-transform appearance-none font-medium"
                >
                  <option value="all">Semua Pengguna</option>
                  <option value="user">Semua User</option>
                  <option value="organizer">Semua Organizer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Tipe
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-[1rem] p-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 active:scale-[0.98] transition-transform appearance-none font-medium"
                >
                  <option value="info">Info Umum</option>
                  <option value="warning">Peringatan Penting</option>
                </select>
              </div>
            </div>

            <Button type="submit" loading={sending} fullWidth size="lg" className="mt-4 !bg-indigo-600 hover:!bg-indigo-700 !text-white shadow-indigo-500/30">
              Kirim Broadcast Sekarang
            </Button>
          </form>
        </Card>

        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-800 text-lg">Riwayat Broadcast</h3>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[1.5rem] border border-gray-100">
            <p className="text-gray-400">Belum ada riwayat broadcast</p>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((bc) => (
              <Card key={bc.id} padding={false} className="p-4 flex flex-col gap-2 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${bc.type === 'warning' ? 'bg-orange-500' : 'bg-indigo-500'}`} />
                <div className="flex justify-between items-start pl-2">
                  <h4 className="font-bold text-gray-800 text-sm">{bc.title}</h4>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium whitespace-nowrap ml-2">
                    {roleLabels[bc.target_role]}
                  </span>
                </div>
                <p className="text-xs text-gray-600 pl-2 line-clamp-2">{bc.message}</p>
                <div className="flex justify-between items-center pl-2 mt-1 border-t border-gray-100 pt-2">
                  <p className="text-[10px] text-gray-400 font-medium">Oleh: {bc.author?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{formatDate(bc.created_at)} {formatTime(bc.created_at)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
