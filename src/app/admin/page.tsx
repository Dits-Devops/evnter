'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  checkedInTickets: number;
  organizers: number;
  pendingPayments: number;
  recentUsers: Array<{ id: string; role: string; pro_status: string; created_at: string }>;
  recentEvents: Array<{ id: string; status: string; created_at: string }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header title="📊 Admin Dashboard" />
      <div className="px-4 py-4">
        {loading || !stats ? (
          <LoadingSpinner />
        ) : (
          <>
            {stats.pendingPayments > 0 && (
              <Link href="/admin/payments">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-bold text-orange-800">
                      {stats.pendingPayments} Pembayaran Menunggu
                    </p>
                    <p className="text-xs text-orange-600">Ketuk untuk review</p>
                  </div>
                  <span className="ml-auto text-orange-500">›</span>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-blue-600' },
                { label: 'Organizers', value: stats.organizers, icon: '⭐', color: 'text-orange-600' },
                { label: 'Total Events', value: stats.totalEvents, icon: '🎪', color: 'text-purple-600' },
                { label: 'Total Tiket', value: stats.totalTickets, icon: '🎟️', color: 'text-green-600' },
                { label: 'Check-in', value: stats.checkedInTickets, icon: '✅', color: 'text-teal-600' },
                { label: 'Pending Pro', value: stats.pendingPayments, icon: '⏳', color: 'text-yellow-600' },
              ].map((stat) => (
                <Card key={stat.label} className="text-center">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/admin/users', icon: '👥', label: 'Kelola Users' },
                { href: '/admin/events', icon: '🎪', label: 'Kelola Events' },
                { href: '/admin/payments', icon: '💳', label: 'Pembayaran Pro' },
                { href: '/admin/stats', icon: '📈', label: 'Statistik' },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="text-center py-4 hover:bg-blue-50 transition-colors">
                    <p className="text-3xl mb-2">{item.icon}</p>
                    <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
