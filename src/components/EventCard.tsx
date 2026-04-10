'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types';
import { formatDate, truncateText, formatPrice } from '@/utils/helpers';
import Card from './Card';
import { CalendarDays, MapPin } from 'lucide-react';

interface EventCardProps {
  event: Event;
  href?: string;
}

export default function EventCard({ event, href }: EventCardProps) {
  const linkHref = href || `/events/${event.id}`;
  const isFree = !event.price || event.price === 0;

  return (
    <Link href={linkHref} className="block group">
      <Card padding={false} className="overflow-hidden transition-all duration-300 rounded-2xl border-none shadow-sm hover:shadow-md">
        <div className="relative">
          {event.poster_url ? (
            <div className="relative w-full h-36 overflow-hidden">
              <Image
                src={event.poster_url}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full h-36 bg-gradient-to-br from-indigo-100 via-primary/10 to-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <CalendarDays className="w-10 h-10 text-primary/30" />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-sm">
            <span className={`text-[10px] font-black uppercase tracking-tight ${isFree ? 'text-green-600' : 'text-primary'}`}>
              {isFree ? 'Gratis' : formatPrice(event.price)}
            </span>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-bold text-foreground text-sm mb-1.5 line-clamp-1 group-hover:text-primary transition-colors leading-tight">{event.title}</h3>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] text-primary font-bold">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{truncateText(event.location, 35)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
