'use client';

import { useState, useEffect, useRef } from 'react';
import HomeView from '@/components/views/HomeView';
import EventsView from '@/components/views/EventsView';
import TicketsView from '@/components/views/TicketsView';
import NotificationsView from '@/components/views/NotificationsView';
import ProfileView from '@/components/views/ProfileView';
import ScannerView from '@/components/views/ScannerView';
import CreateEventView from '@/components/views/CreateEventView';
import UpgradeView from '@/components/views/UpgradeView';
import AdminView from '@/components/views/AdminView';

export default function AppShell() {
  const [hash, setHash] = useState<string>('#home');
  // Track which views have been mounted at least once (never unmount after)
  const mounted = useRef<Set<string>>(new Set(['#home']));

  useEffect(() => {
    const syncHash = () => {
      const current = window.location.hash || '#home';
      mounted.current.add(current);
      setHash(current);
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, []);

  const navigate = (newHash: string) => {
    window.location.hash = newHash;
    mounted.current.add(newHash);
    setHash(newHash);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const show = (h: string) => ({ display: hash === h ? 'block' : 'none' });

  // Render all views with Keep-Alive pattern (instant tab switching)
  return (
    <main className="relative min-h-screen bg-background">
      <div style={show('#home')}>
        <HomeView onNavigate={navigate} />
      </div>
      <div style={show('#events')}>
        {mounted.current.has('#events') && <EventsView />}
      </div>
      <div style={show('#tickets')}>
        {mounted.current.has('#tickets') && <TicketsView onNavigate={navigate} />}
      </div>
      <div style={show('#notifications')}>
        {mounted.current.has('#notifications') && <NotificationsView />}
      </div>
      <div style={show('#profile')}>
        {mounted.current.has('#profile') && <ProfileView onNavigate={navigate} />}
      </div>
      <div style={show('#scanner')}>
        {mounted.current.has('#scanner') && <ScannerView />}
      </div>
      <div style={show('#create-event')}>
        {mounted.current.has('#create-event') && <CreateEventView />}
      </div>
      <div style={show('#upgrade')}>
        {mounted.current.has('#upgrade') && <UpgradeView />}
      </div>
      <div style={show('#admin')}>
        {mounted.current.has('#admin') && <AdminView />}
      </div>
    </main>
  );
}

