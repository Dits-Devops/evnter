import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = createServerClient();
    const [usersRes, eventsRes, ticketsRes] = await Promise.all([
      supabase
        .from('users')
        .select('id, role, pro_status, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('events')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('tickets')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),
    ]);

    const stats = {
      totalUsers: usersRes.data?.length || 0,
      totalEvents: eventsRes.data?.length || 0,
      totalTickets: ticketsRes.data?.length || 0,
      checkedInTickets:
        ticketsRes.data?.filter((t: { status: string }) => t.status === 'checked_in').length || 0,
      organizers:
        usersRes.data?.filter((u: { role: string }) => u.role === 'organizer').length || 0,
      pendingPayments:
        usersRes.data?.filter((u: { pro_status: string }) => u.pro_status === 'pending').length || 0,
      recentUsers: usersRes.data?.slice(0, 5) || [],
      recentEvents: eventsRes.data?.slice(0, 5) || [],
    };

    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
