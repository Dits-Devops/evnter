'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  Ticket, 
  CheckSquare, 
  CreditCard, 
  ShieldAlert, 
  BarChart3, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Activity,
  Settings,
  Bell,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  checkedInTickets: number;
  organizers: number;
  pendingPayments: number;
}

const DEFAULT_STATS: Stats = {
  totalUsers: 142,
  totalEvents: 18,
  totalTickets: 840,
  checkedInTickets: 532,
  organizers: 24,
  pendingPayments: 3,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = () => {
    setRefreshing(true);
    fetch('/api/admin/stats?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((e) => console.error(e))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-44">
      <BackgroundGlow variant="mesh" />

      {/* Header Area */}
      <div className="relative px-5 pt-12 pb-6 border-b border-border/50 bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3" />
              Sistem Master Admin
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Admin Console</h1>
            <p className="text-xs text-muted-foreground">Monitoring ekosistem tiket & komunitas EVNTER</p>
          </div>

          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm active:scale-95 transition-transform"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-5 space-y-5">
        {/* Urgent Review Banner if any pending payments */}
        {stats.pendingPayments > 0 && (
          <Link href="/admin/payments" className="block active:scale-98 transition-transform">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 flex items-center gap-3.5 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <ShieldAlert className="text-white w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 block">
                  Tindakan Diperlukan
                </span>
                <p className="font-black text-sm text-white">
                  {stats.pendingPayments} Pembayaran Organizer Baru
                </p>
              </div>
              <ChevronRight className="text-white w-5 h-5 shrink-0" />
            </motion.div>
          </Link>
        )}

        {/* Bento Grid Stats */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
            Metrik Keseluruhan:
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border/80 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Users</span>
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.totalUsers}</p>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {stats.organizers} Organizer
              </span>
            </div>

            <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border/80 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Events</span>
                <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.totalEvents}</p>
              <span className="text-[10px] font-semibold text-purple-500">
                Aktif & Terpublikasi
              </span>
            </div>

            <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border/80 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Tiket Terbit</span>
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Ticket className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.totalTickets}</p>
              <span className="text-[10px] font-semibold text-emerald-500">
                E-Pass Registered
              </span>
            </div>

            <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border/80 p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Check-in</span>
                <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.checkedInTickets}</p>
              <span className="text-[10px] font-semibold text-cyan-500">
                Hadir di Venue
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Shortcuts Grid */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
            Akses Modul Pengelolaan:
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: '/admin/stats', icon: BarChart3, label: 'Telemetri & Stats', desc: 'CPU, RAM & Grafik', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
              { href: '/admin/users', icon: Users, label: 'Data Pengguna', desc: 'Akses & peran akun', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { href: '/admin/events', icon: Calendar, label: 'Katalog Event', desc: 'Moderasi & kurasi', color: 'text-pink-500', bg: 'bg-pink-500/10' },
              { href: '/admin/payments', icon: CreditCard, label: 'Validasi Pro', desc: 'Konfirmasi transfer', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { href: '/admin/broadcasts', icon: Bell, label: 'Pengumuman', desc: 'Broadcast notifikasi', color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { href: '/admin/settings', icon: Settings, label: 'Pengaturan Sistem', desc: 'Rekening & QRIS', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={i} href={item.href} className="block active:scale-98 transition-transform">
                  <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/80 p-3.5 hover:bg-muted/50 transition-colors flex flex-col justify-between h-full shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className={'w-8 h-8 rounded-xl flex items-center justify-center ' + item.bg + ' ' + item.color}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.label}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
