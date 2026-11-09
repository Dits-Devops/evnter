'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, 
  Calendar, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Ticket as TicketIcon,
  Sparkles,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import { cachedFetch, invalidateCache } from '@/lib/cache';
import { mockNotifications } from '@/lib/mockData';

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsView() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'tickets'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications(mockNotifications);
      setLoading(false);
      return;
    }
    try {
      const data = await cachedFetch<{ notifications: Notification[] }>('/api/notifications');
      setNotifications(data.notifications && data.notifications.length > 0 ? data.notifications : mockNotifications);
    } catch (e) {
      console.error(e);
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      // Skip realtime channel if Supabase is in mock mode
      const channel = supabase.channel
        ? supabase
            .channel(`user_notifications_page_${user.id}`)
            .on(
              'postgres_changes' as any,
              {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
              },
              () => fetchNotifications()
            )
            .subscribe()
        : null;

      return () => {
        if (channel) {
          try { supabase.removeChannel?.(channel); } catch {}
        }
      };
    }
  }, [user, fetchNotifications]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    invalidateCache('/api/notifications');
    try {
      await fetch('/api/notifications', { method: 'PUT', body: JSON.stringify({}) });
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    invalidateCache('/api/notifications');
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return !n.is_read;
      if (activeTab === 'tickets') return n.type === 'ticket' || n.type === 'success';
      return true;
    });
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket':
      case 'success':
        return <TicketIcon className="w-4 h-4 text-emerald-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-44">
      <BackgroundGlow variant="spotlight" />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" /> Update Terkini
            </span>
            <h1 className="text-xl font-black tracking-tight">Pemberitahuan</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* Tab Filter */}
        <div className="flex gap-2">
          {(['all', 'unread', 'tickets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-primary/50 bg-primary/10 text-primary font-bold'
                  : 'border-border/60 text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {tab === 'all' && `Semua (${notifications.length})`}
              {tab === 'unread' && `Belum Dibaca (${unreadCount})`}
              {tab === 'tickets' && 'Tiket & Event'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">Kotak Masuk Bersih</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Tidak ada notifikasi baru untuk kategori ini. Kami akan mengabari saat tiketmu terbit atau ada event seru!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => (
              <motion.div
                key={n.id}
                onClick={() => markSingleRead(n.id)}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-start ${
                  n.is_read
                    ? 'bg-card/40 border-border/40 opacity-75'
                    : 'bg-card border-primary/20 shadow-sm shadow-primary/5 ring-1 ring-primary/10'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-muted/80 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-xs leading-snug ${n.is_read ? 'text-foreground' : 'font-bold text-foreground'}`}>
                      {n.message}
                    </p>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(n.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Safe area spacer for floating dock */}
        <div className="h-20" />
      </div>
    </div>
  );
}
