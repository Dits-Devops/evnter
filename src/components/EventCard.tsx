'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types';
import { formatDate, truncateText, formatPrice } from '@/utils/helpers';
import { CalendarDays, MapPin, Sparkles, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface EventCardProps {
  event: Event;
  href?: string;
  variant?: 'featured' | 'standard';
}

export default function EventCard({ event, href, variant = 'standard' }: EventCardProps) {
  const linkHref = href || `/events/${event.id}`;
  const isFree = !event.price || event.price === 0;
  const isFeatured = variant === 'featured';

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.97 }}
      className="h-full"
    >
      <Link href={linkHref} prefetch={true} className="block group h-full">
        <div className="relative h-full overflow-hidden rounded-[22px] bg-card border border-border/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_-8px_rgba(37,99,235,0.18)] hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
          {/* Subtle hover gradient flare */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

          <div className="relative">
            {event.poster_url ? (
              <div className={`relative w-full overflow-hidden ${isFeatured ? 'h-48' : 'h-36'}`}>
                <Image
                  src={event.poster_url}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
              </div>
            ) : (
              <div className={`w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center ${isFeatured ? 'h-48' : 'h-36'}`}>
                <CalendarDays className="w-10 h-10 text-primary/40" />
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md border ${
                  isFree
                    ? 'bg-emerald-500/90 text-white border-emerald-400/40'
                    : 'bg-card/90 text-primary border-white/60 dark:border-white/20'
                }`}
              >
                {isFree ? (
                  <>
                    <Sparkles className="w-3 h-3" />
                    GRATIS
                  </>
                ) : (
                  formatPrice(event.price)
                )}
              </span>
            </div>

            {/* Quota / Status pill if available */}
            {event.max_peserta && event.max_peserta > 0 && (
              <div className="absolute bottom-2.5 left-2.5 z-20">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                  <Users className="w-3 h-3 text-sky-400" />
                  Kuot: {event.ticket_count ?? 0}/{event.max_peserta}
                </span>
              </div>
            )}
          </div>

          <div className="p-3.5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-foreground text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors leading-snug">
                {event.title}
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-primary font-bold">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="line-clamp-1">{truncateText(event.location, 32)}</span>
                </div>
              </div>
            </div>

            {event.organizer?.name && (
              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-medium truncate max-w-[140px]">Oleh {event.organizer.name}</span>
                <span className="font-bold text-primary group-hover:translate-x-0.5 transition-transform">Detail &rarr;</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
