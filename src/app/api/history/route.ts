import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/services/auth';

export async function GET(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const moduleFilter = searchParams.get('module');
    const threatFilter = searchParams.get('threat');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 2. Build Supabase query
    let query = supabase
      .from('scan_history')
      .select('*, analysis_reports(*)')
      .eq('user_id', user.id);

    if (moduleFilter) {
      query = query.eq('module', moduleFilter);
    }
    if (threatFilter) {
      query = query.eq('threat_level', threatFilter);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Apply search filter locally (since cross-field complex OR queries are cleaner this way or in SQL)
    let filteredLogs = logs || [];
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredLogs = filteredLogs.filter((log: any) => 
        log.module?.toLowerCase().includes(lowerSearch) ||
        log.classification?.toLowerCase().includes(lowerSearch) ||
        log.input_type?.toLowerCase().includes(lowerSearch)
      );
    }

    // Format fields to match original front-end expectations
    const formattedLogs = filteredLogs.map((log: any) => ({
      id: log.id,
      analyzer_type: log.module, // original key name fallback
      classification: log.classification,
      overall_score: log.fraud_confidence,
      processed_at: log.created_at,
      raw_payload: log.analysis_reports || { summary: log.classification }
    }));

    return NextResponse.json({
      success: true,
      history: formattedLogs
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    // Delete scan history log (RLS ensures user owns it)
    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Log deleted successfully'
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
