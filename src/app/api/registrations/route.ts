import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { generateTicketCode, generateQRToken } from '@/lib/auth';

// Get registrations — organizer sees by event_id, user sees their own
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

    if (eventId && (user.role === 'organizer' || user.role === 'admin')) {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`*, user:users(id, name, whatsapp, email)`)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: 'Gagal mengambil data', registrations: [] }, { status: 200 });
      return NextResponse.json({ registrations: data || [] });
    }

    // User: get their own registrations
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`*, event:events(id, title, date, location)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ registrations: [] });
    return NextResponse.json({ registrations: data || [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Create a registration (user joins event — pending approval)
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

    // Check event exists and is published
    const { data: event } = await supabase
      .from('events')
      .select('id, status, price')
      .eq('id', event_id)
      .single();
    if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Event tidak tersedia' }, { status: 400 });
    }

    // Check for existing registration
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id, approval_status')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single();

    if (existingReg) {
      return NextResponse.json(
        { error: 'Anda sudah mendaftar di event ini', registration: existingReg },
        { status: 400 }
      );
    }

    // Also check if they already have a ticket (legacy check)
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single();
    if (existingTicket) {
      return NextResponse.json({ error: 'Anda sudah terdaftar di event ini' }, { status: 400 });
    }

    const price = event.price || 0;
    const paymentStatus = price > 0 ? 'belum_bayar' : 'belum_bayar'; // same initial state; organizer changes it after verification

    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        user_id: user.id,
        event_id,
        approval_status: 'pending_approval',
        payment_status: paymentStatus,
      })
      .select(`*, event:events(id, title, date, location, price)`)
      .single();

    if (regError) {
      // Fallback: if event_registrations table doesn't exist, create ticket directly
      const ticket_code = generateTicketCode();
      const qr_token = generateQRToken();
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({ user_id: user.id, event_id, ticket_code, qr_token, status: 'active' })
        .select(`*, event:events(id, title, date, location)`)
        .single();
      if (ticketError) return NextResponse.json({ error: 'Gagal mendaftar' }, { status: 500 });
      return NextResponse.json({ success: true, ticket, mode: 'direct' }, { status: 201 });
    }

    return NextResponse.json({ success: true, registration, mode: 'pending' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
