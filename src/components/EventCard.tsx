'use client';
import Link from 'next/link';
import { Event } from '@/types';
import { formatDate, truncateText } from '@/utils/helpers';
import Card from './Card';

interface EventCardProps {
  event: Event;
  href?: string;
}

export default function EventCard({ event, href }: EventCardProps) {
  const linkHref = href || `/events/${event.id}`;
  return (
    <Link href={linkHref}>
      <Card padding={false} className="overflow-hidden">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-5xl">🎪</span>
          </div>
        )}
        <div className="p-3">
          <h3 className="font-bold text-gray-800 text-base mb-1">{event.title}</h3>
          <p className="text-sm text-blue-600 font-medium mb-1">📅 {formatDate(event.date)}</p>
          <p className="text-sm text-gray-500">📍 {truncateText(event.location, 40)}</p>
          {event.ticket_count !== undefined && (
            <p className="text-xs text-gray-400 mt-2">{event.ticket_count} peserta terdaftar</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
