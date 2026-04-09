import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { generateTicketCode, generateQRToken } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// Approve or reject a registration (organizer/admin)
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
    if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
    }

    const { action, payment_status } = await request.json();
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: registration } = await supabase
      .from('event_registrations')
      .select('*, event:events(organizer_id)')
      .eq('id', id)
      .single();

    if (!registration) {
      return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
    }

    // Verify organizer owns the event
    if (
      user.role === 'organizer' &&
      registration.event?.organizer_id !== user.id
    ) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
    }

    if (action === 'approve') {
      // 1. Update registration
      const { error: regUpdateError } = await supabase
        .from('event_registrations')
        .update({
          approval_status: 'approved',
          payment_status: payment_status || 'sudah_bayar',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', id);

      if (regUpdateError) {
        console.error('Registration Update Error:', regUpdateError);
        return NextResponse.json({ 
          error: 'Gagal memperbarui status pendaftaran', 
          details: regUpdateError.message 
        }, { status: 500 });
      }

      // 2. Generate ticket (if doesn't exist yet)
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('id')
        .eq('registration_id', id)
        .maybeSingle();

      if (!existingTicket) {
        const ticket_code = generateTicketCode();
        const qr_token = generateQRToken();
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            user_id: registration.user_id,
            event_id: registration.event_id,
            registration_id: id,
            ticket_code,
            qr_token,
            status: 'active',
          })
          .select()
          .single();

        if (ticketError) {
          console.error('Ticket Creation Error:', ticketError);
          return NextResponse.json({ error: 'Gagal membuat tiket' }, { status: 500 });
        }

        // 3. Notify user
        await createNotification(
          registration.user_id,
          'approval_accepted',
          `Pendaftaran tiket Anda untuk event telah disetujui!`,
          `/tickets/${ticket.id}`
        );

        return NextResponse.json({
          success: true,
          message: 'Pendaftaran disetujui, tiket sudah dibuat',
          ticket,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Pendaftaran disetujui, tiket sudah ada',
      });
    } else {
      // Reject
      const { error: rejectError } = await supabase
        .from('event_registrations')
        .update({
          approval_status: 'rejected',
          payment_status: payment_status || 'ditolak',
        })
        .eq('id', id);

      if (rejectError) {
        console.error('Registration Reject Error:', rejectError);
        return NextResponse.json({ error: 'Gagal menolak pendaftaran' }, { status: 500 });
      }

      await createNotification(
        registration.user_id,
        'approval_rejected',
        `Maaf, pendaftaran tiket event Anda ditolak.`,
        `/events/${registration.event_id}`
      );

      return NextResponse.json({ success: true, message: 'Pendaftaran ditolak' });
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
