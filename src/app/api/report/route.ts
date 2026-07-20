import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/services/auth';
import { syncUserDashboardStats } from '@/lib/services/stats';
import { z } from 'zod';

const reportSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  threatScore: z.number().min(0).max(100).default(50)
});

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reports, error } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Map back to original properties so UI doesn't break
    const formattedReports = (reports || []).map((r: any) => ({
      id: r.id,
      reporter_id: r.user_id,
      title: r.classification,
      description: r.summary,
      category: r.classification,
      threat_score: r.fraud_confidence,
      threat_level: r.threat_level,
      created_at: r.created_at
    }));

    return NextResponse.json({
      success: true,
      reports: formattedReports
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation Error', details: parsed.error.format() }, { status: 400 });
    }

    const { title, description, category, threatScore } = parsed.data;

    // Map to threat_severity enum: 'Safe', 'Low', 'Medium', 'High', 'Critical'
    const threatLevel = threatScore >= 85 ? 'Critical' : threatScore >= 60 ? 'High' : threatScore >= 35 ? 'Medium' : threatScore >= 15 ? 'Low' : 'Safe';

    // 1. Create a request first
    const { data: requestData, error: reqErr } = await supabase
      .from('analysis_requests')
      .insert({
        user_id: user.id,
        analysis_type: 'document', // fallback or general category
        input_text: description || title
      })
      .select()
      .single();

    if (reqErr) throw reqErr;

    // 2. Insert into analysis_reports
    const { data: report, error } = await supabase
      .from('analysis_reports')
      .insert({
        user_id: user.id,
        request_id: requestData.id,
        summary: description || title,
        classification: category,
        fraud_confidence: threatScore,
        ai_confidence: 98,
        threat_level: threatLevel,
        user_safety: 'Safety alert registered. Standard protection center guidelines apply.'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 3. Create scan history entry
    await supabase
      .from('scan_history')
      .insert({
        user_id: user.id,
        analysis_report_id: report.id,
        module: category + ' Scanner',
        input_type: 'file',
        classification: category,
        threat_level: threatLevel,
        fraud_confidence: threatScore,
        ai_confidence: 98,
        processing_time: 150
      });

    // 4. Create protection history entry if high/critical
    if (['High', 'Critical'].includes(threatLevel)) {
      await supabase
        .from('protection_history')
        .insert({
          user_id: user.id,
          module: category + ' Shield',
          status: 'Flagged',
          threat_level: threatLevel,
          fraud_confidence: threatScore,
          summary: `Flagged malicious ${category} content.`
        });

      // Insert notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: `Threat Registered: ${category}`,
          message: description || title,
          type: 'emergency'
        });
    }

    // 5. Update user dashboard statistics
    await syncUserDashboardStats(user.id);

    // Format back to UI model
    const formattedReport = {
      id: report.id,
      reporter_id: report.user_id,
      title: report.classification,
      description: report.summary,
      category: report.classification,
      threat_score: report.fraud_confidence,
      threat_level: report.threat_level,
      created_at: report.created_at
    };

    return NextResponse.json({
      success: true,
      report: formattedReport
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
