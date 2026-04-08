'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MyEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/events?organizer_id=${user.id}&status=all`)
        .then((res) => res.json())
        .then((data) => setEvents(data.events || []))
        .finally(() => setLoading(false));
    }
  }, [user]);

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
          <div className="grid grid-cols-1 gap-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                href={`/organizer/events/${event.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
