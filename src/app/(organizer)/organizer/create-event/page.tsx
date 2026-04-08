'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import StatusMessage from '@/components/StatusMessage';
import Card from '@/components/Card';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    poster_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
      body: JSON.stringify(form),
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
              onChange={handleChange}
              placeholder="Contoh: Workshop Web Development"
              required
            />
            <Input
              label="Tanggal & Waktu"
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              required
            />
            <Input
              label="Lokasi"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Contoh: Gedung A, Jakarta"
              required
            />
            <Textarea
              label="Deskripsi"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ceritakan tentang event Anda..."
              rows={4}
            />
            <Input
              label="URL Poster (opsional)"
              name="poster_url"
              type="url"
              value={form.poster_url}
              onChange={handleChange}
              placeholder="https://example.com/poster.jpg"
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
