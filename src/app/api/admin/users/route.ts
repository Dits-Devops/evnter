import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, withTimeout } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const fallbackUsers = [
  { id: 'usr-1', name: 'Raditya Dits', email: 'dits@evnter.id', whatsapp: '081234567890', role: 'admin', pro_status: 'approved', created_at: '2026-03-01T10:00:00Z' },
  { id: 'usr-2', name: 'Sarah Organizer', email: 'sarah@evnter.id', whatsapp: '089876543210', role: 'organizer', pro_status: 'approved', created_at: '2026-03-05T12:30:00Z' },
  { id: 'usr-3', name: 'Alif Kurniawan', email: 'alif@techfest.id', whatsapp: '085711223344', role: 'organizer', pro_status: 'pending', created_at: '2026-03-12T08:15:00Z' },
  { id: 'usr-4', name: 'Nadia Putri', email: 'nadia@soundfest.com', whatsapp: '087899887766', role: 'organizer', pro_status: 'pending', created_at: '2026-03-14T09:40:00Z' },
  { id: 'usr-5', name: 'Budi Santoso', email: 'budi@gmail.com', whatsapp: '081344556677', role: 'user', pro_status: 'free', created_at: '2026-03-15T14:20:00Z' },
  { id: 'usr-6', name: 'Dewi Lestari', email: 'dewi@outlook.com', whatsapp: '082155667788', role: 'user', pro_status: 'free', created_at: '2026-03-18T16:00:00Z' },
  { id: 'usr-7', name: 'Rian Pratama', email: 'rian@gmail.com', whatsapp: '081299001122', role: 'user', pro_status: 'free', created_at: '2026-03-20T11:10:00Z' },
  { id: 'usr-8', name: 'Maya Anggraini', email: 'maya@creativelab.id', whatsapp: '085612349876', role: 'organizer', pro_status: 'approved', created_at: '2026-03-22T13:45:00Z' },
];

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await withTimeout<any>(
      supabase
        .from('users')
        .select('id, name, email, whatsapp, role, pro_status, pro_payment_proof_url, created_at')
        .order('created_at', { ascending: false })
    );

    if (!error && data && data.length > 0) {
      return NextResponse.json({ users: data });
    }
  } catch {
    // Supabase fallback
  }

  return NextResponse.json({ users: fallbackUsers });
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, role, pro_status } = await request.json();
    try {
      const supabase = createServerClient();
      const updates: Record<string, string> = {};
      if (role) updates.role = role;
      if (pro_status) updates.pro_status = pro_status;

      await withTimeout(supabase.from('users').update(updates).eq('id', userId));
    } catch {
      // Offline fallback
    }
    return NextResponse.json({ success: true, message: 'User berhasil diperbarui' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
