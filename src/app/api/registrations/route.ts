import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

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
    const eventId = searchParams.get('event_id');

    console.log(`[API Debug] GET Registrations - User: ${user.email}, Role: ${user.role}, EventID: ${eventId}`);

    const supabase = createServerClient();

    if (eventId && (user.role === 'organizer' || user.role === 'admin')) {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *, 
          user:users!event_registrations_user_id_fkey(id, name, whatsapp, email, profile_image, updated_at)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[API Error] Supabase Fetch Error:', error);
        return NextResponse.json({ 
          error: 'Gagal mengambil data pendaftaran', 
          details: error.message,
          error_code: error.code,
          registrations: [] 
        }, { status: 500 });
      }
      
      console.log(`[API Debug] Successfully fetched ${data?.length || 0} registrations for event ${eventId}`);
      return NextResponse.json({ registrations: data || [] });
    }

    // User: get their own registrations
    console.log(`[API Debug] Falling back to USER registrations for user ${user.id}`);
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`*, event:events(id, title, date, location)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API Error] User Fetch Error:', error);
      return NextResponse.json({ 
        registrations: [], 
        error: 'Gagal memuat data pendaftaran user',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ registrations: data || [] });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[API Critical Error]:', error);
    return NextResponse.json({ 
      error: 'Terjadi kesalahan sistem', 
      details: error.message || String(err) 
    }, { status: 500 });
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
