'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'organizer' && user.role !== 'admin') {
        router.replace('/organizer/upgrade');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <Navigation />
    </div>
  );
}
