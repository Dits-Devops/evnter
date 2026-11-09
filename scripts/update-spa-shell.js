const fs = require('fs');
const path = require('path');

const shellCode = `'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    const syncHash = () => {
      const current = window.location.hash || '#home';
      startTransition(() => {
        setHash(current);
      });
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const navigate = (newHash: string) => {
    window.location.hash = newHash;
    setHash(newHash);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Render active view instantly based on current hash
  const renderView = () => {
    switch (hash) {
      case '#events':
        return <EventsView key="events" />;
      case '#tickets':
        return <TicketsView key="tickets" onNavigate={navigate} />;
      case '#notifications':
        return <NotificationsView key="notifications" />;
      case '#profile':
        return <ProfileView key="profile" onNavigate={navigate} />;
      case '#scanner':
        return <ScannerView key="scanner" />;
      case '#create-event':
        return <CreateEventView key="create-event" />;
      case '#upgrade':
        return <UpgradeView key="upgrade" />;
      case '#admin':
        return <AdminView key="admin" />;
      case '#home':
      default:
        return <HomeView key="home" onNavigate={navigate} />;
    }
  };

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={hash}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="w-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
`;

const dest = path.join(__dirname, '../src/app/(user)/page.tsx');
fs.writeFileSync(dest, shellCode, 'utf8');
console.log('AppShell in page.tsx updated successfully with # hash navigation');
