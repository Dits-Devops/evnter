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
    const userToken = verifyToken(token);
    if (!userToken) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const supabase = createServerClient();
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('id, name, email, role, pro_status, whatsapp, profile_image, pro_payment_proof_url, updated_at')
      .eq('id', userToken.id)
      .single();

    if (error || !dbUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    const body = await request.json();
    const supabase = createServerClient();
    
    // We optionally extract profile_image and pro_payment_proof_url
    const { name, whatsapp, profile_image, pro_payment_proof_url } = body;
    
    const updatePayload: Record<string, string | null | undefined> = { 
      name, 
      whatsapp, 
      updated_at: new Date().toISOString() 
    };

    if (profile_image !== undefined) {
      updatePayload.profile_image = profile_image;
    }
    
    if (pro_payment_proof_url !== undefined) {
      updatePayload.pro_payment_proof_url = pro_payment_proof_url;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', user.id)
      .select('id, name, email, role, pro_status, whatsapp, profile_image, pro_payment_proof_url')
      .single();

    if (error) return NextResponse.json({ error: 'Gagal update profil' }, { status: 500 });
    return NextResponse.json({ success: true, user: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
