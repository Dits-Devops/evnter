'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Home, Ticket, User, Calendar, PlusCircle, ScanLine, LayoutDashboard, Users, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getProfileImageUrl } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import { motion } from 'motion/react';

interface NavItem {
  hash: string;
  href: string;
  label: string;
  icon: React.ElementType;
}

const userNavItems: NavItem[] = [
  { hash: '#home', href: '/#home', label: 'Beranda', icon: Home },
  { hash: '#events', href: '/#events', label: 'Event', icon: Calendar },
  { hash: '#tickets', href: '/#tickets', label: 'Tiket', icon: Ticket },
  { hash: '#notifications', href: '/#notifications', label: 'Notifikasi', icon: Bell },
  { hash: '#profile', href: '/#profile', label: 'Profil', icon: User },
];

const organizerNavItems: NavItem[] = [
  { hash: '#events', href: '/organizer/my-events', label: 'Acara', icon: Calendar },
  { hash: '#create-event', href: '/organizer/create-event', label: 'Buat', icon: PlusCircle },
  { hash: '#scanner', href: '/organizer/scanner', label: 'Scan', icon: ScanLine },
  { hash: '#notifications', href: '/#notifications', label: 'Notifikasi', icon: Bell },
  { hash: '#profile', href: '/organizer/profile', label: 'Profil', icon: User },
];

const adminNavItems: NavItem[] = [
  { hash: '#admin', href: '/#admin', label: 'Panel', icon: LayoutDashboard },
  { hash: '#events', href: '/#events', label: 'Events', icon: Calendar },
  { hash: '#users', href: '/admin/users', label: 'Users', icon: Users },
  { hash: '#notifications', href: '/#notifications', label: 'Notifikasi', icon: Bell },
  { hash: '#profile', href: '/#profile', label: 'Profil', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [currentHash, setCurrentHash] = useState('');
  const [hasUnread, setHasUnread] = useState(false);

  // Sync hash state with window.location.hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateHash = () => {
        const h = window.location.hash || '#home';
        setCurrentHash(h);
      };
      updateHash();
      window.addEventListener('hashchange', updateHash);
      return () => window.removeEventListener('hashchange', updateHash);
    }
  }, []);

  // Prefetch main routes in background for instant responsiveness
  useEffect(() => {
    try {
      router.prefetch('/');
      if (user?.role === 'organizer') {
        router.prefetch('/organizer/my-events');
        router.prefetch('/organizer/create-event');
        router.prefetch('/organizer/scanner');
        router.prefetch('/organizer/profile');
      }
    } catch {}
  }, [router, user]);

  useEffect(() => {
    if (user) {
      // Load notification badge without blocking UI
      fetch(`/api/notifications`)
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setHasUnread(data.notifications.some((n: { is_read: boolean }) => !n.is_read));
          }
        })
        .catch(() => {});

      // Skip realtime channel if Supabase is in mock mode
      const channel = supabase.channel
        ? supabase
            .channel(`notifications_sync_${user.id}`)
            .on(
              'postgres_changes' as any,
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
              },
              () => setHasUnread(true)
            )
            .subscribe()
        : null;

      return () => {
        if (channel) {
          try { supabase.removeChannel?.(channel); } catch {}
        }
      };
    }
  }, [user]);

  let navItems = userNavItems;
  if (user?.role === 'admin') navItems = adminNavItems;
  else if (user?.role === 'organizer') navItems = organizerNavItems;

  // Sembunyikan bottom dock di halaman detail event/tiket agar tidak menumpuk dengan checkout button
  if (
    (pathname.startsWith('/events/') && pathname !== '/events') ||
    (pathname.startsWith('/tickets/') && pathname !== '/tickets' && !pathname.endsWith('/success'))
  ) {
    return null;
  }

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    // Immediate 0ms tactile feedback
    setCurrentHash(item.hash);

    if (item.href.startsWith('/#')) {
      if (pathname === '/') {
        window.location.hash = item.hash;
        window.dispatchEvent(new Event('hashchange'));
      } else {
        router.push(item.href);
      }
    } else {
      router.push(item.href);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom max-w-md mx-auto px-3 pb-3 pointer-events-none">
      <div className="pointer-events-auto bg-card/85 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] rounded-[26px] p-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          // Check active by hash if on '/', or by pathname otherwise
          const isActive = pathname === '/'
            ? (currentHash === item.hash || (currentHash === '#home' && item.hash === '#home') || (!currentHash && item.hash === '#home'))
            : (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));

          const Icon = item.icon;
          const isProfileItem = item.hash === '#profile';
          const isNotification = item.hash === '#notifications';
          const profileImageUrl = getProfileImageUrl(user);
          
          return (
            <button
              key={item.hash}
              onClick={(e) => handleNavClick(e, item)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 select-none group cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavCapsule"
                  className="absolute inset-0 bg-primary/10 rounded-[20px] -z-10"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32,
                  }}
                />
              )}

              <motion.div
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="relative flex items-center justify-center"
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-primary stroke-[2.5]' : 'text-muted-foreground group-hover:text-foreground stroke-[1.8]'}`} />
                  {isNotification && hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse shadow-sm" />
                  )}
                </div>
              </motion.div>

              <span className={`text-[10px] mt-1 transition-all duration-200 tracking-tight ${
                isActive ? 'font-black text-primary scale-105' : 'font-semibold text-muted-foreground group-hover:text-foreground'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.span
                  layoutId="activeDot"
                  className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
