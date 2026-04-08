'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';
import ImageUpload from '@/components/ImageUpload';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    price: '',
    poster_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: form.price ? parseInt(form.price) : 0,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/organizer/events/${data.event.id}`);
    } else {
      setError(data.error || 'Gagal membuat event');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Header title="✨ Buat Event" showBack />
      <div className="px-4 py-4">
        <Card>
          {error && (
            <div className="mb-4">
              <StatusMessage type="error" message={error} />
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nama Event"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Contoh: Workshop Web Development"
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
              placeholder="Contoh: Gedung A, Jakarta"
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
                placeholder="0"
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

            <Textarea
              label="Deskripsi"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ceritakan tentang event Anda..."
              rows={4}
            />

            {/* Poster Upload */}
            <ImageUpload
              label="Poster Event (opsional)"
              placeholder="Seret poster event ke sini atau klik untuk memilih"
              value={form.poster_url || null}
              onChange={(url) => setForm((prev) => ({ ...prev, poster_url: url || '' }))}
            />

            <Button type="submit" loading={submitting} fullWidth size="lg">
              🚀 Publikasikan Event
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
