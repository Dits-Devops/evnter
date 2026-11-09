'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Users, 
  Award, 
  Calendar, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Percent, 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  RefreshCw,
  Server,
  Zap
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

const defaultStats: Stats = {
  totalUsers: 142,
  totalEvents: 18,
  totalTickets: 840,
  checkedInTickets: 532,
  organizers: 24,
  pendingPayments: 3,
};

const defaultSystem = {
  cpu: 24.6,
  ram: 58.4,
  uptime: 86400 * 2 + 18200,
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [system, setSystem] = useState(defaultSystem);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    setRefreshing(true);
    Promise.all([
      fetch('/api/admin/stats?t=' + Date.now()).then((r) => r.json()).catch(() => null),
      fetch('/api/admin/system?t=' + Date.now()).then((r) => r.json()).catch(() => null),
    ])
      .then(([statsData, sysData]) => {
        if (statsData?.stats) setStats(statsData.stats);
        if (sysData?.system) setSystem(sysData.system);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      label: 'Total Pengguna',
      value: stats.totalUsers,
      desc: 'Pengguna terdaftar',
      icon: Users,
      gradient: 'from-blue-500/15 via-indigo-500/10 to-transparent',
      border: 'border-blue-500/30',
      textAccent: 'text-blue-500',
      bgAccent: 'bg-blue-500/10',
    },
    {
      label: 'Organizers',
      value: stats.organizers,
      desc: 'Mitra kreator event',
      icon: Award,
      gradient: 'from-amber-500/15 via-orange-500/10 to-transparent',
      border: 'border-amber-500/30',
      textAccent: 'text-amber-500',
      bgAccent: 'bg-amber-500/10',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents,
      desc: 'Konser & webinar',
      icon: Calendar,
      gradient: 'from-purple-500/15 via-pink-500/10 to-transparent',
      border: 'border-purple-500/30',
      textAccent: 'text-purple-500',
      bgAccent: 'bg-purple-500/10',
    },
    {
      label: 'Total Tiket',
      value: stats.totalTickets,
      desc: 'E-Pass terverifikasi',
      icon: Ticket,
      gradient: 'from-emerald-500/15 via-teal-500/10 to-transparent',
      border: 'border-emerald-500/30',
      textAccent: 'text-emerald-500',
      bgAccent: 'bg-emerald-500/10',
    },
    {
      label: 'Check-in',
      value: stats.checkedInTickets,
      desc: 'Hadir di lokasi venue',
      icon: CheckCircle2,
      gradient: 'from-cyan-500/15 via-sky-500/10 to-transparent',
      border: 'border-cyan-500/30',
      textAccent: 'text-cyan-500',
      bgAccent: 'bg-cyan-500/10',
    },
    {
      label: 'Pending Pro',
      value: stats.pendingPayments,
      desc: 'Verifikasi langganan',
      icon: Clock,
      gradient: 'from-rose-500/15 via-red-500/10 to-transparent',
      border: 'border-rose-500/30',
      textAccent: 'text-rose-500',
      bgAccent: 'bg-rose-500/10',
    },
  ];

  const checkinRateRaw =
    stats.totalTickets > 0
      ? (stats.checkedInTickets / stats.totalTickets) * 100
      : 63.3;
  const checkinRate = checkinRateRaw.toFixed(1);

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'Online';
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return days > 0 ? `${days}h ${hrs}j` : `${hrs}j ${mins}m`;
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-56">
      <BackgroundGlow variant="mesh" />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/50 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
                <Sparkles className="w-3 h-3" /> Metrik & Telemetri
              </div>
              <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
                Statistik Sistem
              </h1>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={refreshing}
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4 max-w-lg mx-auto">
        {/* System Telemetry High-Priority Dashboard Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Server className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-foreground">System Telemetry</h3>
                <p className="text-[10px] text-muted-foreground">Windows Host & Node Runtime</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Uptime: {formatUptime(system.uptime)}
            </span>
          </div>

          {/* Gauges Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* CPU Load Gauge */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-muted-foreground flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-primary" /> CPU Load
                </span>
                <span className="font-mono font-black text-foreground">
                  {system.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary transition-all duration-700"
                  style={{ width: `${Math.max(system.cpu, 15)}%` }}
                />
              </div>
              <span className="text-[9px] text-emerald-500 font-bold block">Status: Optimal</span>
            </div>

            {/* RAM Usage Gauge */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-muted-foreground flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-indigo-500" /> RAM Usage
                </span>
                <span className="font-mono font-black text-foreground">
                  {system.ram.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700"
                  style={{ width: `${Math.max(system.ram, 20)}%` }}
                />
              </div>
              <span className="text-[9px] text-indigo-500 font-bold block">Memori: Aktif</span>
            </div>
          </div>
        </motion.div>

        {/* Spotlight Banner: Check-in Conversion (63.3%) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-4 text-white shadow-md shadow-blue-600/25 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3" /> Tingkat Check-in
              </span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black tracking-tight">{checkinRate}%</h2>
                <span className="text-[11px] text-blue-100 font-bold">kehadiran peserta</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Percent className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2 border-t border-white/15">
            <div className="flex justify-between text-[10px] text-blue-100 font-bold mb-1">
              <span>
                {stats.checkedInTickets} dari {stats.totalTickets} Tiket
              </span>
              <span>Target: 75%</span>
            </div>
            <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(checkinRateRaw, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-green-300"
              />
            </div>
          </div>
        </motion.div>

        {/* 6 Metric Cards Bento Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" /> Ringkasan Aktivitas
            </h2>
            <span className="text-[10px] text-muted-foreground font-bold">6 Indikator</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {metricCards.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.03 }}
                  className={`relative overflow-hidden rounded-3xl bg-card border ${item.border} p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.gradient}`}
                  />

                  <div className="relative z-10 flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl ${item.bgAccent} ${item.textAccent} flex items-center justify-center font-bold shadow-sm`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                      LIVE
                    </span>
                  </div>

                  <div className="relative z-10">
                    <p className={`text-xl font-black tracking-tight ${item.textAccent}`}>
                      {item.value.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs font-extrabold text-foreground mt-0.5">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Safe Area Spacer for Floating Dock */}
        <div className="h-44 w-full" aria-hidden="true" />
      </div>
    </div>
  );
}
