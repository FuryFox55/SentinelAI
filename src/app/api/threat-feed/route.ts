import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { data: events, error } = await supabase
      .from('threat_events')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      threatFeed: events || []
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, details } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType parameter' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('threat_events')
      .insert({
        event_type: eventType,
        details: details || {}
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      event: data
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
