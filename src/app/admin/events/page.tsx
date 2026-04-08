'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Event } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events?status=all')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleStatus(event: Event) {
    const newStatus = event.status === 'published' ? 'ended' : 'published';
    await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: newStatus as Event['status'] } : e));
  }

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    ended: 'bg-gray-100 text-gray-500',
  };

  return (
    <div>
      <Header title="🎪 Kelola Events" />
      <div className="px-4 py-4">
        {loading ? <LoadingSpinner /> : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">{events.length} event</p>
            {events.map(event => (
              <Card key={event.id}>
                <h3 className="font-bold text-gray-800 mb-1">{event.title}</h3>
                <p className="text-xs text-gray-500 mb-2">📅 {formatDate(event.date)}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => toggleStatus(event)}>
                    {event.status === 'published' ? 'Akhiri' : 'Publikasikan'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
