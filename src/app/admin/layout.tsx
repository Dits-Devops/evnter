'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, Calendar, CreditCard, UserRound } from 'lucide-react';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

const ADMIN_NAV = [
  { href: '/admin', label: 'Beranda', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Acara', icon: Calendar },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/payments', label: 'Bayar', icon: CreditCard },
  { href: '/admin/profile', label: 'Akun', icon: UserRound },
];

const isAdminNavActive = (pathname: string, href: string) =>
  href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    else if (!loading && user?.role !== 'admin') router.replace('/');
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-background"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <BackgroundGlow variant="mesh" />

      {/* Main Content Area */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Floating Admin Navigation Dock */}
      <nav aria-label="Navigasi admin" className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md">
        <div className="rounded-3xl bg-card/90 backdrop-blur-2xl border border-border/80 p-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] flex items-center">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex-1 min-w-0 min-h-12 flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active-pill"
                    className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/25"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 mb-1 relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] tracking-tight relative z-10 font-bold">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
