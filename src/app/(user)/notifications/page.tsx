'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { NotificationsListSkeleton } from '@/components/Skeleton';
import { Bell, Calendar, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/notifications?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const channel = supabase
        .channel(`user_notifications_page_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
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
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await fetch('/api/notifications', { method: 'PUT', body: JSON.stringify({}) });
  };

  return (
    <div className="pb-28 animate-in-fade">
      <Header title="🔔 Notifikasi" />
      
      <div className="px-5 py-4">
        {notifications.length > 0 && notifications.some(n => !n.is_read) && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={markAllRead}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
            >
              Tandai Semua Dibaca
            </button>
          </div>
        )}

        {loading ? (
          <NotificationsListSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[2rem] border border-dashed border-border/60">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <p className="text-muted-foreground font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif: any) => {
              const isRead = notif.is_read;
              return (
                <Card 
                  key={notif.id} 
                  padding={false}
                  className={`overflow-hidden transition-all duration-300 ${!isRead ? 'border-l-4 border-l-primary shadow-md' : 'opacity-80'}`}
                >
                  <div className={`p-4 flex gap-4 ${!isRead ? 'bg-primary/5' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === 'approval_accepted' ? 'bg-green-100 text-green-600' :
                      notif.type === 'approval_rejected' ? 'bg-red-100 text-red-600' :
                      notif.type === 'schedule_change' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {notif.type === 'approval_accepted' ? <CheckCircle2 className="w-5 h-5" /> :
                       notif.type === 'approval_rejected' ? <AlertTriangle className="w-5 h-5" /> :
                       notif.type === 'schedule_change' ? <Calendar className="w-5 h-5" /> :
                       <Info className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed ${!isRead ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                        {formatDate(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
