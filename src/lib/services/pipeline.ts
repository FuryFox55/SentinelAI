import { supabase } from '../supabase';
import { evaluateFraudConfidence } from './scoring';

export interface TelemetryEvent {
  eventType: 'Voice Hijack' | 'Phishing Redirect' | 'UPI Spoof' | 'QR Malicious' | 'Document Alert';
  details: Record<string, any>;
}

export async function processTelemetryEvent(event: TelemetryEvent) {
  // Get a real user ID from user_profiles to satisfy foreign keys
  const { data: users } = await supabase
    .from('user_profiles')
    .select('user_id')
    .limit(1);
  
  const realUserId = users && users.length > 0 ? users[0].user_id : null;

  // 1. Log the raw Threat Event
  const { data: eventData, error: eventError } = await supabase
    .from('threat_events')
    .insert({
      event_type: event.eventType,
      details: event.details
    })
    .select()
    .single();

  if (eventError) {
    console.error('Error logging threat event:', eventError);
    return null;
  }

  if (!realUserId) {
    console.log('[Pipeline] No registered users found. Skipping reports/notifications generation.');
    return { score: 0 };
  }

  // 2. Perform score evaluation to see if it exceeds critical thresholds
  const callerRep = event.details.callerReputation || 0;
  const cloneProb = event.details.voiceCloneProbability || 0;
  const keywords = event.details.keywords || [];

  const evaluation = evaluateFraudConfidence({
    callerReputation: callerRep,
    voiceCloneProbability: cloneProb,
    suspiciousKeywords: keywords,
    voipRoutingScore: event.details.voipScore || 0,
    behaviorAnomalyRating: event.details.behaviorScore || 0
  });

  // 3. If final score >= 60, trigger automatic ticket escalating
  if (evaluation.fraudConfidenceIndex >= 60) {
    // 3a. Generate analysis request
    const { data: reqData, error: reqError } = await supabase
      .from('analysis_requests')
      .insert({
        user_id: realUserId,
        analysis_type: event.eventType === 'Voice Hijack' ? 'voice' : 'URL',
        input_text: `Automated telemetry capture: ${event.eventType}`
      })
      .select()
      .single();

    if (reqError) {
      console.error('Error creating analysis request in pipeline:', reqError);
      return null;
    }

    // 3b. Write V2 Report
    const { data: reportData, error: reportError } = await supabase
      .from('analysis_reports')
      .insert({
        user_id: realUserId,
        request_id: reqData.id,
        summary: `Automated telemetry capture. AI detected scam indicators: ${evaluation.evidence.join(' ')}`,
        classification: event.eventType === 'Voice Hijack' ? 'Vishing' : 'Phishing',
        fraud_confidence: evaluation.fraudConfidenceIndex,
        ai_confidence: 95,
        threat_level: evaluation.threatLevel as any,
        user_safety: 'Safety alert registered. Standard protection center guidelines apply.',
        explainable_ai: [
          {
            name: 'Pipeline Evaluation',
            severity: evaluation.threatLevel,
            confidence: 95,
            explanation: `AI evaluated threat indicators: ${evaluation.evidence.join(', ')}`
          }
        ],
        threat_indicators: evaluation.evidence,
        recommendations: ['Do Not Transfer Money', 'Block Caller', 'Contact Your Bank']
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error escalating analysis report:', reportError);
      return null;
    }

    // 3c. Write Case in investigations
    const { data: caseData, error: caseError } = await supabase
      .from('investigations')
      .insert({
        report_id: reportData.id,
        status: 'Unresolved',
        notes: `Auto-escalated from Sentinel telemetry logs. AI detected vishing patterns. Status: Monitoring.`
      })
      .select()
      .single();

    if (caseError) {
      console.error('Error creating investigation ticket:', caseError);
    }

    // Add In-App notification
    await supabase.from('notifications').insert({
      user_id: realUserId,
      title: `Critical Threat Shielded`,
      message: `AI intercepted a potential ${event.eventType} event. Safety protocols engaged.`,
      type: 'emergency',
      is_read: false
    });

    return {
      report: reportData,
      case: caseData,
      score: evaluation.fraudConfidenceIndex
    };
  }

  return {
    score: evaluation.fraudConfidenceIndex
  };
}
