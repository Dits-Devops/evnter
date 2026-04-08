'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusMessage from '@/components/StatusMessage';

interface UserData {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  pro_status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  }

  async function updateUser(userId: string, updates: { role?: string; pro_status?: string }) {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    if (res.ok) {
      setMessage({ type: 'success', text: 'User berhasil diperbarui' });
      fetchUsers();
    } else {
      setMessage({ type: 'error', text: 'Gagal memperbarui user' });
    }
  }

  const roleColors: Record<string, string> = {
    user: 'bg-gray-100 text-gray-600',
    organizer: 'bg-orange-100 text-orange-700',
    admin: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <Header title="👥 Kelola Users" />
      <div className="px-4 py-4">
        {message && (
          <div className="mb-4">
            <StatusMessage type={message.type} message={message.text} />
          </div>
        )}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">{users.length} pengguna terdaftar</p>
            {users.map((u) => (
              <Card key={u.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
                        {u.pro_status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {u.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateUser(u.id, {
                          role: u.role === 'organizer' ? 'user' : 'organizer',
                        })
                      }
                    >
                      {u.role === 'organizer' ? '👤 Jadi User' : '⭐ Jadi Organizer'}
                    </Button>
                  )}
                  {u.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUser(u.id, { role: 'admin' })}
                    >
                      🔑 Jadikan Admin
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
