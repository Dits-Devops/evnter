'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Home, Ticket, User, Calendar, PlusCircle, ScanLine, LayoutDashboard, Users, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getProfileImageUrl } from '@/utils/helpers';
import Avatar from '@/components/Avatar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const userNavItems: NavItem[] = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/events', label: 'Event', icon: Calendar },
  { href: '/tickets', label: 'Tiket', icon: Ticket },
  { href: '/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/profile', label: 'Profil', icon: User },
];

const organizerNavItems: NavItem[] = [
  { href: '/organizer/my-events', label: 'Event', icon: Calendar },
  { href: '/organizer/create-event', label: 'Buat', icon: PlusCircle },
  { href: '/organizer/scanner', label: 'Scan', icon: ScanLine },
  { href: '/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/organizer/profile', label: 'Profil', icon: User },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/admin/profile', label: 'Profil', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (user) {
      // Initial fetch
      fetch(`/api/notifications?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setHasUnread(data.notifications.some((n: { is_read: boolean }) => !n.is_read));
          }
        });

      // Realtime subscription
      const channel = supabase
        .channel(`notifications_sync_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            setHasUnread(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]); // Only dependent on user, not pathname anymore for the subscription logic

  let navItems = userNavItems;
  if (user?.role === 'admin') navItems = adminNavItems;
  else if (user?.role === 'organizer') navItems = organizerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect safe-area-bottom max-w-md mx-auto rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-center px-2 py-3 h-[72px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href.length > 1);
          const Icon = item.icon;
          const isProfileItem = item.href.includes('/profile');
          const isNotification = item.href === '/notifications';
          const profileImageUrl = getProfileImageUrl(user);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isProfileItem ? (
                <Avatar 
                  src={profileImageUrl} 
                  name={user?.name} 
                  size="sm" 
                  className={isActive ? 'border-2 border-primary' : 'border-2 border-transparent'} 
                />
              ) : (
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {isNotification && hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                  )}
                </div>
              )}
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'} whitespace-nowrap`}>{item.label}</span>
              {isActive && !isProfileItem && !isNotification && (
                <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
