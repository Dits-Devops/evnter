'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

const PROTECTED_ROUTES = ['/tickets', '/profile', '/notifications', '/upgrade'];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
      if (isProtected) {
        router.replace('/login');
      }
    }
  }, [user, loading, router, pathname]);

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (loading && isProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user && isProtected) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-24">{children}</main>
      <Navigation />
    </div>
  );
}
