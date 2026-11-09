'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BackgroundGlow } from '@/components/ui/BackgroundGlow';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'organizer' && user.role !== 'admin') {
        router.replace('/upgrade');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <LoadingSpinner size="lg" label="Memuat Organizer Portal..." />
      </div>
    );
  }

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) return null;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative selection:bg-primary/20">
      <BackgroundGlow variant="mesh" />
      <main className="pb-32 relative z-10">{children}</main>
      <Navigation />
    </div>
  );
}
