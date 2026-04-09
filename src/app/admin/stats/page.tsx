'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Activity, Cpu, HardDrive } from 'lucide-react';

interface Stats {
  totalUsers: number; totalEvents: number; totalTickets: number;
  checkedInTickets: number; organizers: number; pendingPayments: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [system, setSystem] = useState<{ cpu: number; ram: number; uptime: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/system').then(r => r.json())
    ]).then(([statsData, sysData]) => {
      if (statsData.stats) setStats(statsData.stats);
      if (sysData.system) setSystem(sysData.system);
    }).finally(() => setLoading(false));
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
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {items.map(item => (
                <Card key={item.label} className="text-center">
                  <p className="text-3xl mb-1">{item.icon}</p>
                  <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                </Card>
              ))}
            </div>

            {system && (
              <>
                <h2 className="text-lg font-bold text-foreground mb-4 px-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> System Telemetry
                </h2>
                <Card className="mb-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-muted-foreground flex items-center"><Cpu className="w-3 h-3 mr-1"/> CPU Load</span>
                        <span className="text-xs font-mono">{system.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${system.cpu > 80 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min(system.cpu, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-muted-foreground flex items-center"><HardDrive className="w-3 h-3 mr-1"/> RAM Usage</span>
                        <span className="text-xs font-mono">{system.ram.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${system.ram > 80 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min(system.ram, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
