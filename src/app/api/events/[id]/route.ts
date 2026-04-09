import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('events')
      .select(`*, organizer:users(id, name, whatsapp)`)
      .eq('id', id)
      .single();
    if (error || !data) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ event: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const body = await request.json();
    const supabase = createServerClient();

    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single();
    if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    if (event.organizer_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('events')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Gagal update event' }, { status: 500 });
    
    // Notify all participants about schedule change
    if (body.date || body.location || body.time) {
      const { data: participants } = await supabase
        .from('tickets')
        .select('user_id')
        .eq('event_id', id);
        
      if (participants) {
        // Find unique participants
        const uniqueUserIds = Array.from(new Set(participants.map(p => p.user_id)));
        for (const uid of uniqueUserIds) {
          await createNotification(
            uid,
            'schedule_change',
            `Jadwal/Lokasi event "${data.title}" telah diperbarui.`,
            `/events/${id}`
          );
        }
      }
    }

    return NextResponse.json({ success: true, event: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const supabase = createServerClient();

    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single();
    if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    if (event.organizer_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
    }

    // Explicit manual cascade
    await supabase.from('checkin_logs').delete().eq('event_id', id);
    await supabase.from('tickets').delete().eq('event_id', id);
    await supabase.from('event_registrations').delete().eq('event_id', id);

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Gagal menghapus event' }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Event berhasil dihapus' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
