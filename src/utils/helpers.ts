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

export function createWhatsAppMessage(ticketCode: string, eventTitle: string, eventDate: string): string {
  const message = `🎟️ Tiket EVNTER saya!\n\nEvent: ${eventTitle}\nTanggal: ${formatDate(eventDate)}\nKode Tiket: ${ticketCode}\n\nDownload EVNTER untuk lihat QR Code tiket.`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
