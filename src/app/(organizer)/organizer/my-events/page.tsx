'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import { formatDate, formatPrice } from '@/utils/helpers';
import Header from '@/components/Header';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';

export default function MyEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetch(`/api/events?organizer_id=${user.id}&status=all`);
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleUnpublish(eventId: string) {
    setProcessing(eventId);
    await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    });
    await fetchEvents();
    setProcessing(null);
  }

  async function handlePublish(eventId: string) {
    setProcessing(eventId);
    await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    await fetchEvents();
    setProcessing(null);
  }

  async function handleDelete(eventId: string) {
    setProcessing(eventId);
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    setConfirmDelete(null);
    await fetchEvents();
    setProcessing(null);
  }

  return (
    <div>
      <Header
        title="🎪 Acara Saya"
        rightAction={
          <Link href="/organizer/create-event">
            <Button size="sm">+ Buat Event</Button>
          </Link>
        }
      />
      <div className="px-4 py-4">
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-6xl mb-3">🎪</p>
            <p className="text-lg font-semibold">Belum ada event</p>
            <p className="text-sm mt-1 mb-6">Buat event pertama Anda sekarang!</p>
            <Link href="/organizer/create-event">
              <Button>+ Buat Event Baru</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => {
              const isFree = !event.price || event.price === 0;
              const isPublished = event.status === 'published';
              return (
                <Card key={event.id} padding={false} className="overflow-hidden">
                  {/* Poster */}
                  {event.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.poster_url}
                      alt={event.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-5xl">🎪</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-base flex-1">{event.title}</h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {isFree ? 'Gratis' : formatPrice(event.price)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isPublished ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {isPublished ? 'Aktif' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 font-medium mb-1">📅 {formatDate(event.date)}</p>
                    <p className="text-sm text-gray-500 mb-3">📍 {event.location}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => router.push(`/organizer/events/${event.id}`)}
                        className="flex-1 min-w-0 text-sm font-semibold bg-blue-50 text-blue-700 rounded-xl py-2 px-3 text-center"
                      >
                        📋 Kelola
                      </button>
                      {isPublished ? (
                        <button
                          onClick={() => handleUnpublish(event.id)}
                          disabled={processing === event.id}
                          className="flex-1 min-w-0 text-sm font-semibold bg-yellow-50 text-yellow-700 rounded-xl py-2 px-3 text-center disabled:opacity-50"
                        >
                          {processing === event.id ? '...' : '⏸ Nonaktifkan'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublish(event.id)}
                          disabled={processing === event.id}
                          className="flex-1 min-w-0 text-sm font-semibold bg-green-50 text-green-700 rounded-xl py-2 px-3 text-center disabled:opacity-50"
                        >
                          {processing === event.id ? '...' : '▶ Aktifkan'}
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(event.id)}
                        disabled={processing === event.id}
                        className="text-sm font-semibold bg-red-50 text-red-600 rounded-xl py-2 px-3 disabled:opacity-50"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-4xl text-center mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Hapus Event?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Event ini akan dihapus permanen beserta semua data tiket. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={processing === confirmDelete}
                onClick={() => handleDelete(confirmDelete)}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

