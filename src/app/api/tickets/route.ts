import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { generateTicketCode, generateQRToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const supabase = createServerClient();

    // Organizer/admin can query by event_id to see all participants
    if (eventId && (user.role === 'organizer' || user.role === 'admin')) {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *, 
          user:users!tickets_user_id_fkey(id, name, whatsapp), 
          event:events(id, title, date, location)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: 'Gagal mengambil tiket' }, { status: 500 });
      return NextResponse.json({ tickets: data });
    }

    // Regular user: only their own tickets
    const { data, error } = await supabase
      .from('tickets')
      .select(`*, event:events(id, title, date, location, poster_url)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Gagal mengambil tiket' }, { status: 500 });
    return NextResponse.json({ tickets: data });
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
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const { event_id } = await request.json();
    if (!event_id) return NextResponse.json({ error: 'Event ID wajib diisi' }, { status: 400 });

    const supabase = createServerClient();

    const { data: event } = await supabase
      .from('events')
      .select('id, status')
      .eq('id', event_id)
      .single();
    if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Event tidak tersedia' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single();
    if (existing) {
      return NextResponse.json({ error: 'Anda sudah terdaftar di event ini' }, { status: 400 });
    }

    const ticket_code = generateTicketCode();
    const qr_token = generateQRToken();

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        event_id,
        ticket_code,
        qr_token,
        status: 'active',
      })
      .select(`*, event:events(id, title, date, location)`)
      .single();

    if (error) return NextResponse.json({ error: 'Gagal membuat tiket' }, { status: 500 });
    return NextResponse.json({ success: true, ticket: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

