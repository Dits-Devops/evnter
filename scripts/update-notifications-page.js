const fs = require('fs');

const code = `'use client';

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

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'tickets'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(\`/api/notifications?t=\${Date.now()}\`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const channel = supabase
        .channel(\`user_notifications_page_\${user.id}\`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: \`user_id=eq.\${user.id}\`,
          },
          () => fetchNotifications()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications', { method: 'PUT', body: JSON.stringify({}) });
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await fetch(\`/api/notifications/\${id}\`, { method: 'PUT', body: JSON.stringify({ is_read: true }) });
    } catch (e) {
      // ignore
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.is_read);
    }
    if (activeTab === 'tickets') {
      return notifications.filter((n) => 
        n.type === 'approval_accepted' || 
        n.type === 'ticket_issued' || 
        n.message.toLowerCase().includes('tiket')
      );
    }
    return notifications;
  }, [notifications, activeTab]);

  return (
    <div className="relative min-h-screen bg-background pb-36">
      <BackgroundGlow variant="subtle" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-5 pt-12 pb-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-primary" />
              Pusat Notifikasi
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">
              Notifikasi
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold active:scale-95 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tandai Dibaca
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/70'
            }\`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 \${
              activeTab === 'unread'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/70'
            }\`}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-black">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              activeTab === 'tickets'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/70'
            }\`}
          >
            Tiket
          </button>
        </div>
      </header>

      {/* Notifications Feed */}
      <div className="px-5 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card/60 animate-pulse rounded-2xl border border-border/60" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4 bg-card/60 backdrop-blur-md rounded-3xl border border-dashed border-border"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-primary/60" />
            </div>
            <h3 className="text-base font-bold text-foreground">Tidak ada notifikasi</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Semua info penting mengenai pembelian tiket, status verifikasi, dan jadwal akan muncul di sini.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif, idx) => {
                const isRead = notif.is_read;
                const isTicket = notif.type === 'approval_accepted' || notif.message.toLowerCase().includes('tiket');

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
                    onClick={() => markSingleRead(notif.id)}
                    className={\`relative p-4 rounded-2xl border transition-all cursor-pointer \${
                      !isRead
                        ? 'bg-card/95 border-primary/40 shadow-sm shadow-primary/10'
                        : 'bg-card/60 border-border/60 opacity-85 hover:opacity-100'
                    }\`}
                  >
                    {!isRead && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-500/20" />
                    )}

                    <div className="flex items-start gap-3.5 pr-4">
                      {/* Icon Bubble */}
                      <div
                        className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \${
                          notif.type === 'approval_accepted'
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : notif.type === 'approval_rejected'
                            ? 'bg-rose-500/15 text-rose-600'
                            : notif.type === 'schedule_change'
                            ? 'bg-amber-500/15 text-amber-600'
                            : 'bg-primary/15 text-primary'
                        }\`}
                      >
                        {notif.type === 'approval_accepted' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : notif.type === 'approval_rejected' ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : notif.type === 'schedule_change' ? (
                          <Calendar className="w-5 h-5" />
                        ) : (
                          <Info className="w-5 h-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={\`text-xs leading-relaxed line-clamp-2 \${
                            !isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
                          }\`}
                        >
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/30">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {formatDate(notif.created_at)}
                          </span>

                          {isTicket && (
                            <Link
                              href="/tickets"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                            >
                              <span>Buka Tiket</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('D:/Projects/Eventer/evnter/src/app/(user)/notifications/page.tsx', code, 'utf8');
console.log('Successfully updated notifications/page.tsx');
