import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });

    const supabase = createServerClient();
    
    // Fetch broadcasts with recipient counts
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*, author:users(name)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Gagal mengambil riwayat broadcast' }, { status: 500 });
    }

    return NextResponse.json({ broadcasts: data || [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });

    const body = await request.json();
    const { title, message, target_role, type } = body;

    if (!title || !message || !target_role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Insert broadcast record
    const { data: broadcast, error: bcError } = await supabase
      .from('broadcasts')
      .insert({
        title,
        message,
        target_role,
        type: type || 'info',
        created_by: user.id
      })
      .select()
      .single();

    if (bcError) {
      return NextResponse.json({ error: 'Gagal membuat broadcast: ' + bcError.message }, { status: 500 });
    }

    // Now insert notifications
    // Build query to fetch user IDs based on target_role
    let query = supabase.from('users').select('id');
    if (target_role === 'user' || target_role === 'organizer') {
      query = query.eq('role', target_role);
    } else if (target_role === 'all') {
      query = query.in('role', ['user', 'organizer']);
    }

    const { data: usersData, error: usersError } = await query;
    if (usersError || !usersData) {
      return NextResponse.json({ error: 'Gagal mengambil data penerima' }, { status: 500 });
    }

    // Prepare notifications payload
    const notifications = usersData.map((u: { id: string }) => ({
      user_id: u.id,
      title: title,
      message: message,
      type: 'announcement', // General category for broadcasts
      is_read: false
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);
        
      if (notifError) {
        console.error('Batch notifications error:', notifError);
        return NextResponse.json({ error: 'Broadcast dibuat tapi gagal mengirim notifikasi (' + notifError.message + ')' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, broadcast, recipients: notifications.length });
  } catch (error) {
    console.error('Broadcast server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
