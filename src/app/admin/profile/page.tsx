'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { getInitials } from '@/utils/helpers';

export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <div>
      <Header title="Profil Admin" />
      <div className="px-4 py-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3">
            {user ? getInitials(user.name) : 'A'}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
            🔑 Administrator
          </span>
        </div>

        {/* Account Info */}
        <Card className="mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Informasi Akun</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Nama</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">WhatsApp</p>
              <p className="font-medium text-gray-800">{user?.whatsapp || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="font-medium text-gray-800">Administrator</p>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Menu Admin</h3>
          <div className="space-y-2">
            {[
              { href: '/admin', label: 'Dashboard', icon: '📊' },
              { href: '/admin/users', label: 'Kelola Users', icon: '👥' },
              { href: '/admin/events', label: 'Kelola Events', icon: '🎪' },
              { href: '/admin/payments', label: 'Pembayaran Pro', icon: '💳' },
              { href: '/admin/settings', label: 'Pengaturan Pembayaran', icon: '⚙️' },
            ].map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="ml-auto text-gray-400">›</span>
              </button>
            ))}
          </div>
        </Card>

        <Button variant="danger" fullWidth onClick={handleLogout}>
          🚪 Keluar
        </Button>
      </div>
    </div>
  );
}
