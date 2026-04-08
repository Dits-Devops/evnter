'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Stats {
  totalUsers: number; totalEvents: number; totalTickets: number;
  checkedInTickets: number; organizers: number; pendingPayments: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d.stats)).finally(() => setLoading(false));
  }, []);

  const items = stats ? [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: '👥', color: 'text-blue-600' },
    { label: 'Organizers', value: stats.organizers, icon: '⭐', color: 'text-orange-600' },
    { label: 'Total Events', value: stats.totalEvents, icon: '🎪', color: 'text-purple-600' },
    { label: 'Total Tiket', value: stats.totalTickets, icon: '🎟️', color: 'text-green-600' },
    { label: 'Check-in', value: stats.checkedInTickets, icon: '✅', color: 'text-teal-600' },
    { label: 'Pending Pro', value: stats.pendingPayments, icon: '⏳', color: 'text-yellow-600' },
    { label: 'Tingkat Check-in', value: stats.totalTickets > 0 ? `${Math.round((stats.checkedInTickets/stats.totalTickets)*100)}%` : '0%', icon: '📊', color: 'text-indigo-600' },
  ] : [];

  return (
    <div>
      <Header title="📈 Statistik" />
      <div className="px-4 py-4">
        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => (
              <Card key={item.label} className="text-center">
                <p className="text-3xl mb-1">{item.icon}</p>
                <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
