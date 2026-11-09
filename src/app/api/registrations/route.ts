import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient, withTimeout } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { mockRegistrations } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

// Get registrations — organizer sees by event_id, user sees their own
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rawEventId = searchParams.get('event_id');
    const eventId = (rawEventId === 'e1' || rawEventId === '1') ? 'evt-1' : rawEventId;

    if (eventId && (user.role === 'organizer' || user.role === 'admin')) {
      try {
        const supabase = createServerClient();
        const { data, error } = await withTimeout<any>(
          supabase
            .from('event_registrations')
            .select(`
              *, 
              user:users!event_registrations_user_id_fkey(id, name, whatsapp, email, profile_image, updated_at)
            `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
        );
        if (!error && data) return NextResponse.json({ registrations: data });
      } catch {
        // Fallback
      }

      const filtered = mockRegistrations.filter(r => r.event_id === eventId);
      return NextResponse.json({ registrations: filtered.length > 0 ? filtered : mockRegistrations });
    }

    // User: get their own registrations
    try {
      const supabase = createServerClient();
      const { data, error } = await withTimeout<any>(
        supabase
          .from('event_registrations')
          .select(`*, event:events(id, title, date, location)`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      );
      if (!error && data) return NextResponse.json({ registrations: data });
    } catch {
      // Fallback
    }

    return NextResponse.json({ registrations: mockRegistrations });
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

    const body = await request.json();
    const { event_id, payment_proof_url } = body;

    if (!event_id) return NextResponse.json({ error: 'Event ID wajib diisi' }, { status: 400 });

    const supabase = createServerClient();

    // Check event exists and is published
    const { data: event } = await supabase
      .from('events')
      .select('id, title, status, price, max_peserta')
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

    // Check capacity if max_peserta > 0
    if (event.max_peserta && event.max_peserta > 0) {
      // Calculate current load (approved + pending)
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .in('approval_status', ['approved', 'pending_approval']);
      
      if (count !== null && count >= event.max_peserta) {
        return NextResponse.json({ error: 'Mohon maaf, kuota peserta sudah penuh' }, { status: 400 });
      }
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

    const paymentStatus = payment_proof_url ? 'sudah_bayar' : 'belum_bayar'; // updated initially upon upload

    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        user_id: user.id,
        event_id,
        approval_status: 'pending_approval',
        payment_status: paymentStatus,
        payment_proof_url: payment_proof_url || null,
      })
      .select(`*, event:events(id, title, date, location, price)`)
      .single();

    if (regError) {
      console.error('Registration Insert Error:', regError);
      return NextResponse.json({ error: `Gagal membuat pendaftaran: DB Error (${regError.message})` }, { status: 500 });
    }

    await createNotification(
      user.id,
      'general',
      `Pendaftaran untuk event "${event.title}" sedang menunggu persetujuan organizer.`,
      `/events/${event_id}`
    );

    return NextResponse.json({ success: true, registration, mode: 'pending' }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Registration Critical Error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
