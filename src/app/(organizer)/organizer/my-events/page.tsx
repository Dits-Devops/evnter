'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import { formatDate } from '@/utils/helpers';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { MyEventsListSkeleton } from '@/components/Skeleton';
import { CalendarDays, Trash2, Plus, AlertTriangle, Image as ImageIcon } from 'lucide-react';

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
    const res = await fetch(`/api/events?organizer_id=${user.id}&status=all&t=${Date.now()}`);
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleUnpublish(eventId: string) {
    setProcessing(eventId);
    // Optimistic update
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'draft' } : e));
    
    await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    });
    setProcessing(null);
  }

  async function handlePublish(eventId: string) {
    setProcessing(eventId);
    // Optimistic update
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'published' } : e));

    await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    setProcessing(null);
  }

  async function handleDelete(eventId: string) {
    setProcessing(eventId);
    // Optimistic update
    setEvents(prev => prev.filter(e => e.id !== eventId));
    
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    setConfirmDelete(null);
    setProcessing(null);
  }

  return (
    <div className="min-h-screen bg-background pb-28 animate-in-slide-up">
      {/* Header Area */}
      <div className="bg-primary px-5 pt-14 pb-16 rounded-b-[2.5rem] relative overflow-hidden shadow-soft">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] mix-blend-overlay"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Acara Saya</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">Kelola semua event yang Anda buat</p>
          </div>
          <Link href="/organizer/create-event">
            <Button size="icon" className="bg-white text-primary hover:bg-white/90 active:scale-95 transition-transform">
              <Plus className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-20">
        {loading ? (
          <MyEventsListSkeleton count={2} />
        ) : events.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-2 border-border bg-card/80 backdrop-blur-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <CalendarDays className="w-10 h-10 text-primary opacity-50" />
            </div>
            <p className="text-xl font-bold text-foreground">Belum ada event</p>
            <p className="text-sm mt-1 mb-8 text-muted-foreground">Buat event pertama Anda sekarang!</p>
            <Link href="/organizer/create-event">
              <Button fullWidth><Plus className="w-5 h-5" /> Buat Event Baru</Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => {
              const isPublished = event.status === 'published';
              return (
                <Card key={event.id} padding={false} className="overflow-hidden group flex">
                  {/* Small Square Poster */}
                  <div className="w-24 h-24 shrink-0 relative overflow-hidden">
                    {event.poster_url ? (
                      <Image
                        src={event.poster_url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-primary/20 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-1 left-1">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isPublished ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'}`}>
                        {isPublished ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
 
                  {/* Compacter Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div className="mb-1">
                      <h3 className="font-bold text-foreground text-sm line-clamp-1 leading-tight mb-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                        <CalendarDays className="w-3 h-3 text-primary" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    </div>
                    
                    {/* Compact Actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => router.push(`/organizer/events/${event.id}`)}
                        className="flex-1 bg-primary text-white text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition-all"
                      >
                        Kelola
                      </button>
                      
                      {isPublished ? (
                        <button
                          disabled={processing === event.id}
                          onClick={() => handleUnpublish(event.id)}
                          className="flex-1 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                          {processing === event.id ? '...' : 'Draft'}
                        </button>
                      ) : (
                        <button
                          disabled={processing === event.id}
                          onClick={() => handlePublish(event.id)}
                          className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                          {processing === event.id ? '...' : 'Aktifkan'}
                        </button>
                      )}
                      
                      <button
                        disabled={processing === event.id}
                        onClick={() => setConfirmDelete(event.id)}
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-in fade-in duration-200"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-card rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">Hapus Event?</h3>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Event ini akan dihapus permanen beserta semua data tiket. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(null)} size="lg">
                Batal
              </Button>
              <Button
                variant="danger"
                fullWidth
                size="lg"
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

