'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';
import { createWhatsAppUpgradeMessage } from '@/utils/helpers';

interface Settings {
  payment_name?: string;
  account_number?: string;
  account_name?: string;
  qris_image?: string;
  whatsapp_admin?: string;
  description?: string;
}

export default function UpgradePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    payment_name: 'BCA',
    account_number: '1234567890',
    account_name: 'EVNTER Indonesia',
    whatsapp_admin: '085882846665',
    description: 'Transfer ke rekening di atas atau scan QRIS',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings(d.settings); });
  }, []);

  if (user?.pro_status === 'pending') {
    return (
      <div>
        <Header title="Upgrade ke Pro" showBack />
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <p className="text-6xl mb-4">⏳</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Menunggu Verifikasi</h2>
          <p className="text-gray-500 text-sm">
            Pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu 1×24 jam.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                const waLink = createWhatsAppUpgradeMessage(user?.name || '', user?.email || '');
                window.open(waLink, '_blank');
              }}
            >
              💬 Chat Admin WhatsApp
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.pro_status === 'approved' || user?.role === 'organizer') {
    return (
      <div>
        <Header title="Upgrade ke Pro" showBack />
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Anda Sudah Pro!</h2>
          <p className="text-gray-500 text-sm mb-6">Selamat, Anda sudah menjadi Organizer Pro.</p>
          <Button onClick={() => router.push('/organizer/my-events')}>
            Kelola Event Saya
          </Button>
        </div>
      </div>
    );
  }

  async function handleSendWhatsApp() {
    if (!user) return;
    setSubmitting(true);

    const res = await fetch('/api/users/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_proof_url: 'via-whatsapp' }),
    });
    const data = await res.json();
    if (res.ok) {
      await refreshUser();
      setMessage({ type: 'success', text: data.message });
      const waLink = createWhatsAppUpgradeMessage(user.name, user.email);
      window.open(waLink, '_blank');
    } else {
      setMessage({ type: 'error', text: data.error || 'Gagal submit' });
    }
    setSubmitting(false);
  }

  return (
    <div>
      <Header title="⭐ Upgrade ke Pro" showBack />
      <div className="px-4 py-4">
        {/* Benefits */}
        <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-5 mb-6 text-white">
          <h2 className="text-xl font-black mb-1">Jadi Organizer Pro!</h2>
          <p className="text-orange-100 text-sm mb-3">Buat dan kelola event Anda sendiri</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">✅ Buat event tak terbatas</li>
            <li className="flex items-center gap-2">✅ Scanner QR Code canggih</li>
            <li className="flex items-center gap-2">✅ Laporan peserta lengkap</li>
            <li className="flex items-center gap-2">✅ Support prioritas</li>
          </ul>
        </div>

        {/* Payment Info */}
        <Card className="mb-4">
          <h3 className="font-bold text-gray-800 mb-3">💳 Info Pembayaran</h3>
          <div className="bg-blue-50 rounded-xl p-3 mb-3">
            <p className="text-sm text-blue-800 font-semibold">{settings.payment_name}</p>
            <p className="text-sm text-blue-700">No: {settings.account_number}</p>
            <p className="text-sm text-blue-700">Atas nama: {settings.account_name}</p>
            <p className="text-sm font-bold text-blue-800 mt-1">Nominal: Rp 99.000 (sekali bayar)</p>
          </div>
          {settings.description && (
            <p className="text-xs text-gray-500">{settings.description}</p>
          )}
          {settings.qris_image ? (
            <div className="mt-3 flex flex-col items-center">
              <p className="text-sm font-semibold text-gray-700 mb-2">Scan QRIS</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.qris_image}
                alt="QRIS"
                className="w-44 h-44 object-contain rounded-xl border border-gray-200"
              />
            </div>
          ) : (
            <div className="mt-3 bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl mb-1">📲</p>
              <p className="text-xs text-gray-400">QRIS belum tersedia. Gunakan transfer bank di atas.</p>
            </div>
          )}
        </Card>

        <Card className="mb-4 bg-green-50 border border-green-100">
          <h3 className="font-bold text-green-800 mb-2">📱 Cara Konfirmasi</h3>
          <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
            <li>Transfer pembayaran ke rekening di atas</li>
            <li>Klik tombol di bawah untuk kirim bukti ke Admin</li>
            <li>Admin akan verifikasi dalam 1×24 jam</li>
            <li>Akun Anda akan otomatis jadi Organizer Pro</li>
          </ol>
        </Card>

        {message && (
          <div className="mb-4">
            <StatusMessage type={message.type} message={message.text} />
          </div>
        )}

        <Button
          onClick={handleSendWhatsApp}
          loading={submitting}
          fullWidth
          size="lg"
        >
          💬 Kirim Bukti TF ke Admin WhatsApp
        </Button>
        <p className="text-xs text-center text-gray-400 mt-2">
          Akan membuka WhatsApp ke {settings.whatsapp_admin || '085882846665'}
        </p>
      </div>
    </div>
  );
}
