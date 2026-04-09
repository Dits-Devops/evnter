'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Card from '@/components/Card';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAlert } from '@/context/AlertContext';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    price: '',
    poster_url: '',
    max_peserta: '',
    metode_pembayaran: '',
    nomor_rekening: '',
    nama_pemilik: '',
    catatan_pembayaran: '',
    qris_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const alert = useAlert();

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          const e = data.event;
          // Format date for datetime-local input
          const formattedDate = e.date ? new Date(e.date).toISOString().slice(0, 16) : '';
          setForm({
            title: e.title || '',
            date: formattedDate,
            location: e.location || '',
            description: e.description || '',
            price: e.price ? String(e.price) : '',
            poster_url: e.poster_url || '',
            max_peserta: e.max_peserta ? String(e.max_peserta) : '',
            metode_pembayaran: e.metode_pembayaran || '',
            nomor_rekening: e.nomor_rekening || '',
            nama_pemilik: e.nama_pemilik || '',
            catatan_pembayaran: e.catatan_pembayaran || '',
            qris_image: e.qris_image || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/events/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: form.price ? parseInt(form.price) : 0,
        max_peserta: form.max_peserta ? parseInt(form.max_peserta) : 0,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      await alert.success('Berhasil', 'Perubahan berhasil disimpan!');
      router.push(`/organizer/events/${data.event.id}`);
    } else {
      await alert.error('Gagal', data.error || 'Gagal menyimpan event');
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="pb-24">
      <Header title="✏️ Edit Event" showBack />
      <div className="px-4 py-4">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nama Event"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Tanggal & Waktu"
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Lokasi"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              required
            />

            {/* Price */}
            <div>
              <Input
                label="Harga Tiket (isi 0 jika Gratis)"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleInputChange}
              />
              {(!form.price || parseInt(form.price) === 0) && (
                <p className="text-xs text-green-600 mt-1 font-semibold">✅ Event ini Gratis</p>
              )}
              {form.price && parseInt(form.price) > 0 && (
                <p className="text-xs text-orange-600 mt-1 font-semibold">
                  💰 Harga: Rp {parseInt(form.price).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Max Peserta */}
            <Input
              label="Batas Maksimal Peserta (opsional)"
              name="max_peserta"
              type="number"
              min="0"
              value={form.max_peserta}
              onChange={handleInputChange}
              placeholder="0 untuk tidak terbatas"
            />

            {form.price && parseInt(form.price) > 0 && (
              <div className="border border-orange-200 rounded-[1.5rem] p-5 space-y-4 bg-orange-50/50 mt-2">
                <h3 className="font-bold text-orange-800 flex items-center gap-2">
                  <span className="text-xl">💳</span> Pengaturan Pembayaran (Wajib)
                </h3>
                <Input
                  label="Metode Pembayaran (ex: BCA, GoPay)"
                  name="metode_pembayaran"
                  value={form.metode_pembayaran}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Nomor Rekening / E-Wallet"
                  name="nomor_rekening"
                  value={form.nomor_rekening}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Atas Nama"
                  name="nama_pemilik"
                  value={form.nama_pemilik}
                  onChange={handleInputChange}
                  required
                />
                <Textarea
                  label="Catatan Pembayaran (opsional)"
                  name="catatan_pembayaran"
                  value={form.catatan_pembayaran}
                  onChange={handleChange}
                  rows={2}
                />
                <ImageUpload
                  label="QRIS (opsional)"
                  value={form.qris_image || null}
                  onChange={(url) => setForm((prev) => ({ ...prev, qris_image: url || '' }))}
                />
              </div>
            )}

            <Textarea
              label="Deskripsi"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />

            {/* Poster Upload */}
            <ImageUpload
              label="Poster Event (opsional)"
              value={form.poster_url || null}
              onChange={(url) => setForm((prev) => ({ ...prev, poster_url: url || '' }))}
            />

            <Button type="submit" loading={submitting} fullWidth size="lg">
              💾 Simpan Perubahan
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
