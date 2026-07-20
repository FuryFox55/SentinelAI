import { NextResponse } from 'next/server';
import { supabase, liveCallState } from '@/lib/supabase';
import { getAuthUser } from '@/lib/services/auth';

export async function GET(request: Request) {
  try {
    // 1. Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const protectionScore = profile?.protection_score ?? 92;

    // 3. Fetch user scans
    const { data: scans } = await supabase
      .from('scan_history')
      .select('id, threat_level, created_at, module')
      .eq('user_id', user.id);

    // 4. Fetch user protection history
    const { data: protections } = await supabase
      .from('protection_history')
      .select('id')
      .eq('user_id', user.id);

    // 5. Fetch unread notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, type')
      .eq('user_id', user.id)
      .eq('is_read', false);

    // 6. Evaluate metrics dynamically
    const totalScans = scans?.length || 0;
    const threatsDetected = scans?.filter((s: any) => ['High', 'Critical'].includes(s.threat_level)).length || 0;
    const criticalAlerts = notifications?.filter((n: any) => n.type === 'emergency').length || 0;
    const unresolvedAlertsCount = notifications?.length || 0;
    const preventedCount = protections?.length || 0;

    // Count calls today (created_at is within last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const callsTodayCount = scans?.filter((s: any) => 
      s.module.toLowerCase().includes('voice') && 
      new Date(s.created_at) >= oneDayAgo
    ).length || 0;

    const threatLevel = threatsDetected > 3 ? 'Critical' : threatsDetected > 0 ? 'Warning' : 'Low';

    return NextResponse.json({
      summary: {
        protectionScore,
        unresolvedAlertsCount,
        preventedCount,
        callsTodayCount,
        threatsDetected,
        totalScans,
        criticalAlerts,
        threatLevel,
        liveCall: liveCallState
      },
      activeProtections: profile?.preferences || {
        backgroundAI: true,
        liveCallMonitor: true,
        urlBlocker: true
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
