import { AuthUser } from '@/types';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatPrice(price?: number): string {
  if (!price || price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function createWhatsAppMessage(ticketCode: string, eventTitle: string, eventDate: string): string {
  const message = `🎟️ Tiket EVNTER saya!\n\nEvent: ${eventTitle}\nTanggal: ${formatDate(eventDate)}\nKode Tiket: ${ticketCode}\n\nDownload EVNTER untuk lihat QR Code tiket.`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppUpgradeMessage(userName: string, userEmail: string): string {
  const message = `Halo Admin EVNTER, saya ingin konfirmasi pembayaran upgrade Organizer Pro.\n\nNama saya: ${userName}\nEmail: ${userEmail}\n\nBerikut bukti transfer saya.`;
  return `https://wa.me/6285882846665?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a stable profile image URL with cache-busting timestamp
 */
export function getProfileImageUrl(user: AuthUser | null): string | null {
  if (!user || !user.profile_image) return null;
  
  // Use updated_at as timestamp, fallback to a 10s window stable timestamp if missing
  const timestamp = user.updated_at 
    ? new Date(user.updated_at).getTime() 
    : Math.floor(Date.now() / 10000) * 10000;
    
  return `${user.profile_image}?t=${timestamp}`;
}
