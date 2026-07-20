import { NextResponse } from 'next/server';
import { liveCallState } from '@/lib/supabase';
import { getAuthUser } from '@/lib/services/auth';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ liveCall: liveCallState });
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  liveCallState.active = false;
  return NextResponse.json({ success: true });
}
