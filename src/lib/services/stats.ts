import { supabase } from '../supabase';
import { evaluateThreatReport } from './engine';

export async function syncUserDashboardStats(userId: string) {
  try {
    // 1. Fetch user's scan history
    const { data: scans, error: scansErr } = await supabase
      .from('scan_history')
      .select('fraud_confidence, threat_level')
      .eq('user_id', userId);

    if (scansErr) throw scansErr;

    // 2. Fetch unread emergency notifications
    const { data: notifications, error: notifErr } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('is_read', false)
      .eq('type', 'emergency');

    if (notifErr) throw notifErr;

    const totalScans = scans?.length || 0;
    const threatsDetected = scans?.filter((s: any) => ['High', 'Critical'].includes(s.threat_level)).length || 0;
    const criticalAlerts = notifications?.length || 0;

    // Recalculate protection score: 100 - average fraud confidence of threats
    let avgThreatScore = 0;
    if (totalScans > 0) {
      const sum = scans.reduce((acc: number, curr: any) => acc + curr.fraud_confidence, 0);
      avgThreatScore = Math.round(sum / totalScans);
    }
    const protectionScore = Math.max(10, Math.min(100, 100 - avgThreatScore));

    // 3. Update dashboard_statistics
    const { error: statsErr } = await supabase
      .from('dashboard_statistics')
      .upsert({
        user_id: userId,
        protection_score: protectionScore,
        total_scans: totalScans,
        threats_detected: threatsDetected,
        critical_alerts: criticalAlerts,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (statsErr) throw statsErr;

    // 4. Update protection_score in user_profiles
    const { error: profileErr } = await supabase
      .from('user_profiles')
      .update({ protection_score: protectionScore })
      .eq('user_id', userId);

    if (profileErr) throw profileErr;

    console.log(`Successfully synced dashboard stats for user ${userId}: Score=${protectionScore}, Scans=${totalScans}`);
    return { protectionScore, totalScans, threatsDetected, criticalAlerts };

  } catch (err: any) {
    console.error('Failed to sync user dashboard stats:', err.message);
    return null;
  }
}

export async function recordAnalysisResult(
  userId: string,
  analysisType: 'voice' | 'document' | 'screenshot' | 'QR' | 'URL' | 'chat' | 'currency',
  inputText: string,
  result: any
) {
  // Evaluate through Fraud Confidence Engine to calculate index & breakdown on backend
  const evaluated = evaluateThreatReport(result);
  const threatLevel = evaluated.threat_level;

  // 1. Insert analysis request
  const { data: req, error: reqErr } = await supabase
    .from('analysis_requests')
    .insert({
      user_id: userId,
      analysis_type: analysisType,
      input_text: inputText
    })
    .select()
    .single();

  if (reqErr) throw reqErr;

  // 2. Insert analysis report
  const { data: report, error: repErr } = await supabase
    .from('analysis_reports')
    .insert({
      user_id: userId,
      request_id: req.id,
      summary: evaluated.summary,
      classification: evaluated.classification,
      explainable_ai: evaluated.reasoning || [],
      threat_indicators: evaluated.risk_indicators || [],
      evidence: evaluated.evidence || {},
      recommendations: evaluated.recommendations || [],
      timeline: evaluated.timeline || [],
      fraud_confidence: evaluated.fraud_confidence,
      ai_confidence: evaluated.ai_confidence,
      threat_level: threatLevel,
      user_safety: evaluated.user_safety || 'Standard cybersecurity guidelines apply.'
    })
    .select()
    .single();

  if (repErr) throw repErr;

  // 3. Insert scan history entry
  const { data: scan, error: scanErr } = await supabase
    .from('scan_history')
    .insert({
      user_id: userId,
      analysis_report_id: report.id,
      module: analysisType.toUpperCase() + ' Scanner',
      input_type: analysisType,
      classification: evaluated.classification,
      threat_level: threatLevel,
      fraud_confidence: evaluated.fraud_confidence,
      ai_confidence: evaluated.ai_confidence,
      processing_time: evaluated.processingTimeMs || 150
    })
    .select()
    .single();

  if (scanErr) throw scanErr;

  // 4. Create protection history entry & notification if threat
  if (['High', 'Critical'].includes(threatLevel)) {
    await supabase
      .from('protection_history')
      .insert({
        user_id: userId,
        module: analysisType.toUpperCase() + ' Protection',
        status: 'Triggered',
        threat_level: threatLevel,
        fraud_confidence: result.fraud_confidence,
        summary: result.summary
      });

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: `Vishing/Phishing Intercept: ${result.classification}`,
        message: result.summary,
        type: 'emergency'
      });
  } else {
    await supabase
      .from('protection_history')
      .insert({
        user_id: userId,
        module: analysisType.toUpperCase() + ' Protection',
        status: 'Clear',
        threat_level: threatLevel,
        fraud_confidence: result.fraud_confidence,
        summary: 'Standard scan verification verified as clean.'
      });
    
    // Add success notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: `Analysis Complete: ${analysisType.toUpperCase()}`,
        message: `Sentinel checked telemetry parameters. Result classified as ${result.classification}.`,
        type: 'info'
      });
  }

  // 5. Update user dashboard statistics
  await syncUserDashboardStats(userId);

  return { req, report, scan };
}
