'use client';
import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types';
import EventCard from '@/components/EventCard';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'published' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/events?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(), 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  return (
    <div>
      <Header title="🎪 Semua Event" />
      <div className="px-4 py-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cari event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-2xl border border-gray-200 bg-white text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[48px]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🎪</p>
            <p className="text-lg font-semibold">Tidak ada event</p>
            <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
