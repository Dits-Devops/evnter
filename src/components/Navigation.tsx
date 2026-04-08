'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const userNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/events', label: 'Event', icon: '🎪' },
  { href: '/tickets', label: 'Tiket Saya', icon: '🎟️' },
  { href: '/profile', label: 'Profil', icon: '👤' },
];

const organizerNavItems: NavItem[] = [
  { href: '/organizer', label: 'Home', icon: '🏠' },
  { href: '/organizer/my-events', label: 'Acara Saya', icon: '🎪' },
  { href: '/organizer/scanner', label: 'Scan', icon: '📷' },
  { href: '/organizer/profile', label: 'Profil', icon: '👤' },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/events', label: 'Events', icon: '🎪' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  let navItems = userNavItems;
  if (user?.role === 'admin') navItems = adminNavItems;
  else if (user?.role === 'organizer') navItems = organizerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 gap-1 min-h-[56px] transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
