'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import EventCard from '@/components/EventCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const { user } = useAuth();
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
    fetchEvents();
  }, [fetchEvents]);

  const upcomingEvents = events.slice(0, 3);
  const allEvents = events;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-4 pt-12 pb-8">
        <p className="text-blue-100 text-sm mb-1">Selamat datang 👋</p>
        <h1 className="text-2xl font-black text-white mb-1">
          Halo, {user?.name?.split(' ')[0] || 'Pengguna'}!
        </h1>
        <p className="text-blue-100 text-sm">Temukan event seru hari ini</p>

        {/* Search */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Cari event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-2xl bg-white text-gray-800 text-base focus:outline-none min-h-[48px]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4">
        {/* Upgrade Banner for free users */}
        {user?.pro_status === 'free' && user?.role === 'user' && (
          <Link href="/organizer/upgrade">
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <p className="font-bold text-white text-sm">Jadilah Organizer Pro!</p>
                <p className="text-orange-100 text-xs">Buat dan kelola event Anda sendiri</p>
              </div>
              <span className="text-white ml-auto text-lg">›</span>
            </div>
          </Link>
        )}

        {/* Upcoming Events */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">🔥 Event Mendatang</h2>
            <Link href="/events" className="text-sm text-blue-600 font-semibold">
              Lihat Semua
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">🎪</p>
              <p>Belum ada event</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="min-w-[260px]">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Events */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">🎪 Semua Event</h2>
          {loading ? (
            <LoadingSpinner />
          ) : allEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">😕</p>
              <p>Tidak ada event yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {allEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
