'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, Calendar, Ticket, CheckSquare, CreditCard, ShieldAlert, BarChart3, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-background pb-28">
      {/* Header Area */}
      <div className="bg-primary px-5 pt-14 pb-16 rounded-b-[2.5rem] relative overflow-hidden shadow-soft">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] mix-blend-overlay"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Panel</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">Sistem Manajemen Eventer</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-20">
        {loading || !stats ? (
          <div className="py-10 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <>
            {stats.pendingPayments > 0 && (
              <Link href="/admin/payments" className="block active:scale-95 transition-transform">
                <div className="bg-orange-500 rounded-[1.5rem] p-5 mb-6 flex items-center gap-4 shadow-soft">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <ShieldAlert className="text-white w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-white">
                      {stats.pendingPayments} Review Pembayaran
                    </p>
                    <p className="text-xs text-orange-100 mt-0.5">Ketuk untuk validasi sekarang</p>
                  </div>
                  <ChevronRight className="text-white w-6 h-6" />
                </div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="text-center p-5 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">{stats.totalUsers}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Users</p>
              </Card>

              <Card className="text-center p-5 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-black text-purple-600 tracking-tighter">{stats.totalEvents}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Events</p>
              </Card>

              <Card className="text-center p-5 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                  <Ticket className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-black text-green-600 tracking-tighter">{stats.totalTickets}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Tickets</p>
              </Card>

              <Card className="text-center p-5 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                  <CheckSquare className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-black text-orange-600 tracking-tighter">{stats.checkedInTickets}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Check-in</p>
              </Card>
            </div>

            <h2 className="text-lg font-bold text-foreground mb-4 px-1">Menu Cepat</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { href: '/admin/users', icon: Users, label: 'Kelola Users', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { href: '/admin/events', icon: Calendar, label: 'Kelola Events', color: 'text-pink-600', bg: 'bg-pink-50' },
                { href: '/admin/payments', icon: CreditCard, label: 'Pembayaran Pro', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { href: '/admin/stats', icon: BarChart3, label: 'Statistik', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                { href: '/admin/broadcasts', icon: ShieldAlert, label: 'Pengumuman', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="block group">
                    <Card padding={false} className={`p-4 flex items-center gap-3 active:scale-95 transition-transform ${item.bg} border-transparent`}>
                      <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs font-bold leading-tight ${item.color}`}>{item.label}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
