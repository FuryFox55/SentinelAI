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

    // 2. Enforce Role-Based Access Control (Admin/Law Enforcement)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile || !['Admin', 'Law Enforcement'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    // 3. Retrieve investigations and join analysis reports
    const { data: cases, error } = await supabase
      .from('investigations')
      .select('*, report:analysis_reports(*)')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Format fields to match original front-end expectations
    const formattedCases = (cases || []).map((c: any) => ({
      id: c.id,
      operator_notes: c.notes,
      urgency: c.report?.threat_level || 'Low',
      status: c.status,
      created_at: c.updated_at,
      report: c.report ? {
        id: c.report.id,
        title: c.report.classification,
        description: c.report.summary,
        category: c.report.classification,
        threat_score: c.report.fraud_confidence,
        threat_level: c.report.threat_level,
        created_at: c.report.created_at
      } : null
    }));

    return NextResponse.json({
      success: true,
      cases: formattedCases
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Enforce Role-Based Access Control (Admin/Law Enforcement)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile || !['Admin', 'Law Enforcement'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const body = await request.json();
    const { caseId, operatorNotes, urgency, status } = body;

    if (!caseId) {
      return NextResponse.json({ error: 'Missing caseId parameter' }, { status: 400 });
    }

    // 3. Update investigation case details
    const { data: updatedCase, error } = await supabase
      .from('investigations')
      .update({
        notes: operatorNotes,
        status: status || 'Investigating',
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select('*, report:analysis_reports(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Format back to UI model
    const formattedCase = {
      id: updatedCase.id,
      operator_notes: updatedCase.notes,
      urgency: updatedCase.report?.threat_level || 'Low',
      status: updatedCase.status,
      created_at: updatedCase.updated_at,
      report: updatedCase.report ? {
        id: updatedCase.report.id,
        title: updatedCase.report.classification,
        description: updatedCase.report.summary,
        category: updatedCase.report.classification,
        threat_score: updatedCase.report.fraud_confidence,
        threat_level: updatedCase.report.threat_level,
        created_at: updatedCase.report.created_at
      } : null
    };

    return NextResponse.json({
      success: true,
      case: formattedCase
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
