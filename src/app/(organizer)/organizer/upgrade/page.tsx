'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ImageUpload from '@/components/ImageUpload';
import { useAlert } from '@/context/AlertContext';

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
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const alert = useAlert();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings(d.settings); });
  }, []);

  if (user?.pro_status === 'pending') {
    return (
      <div>
        <Header title="Upgrade ke Pro" showBack />
        <div className="px-5 py-12 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-orange-100/50 rounded-[2rem] flex items-center justify-center mb-6">
            <p className="text-5xl animate-bounce">⏳</p>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-3">Menunggu Verifikasi</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            Bukti transfer berhasil dikirim. Admin akan memverifikasi pembayaran Anda maksimal 1x24 jam.
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

  async function handleSubmitProof() {
    if (!user || !proofUrl) return;
    setSubmitting(true);

    const res = await fetch('/api/users/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_proof_url: proofUrl }),
    });
    
    if (res.ok) {
      await alert.success('Berhasil', 'Bukti transfer berhasil dikirim. Admin akan memverifikasi pembayaran Anda.');
      await refreshUser();
    } else {
      const data = await res.json();
      await alert.error('Terjadi Kesalahan', data.error || 'Gagal submit bukti transfer. Silakan coba lagi.');
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
          {settings.qris_image && (
            <div className="mt-5 flex flex-col items-center">
              <div className="w-full bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-sm flex items-center justify-center">
                <img
                  src={settings.qris_image}
                  alt="QRIS"
                  className="w-full max-w-[280px] h-auto object-contain rounded-2xl"
                />
              </div>
              <p className="text-sm font-bold text-gray-700 mt-4 mb-2">Scan QRIS di atas ☝️</p>
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

        {!showUpload ? (
          <div className="flex flex-col gap-3">
            <Button onClick={() => setShowUpload(true)} fullWidth size="lg">
              ✅ Saya Sudah Bayar
            </Button>
          </div>
        ) : (
          <Card className="mb-4 border-2 border-green-100 shadow-sm">
            <h3 className="font-bold text-foreground mb-3 text-lg">Upload Bukti Transfer</h3>
            <ImageUpload 
              value={proofUrl} 
              onChange={setProofUrl} 
              label="Bukti Pembayaran (Wajib)"
              placeholder="Pilih atau seret resi ke sini"
            />
            <div className="mt-5 flex flex-col gap-3">
              <Button
                onClick={handleSubmitProof}
                loading={submitting}
                fullWidth
                size="lg"
                disabled={!proofUrl}
              >
                Kirim Bukti TF
              </Button>
              <Button variant="secondary" onClick={() => setShowUpload(false)} fullWidth>
                Batal
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
