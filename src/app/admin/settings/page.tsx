'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Card from '@/components/Card';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PaymentSettings } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<PaymentSettings>>({
    payment_name: 'BCA',
    account_name: 'EVNTER Indonesia',
    account_number: '1234567890',
    qris_image: undefined,
    whatsapp_admin: '085882846665',
    description: 'Transfer ke rekening di atas atau scan QRIS',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setSettings((prev: Partial<PaymentSettings>) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSettings((prev: Partial<PaymentSettings>) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Pengaturan pembayaran berhasil disimpan');
    } else {
      toast.error(data.error || 'Gagal menyimpan pengaturan, silakan coba lagi');
    }
    setSaving(false);
  }

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <Header title="⚙️ Pengaturan Pembayaran" />
      <div className="px-4 py-4">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Card>
            <h3 className="font-bold text-gray-800 mb-3">Informasi Rekening</h3>
            <div className="flex flex-col gap-3">
              <Input
                label="Nama Bank / E-Wallet"
                name="payment_name"
                value={settings.payment_name || ''}
                onChange={handleInputChange}
                placeholder="Contoh: BCA, GoPay, DANA"
                required
              />
              <Input
                label="Nomor Rekening / E-Wallet"
                name="account_number"
                value={settings.account_number || ''}
                onChange={handleInputChange}
                placeholder="Contoh: 1234567890"
                required
              />
              <Input
                label="Nama Pemilik Rekening"
                name="account_name"
                value={settings.account_name || ''}
                onChange={handleInputChange}
                placeholder="Contoh: EVNTER Indonesia"
                required
              />
              <Input
                label="Nomor WhatsApp Admin"
                name="whatsapp_admin"
                type="tel"
                value={settings.whatsapp_admin || ''}
                onChange={handleInputChange}
                placeholder="Contoh: 085882846665"
                required
              />
              <Textarea
                label="Deskripsi / Instruksi Pembayaran"
                name="description"
                value={settings.description || ''}
                onChange={handleChange}
                placeholder="Tuliskan instruksi pembayaran..."
                rows={3}
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-800 mb-3">QRIS Image</h3>
            <ImageUpload
              label="Upload Gambar QRIS"
              placeholder="Seret gambar QRIS ke sini atau klik untuk memilih"
              value={settings.qris_image || null}
              onChange={(url) => setSettings((prev: Partial<PaymentSettings>) => ({ ...prev, qris_image: url || undefined }))}
            />
          </Card>

          {/* Preview */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3">Preview Tampilan</h3>
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-blue-800">{settings.payment_name}</p>
              <p className="text-sm text-blue-700">No. Rekening: {settings.account_number}</p>
              <p className="text-sm text-blue-700">Atas nama: {settings.account_name}</p>
              {settings.description && (
                <p className="text-xs text-blue-600 mt-2">{settings.description}</p>
              )}
            </div>
            {settings.qris_image && (
              <div className="mt-3 flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-700 mb-2">QRIS</p>
                <div className="relative w-48 h-48 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <Image
                    src={settings.qris_image}
                    alt="QRIS"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </Card>

          <Button type="submit" loading={saving} fullWidth size="lg">
            💾 Simpan Pengaturan
          </Button>
        </form>
      </div>
    </div>
  );
}
