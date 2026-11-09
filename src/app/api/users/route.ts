import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { createServerClient, withTimeout } from '@/lib/supabase';
import { mockUsers } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('token')?.value;
    const authHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const token = cookieToken || authHeader;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userToken = verifyToken(token);
    if (!userToken) return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });

    // Instant mock user check (0ms response, immune to Windows DNS hangs)
    const mockUser = mockUsers.find(
      (u) => u.id === userToken.id || u.email.toLowerCase() === userToken.email.toLowerCase()
    );
    if (mockUser) {
      return NextResponse.json({ user: mockUser });
    }

    try {
      const supabase = createServerClient();
      const { data: dbUser, error } = await withTimeout<any>(
        supabase
          .from('users')
          .select('id, name, email, role, pro_status, whatsapp, profile_image, pro_payment_proof_url, updated_at')
          .eq('id', userToken.id)
          .single()
      );

      if (!error && dbUser) {
        return NextResponse.json({ user: dbUser });
      }
    } catch {
      // Supabase fallback
    }

    return NextResponse.json({ user: userToken });
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
      .select('id, name, email, role, pro_status, whatsapp, profile_image, pro_payment_proof_url, updated_at')
      .single();

    if (error) return NextResponse.json({ error: 'Gagal update profil' }, { status: 500 });
    return NextResponse.json({ success: true, user: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
