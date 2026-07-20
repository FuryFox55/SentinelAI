import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/services/auth';

export async function GET(request: Request) {
  try {
    // 1. Get authenticated user from token
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized Session' }, { status: 401 });
    }

    // 2. Query user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        displayName: profile.full_name,
        phoneNumber: profile.phone,
        role: profile.role,
        biometricsEnabled: profile.preferences?.voiceBiometrics || false,
        createdAt: profile.created_at
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
