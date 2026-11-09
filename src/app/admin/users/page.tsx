'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Shield, 
  Award, 
  User as UserIcon, 
  MessageCircle, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface UserData {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: 'user' | 'organizer' | 'admin';
  pro_status: string;
  created_at: string;
}

const defaultUsers: UserData[] = [
  { id: 'usr-1', name: 'Raditya Dits', email: 'dits@evnter.id', whatsapp: '081234567890', role: 'admin', pro_status: 'approved', created_at: '2026-03-01T10:00:00Z' },
  { id: 'usr-2', name: 'Sarah Organizer', email: 'sarah@evnter.id', whatsapp: '089876543210', role: 'organizer', pro_status: 'approved', created_at: '2026-03-05T12:30:00Z' },
  { id: 'usr-3', name: 'Alif Kurniawan', email: 'alif@techfest.id', whatsapp: '085711223344', role: 'organizer', pro_status: 'pending', created_at: '2026-03-12T08:15:00Z' },
  { id: 'usr-4', name: 'Nadia Putri', email: 'nadia@soundfest.com', whatsapp: '087899887766', role: 'organizer', pro_status: 'pending', created_at: '2026-03-14T09:40:00Z' },
  { id: 'usr-5', name: 'Budi Santoso', email: 'budi@gmail.com', whatsapp: '081344556677', role: 'user', pro_status: 'free', created_at: '2026-03-15T14:20:00Z' },
  { id: 'usr-6', name: 'Dewi Lestari', email: 'dewi@outlook.com', whatsapp: '082155667788', role: 'user', pro_status: 'free', created_at: '2026-03-18T16:00:00Z' },
  { id: 'usr-7', name: 'Rian Pratama', email: 'rian@gmail.com', whatsapp: '081299001122', role: 'user', pro_status: 'free', created_at: '2026-03-20T11:10:00Z' },
  { id: 'usr-8', name: 'Maya Anggraini', email: 'maya@creativelab.id', whatsapp: '085612349876', role: 'organizer', pro_status: 'approved', created_at: '2026-03-22T13:45:00Z' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>(defaultUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'organizer' | 'admin'>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      }
    } catch {
      // offline fallback
    }
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  async function updateUser(userId: string, updates: { role?: string; pro_status?: string }) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...(updates as any) } : u))
    );
    showToast('Hak akses pengguna diperbarui');

    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
    } catch {
      // offline fallback
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.whatsapp && u.whatsapp.includes(search));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          icon: Shield,
          color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          avatarGrad: 'from-rose-500 to-amber-500',
        };
      case 'organizer':
        return {
          label: 'Organizer',
          icon: Award,
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          avatarGrad: 'from-amber-500 to-orange-500',
        };
      default:
        return {
          label: 'User',
          icon: UserIcon,
          color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          avatarGrad: 'from-blue-500 to-indigo-500',
        };
    }
  };

  return (
    <div className="px-5 pt-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" /> Manajemen Akun
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none mt-0.5">
              Kelola Pengguna
            </h1>
          </div>
        </div>

        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          {users.length} Akun
        </span>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, email, atau no. WhatsApp..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Role Tabs Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'user', 'organizer', 'admin'] as const).map((r) => {
          const count =
            r === 'all' ? users.length : users.filter((u) => u.role === r).length;
          const isActive = roleFilter === r;
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'all' ? 'Semua' : r} ({count})
            </button>
          );
        })}
      </div>

      {/* User Cards List */}
      {filteredUsers.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-foreground">Tidak ada pengguna ditemukan</p>
          <p className="text-xs text-muted-foreground">Coba kata kunci atau filter lain</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u, idx) => {
            const roleInfo = getRoleBadge(u.role);
            const RoleIcon = roleInfo.icon;
            const cleanWa = u.whatsapp ? u.whatsapp.replace(/[^0-9]/g, '') : '';
            const waUrl = cleanWa
              ? `https://wa.me/${cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa}`
              : null;

            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${roleInfo.avatarGrad} flex items-center justify-center text-white font-black text-base shadow-sm shrink-0`}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-sm text-foreground truncate">
                        {u.name}
                      </h3>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${roleInfo.color}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-0.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>

                    {u.whatsapp && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <MessageCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{u.whatsapp}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges & Quick Action Row */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.pro_status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : u.pro_status === 'pending'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {u.pro_status === 'approved'
                        ? 'PRO Tier'
                        : u.pro_status === 'pending'
                        ? 'Pending Pro'
                        : 'Free Tier'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> Chat
                      </a>
                    )}

                    {u.role !== 'admin' && (
                      <button
                        onClick={() =>
                          updateUser(u.id, {
                            role: u.role === 'organizer' ? 'user' : 'organizer',
                          })
                        }
                        className="px-2.5 py-1 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary text-foreground text-xs font-bold transition-all"
                      >
                        {u.role === 'organizer' ? 'Jadikan User' : 'Jadikan Org'}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        updateUser(u.id, {
                          role: u.role === 'admin' ? 'user' : 'admin',
                        })
                      }
                      className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all"
                    >
                      {u.role === 'admin' ? 'Cabut Admin' : 'Jadikan Admin'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
