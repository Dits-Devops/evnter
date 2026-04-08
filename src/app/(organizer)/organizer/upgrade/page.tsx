'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';

export default function UpgradePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [paymentUrl, setPaymentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (user?.pro_status === 'pending') {
    return (
      <div>
        <Header title="Upgrade ke Pro" showBack />
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <p className="text-6xl mb-4">⏳</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Menunggu Verifikasi</h2>
          <p className="text-gray-500 text-sm">
            Pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu 1x24 jam.
          </p>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentUrl) {
      setMessage({ type: 'error', text: 'URL bukti pembayaran wajib diisi' });
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/users/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_proof_url: paymentUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: data.message });
      await refreshUser();
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
          <h2 className="text-xl font-black mb-3">Jadi Organizer Pro!</h2>
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
            <p className="text-sm text-blue-800 font-semibold">Transfer ke:</p>
            <p className="text-sm text-blue-700">BCA: 1234567890</p>
            <p className="text-sm text-blue-700">Atas nama: EVNTER Indonesia</p>
            <p className="text-sm text-blue-700">Nominal: Rp 99.000 (sekali bayar)</p>
          </div>
          <p className="text-xs text-gray-500">
            Setelah transfer, upload screenshot bukti pembayaran di bawah.
          </p>
        </Card>

        {message && (
          <div className="mb-4">
            <StatusMessage type={message.type} message={message.text} />
          </div>
        )}

        <Card>
          <h3 className="font-bold text-gray-800 mb-3">📸 Upload Bukti Pembayaran</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="URL Screenshot Bukti Pembayaran"
              name="payment_url"
              type="url"
              value={paymentUrl}
              onChange={(e) => setPaymentUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              required
            />
            <p className="text-xs text-gray-400">
              Upload foto ke Google Drive / Imgur dan paste link-nya di sini
            </p>
            <Button type="submit" loading={submitting} fullWidth size="lg">
              🚀 Kirim Bukti Pembayaran
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
