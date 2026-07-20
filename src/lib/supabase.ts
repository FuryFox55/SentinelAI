import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Persistent metrics that tick in memory
export const liveSimulationMetrics = {
  preventedCount: 124,
  callsTodayCount: 5
};

export const liveCallState = {
  active: false,
  callerName: 'HDFC Security Division',
  callerNumber: '+91 95382 10928'
};

// Fallback in-memory database mock if Supabase variables are not set
class MockSupabaseClient {
  public inMemoryDb: Record<string, any[]> = {
    profiles: [
      { id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', email: 'citizen@sentinel.ai', display_name: 'Sai Ram', phone_number: '+91 98765 43210', role: 'Citizen' },
      { id: 'a16cbbf0-10ef-4172-8822-261908bf5bf0', email: 'operator@sentinel.ai', display_name: 'Command Agent Alpha', phone_number: '+91 99999 88888', role: 'Administrator' }
    ],
    user_profiles: [
      { id: '1', user_id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', full_name: 'Sai Ram', email: 'citizen@sentinel.ai', phone: '+91 98765 43210', role: 'Citizen', theme: 'light', protection_score: 92 }
    ],
    user_preferences: [
      { id: '1', user_id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', theme: 'light', language: 'en', date_format: 'YYYY-MM-DD', time_format: '24h', dashboard_layout: 'grid', animations_enabled: true, accessibility_preferences: {} }
    ],
    trusted_contacts: [
      { id: '728a0112-be00-4b00-a548-2895f32a76f2', profile_id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', contact_name: 'Sunita Ram', contact_phone: '+91 98765 55555', verified: true }
    ],
    notifications: [
      { id: 'fb45210c-990a-4bf8-ab02-fb2354890c29', profile_id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', title: 'Secure Core Enabled', message: 'Sentinel AI is monitoring your telephone interface.', type: 'info', is_read: false },
      { id: 'fb45210c-990a-4bf8-ab02-fb2354890c30', profile_id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', title: 'Vishing Alert Prevented', message: 'Simulated voice scam from suspicious agent flagged.', type: 'alert', is_read: true }
    ],
    fraud_reports: [
      { id: '882b0123-cd45-41ef-bbff-9218d6a8ea20', reporter_id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29', title: 'Suspicious Bank CBI Call', description: 'Simulated voice cloning attempting to coerce bank transfer verification keys.', category: 'Vishing', threat_score: 78, threat_level: 'High', status: 'Investigating', created_at: new Date().toISOString() }
    ],
    command_center_cases: [
      { id: 'c42ba011-88fc-4217-ba55-9a8c1f9d45e0', report_id: '882b0123-cd45-41ef-bbff-9218d6a8ea20', risk_index: 78, urgency: 'High', assignee_id: 'a16cbbf0-10ef-4172-8822-261908bf5bf0', operator_notes: 'Suspect voice prints match known vishing ring indicators. Intercept active.' }
    ],
    system_health: [
      { id: '1', node_name: 'Core AI Scanner Matrix', status: 'Nominal', load_avg: 0.12, uptime_seconds: 86400, recorded_at: new Date().toISOString() },
      { id: '2', node_name: 'Telephony Capture Node 4', status: 'Nominal', load_avg: 0.28, uptime_seconds: 86400, recorded_at: new Date().toISOString() },
      { id: '3', node_name: 'Command Sync Pipeline', status: 'Nominal', load_avg: 0.05, uptime_seconds: 86400, recorded_at: new Date().toISOString() }
    ],
    analysis_history: [],
    threat_events: []
  };

  from(table: string) {
    if (!this.inMemoryDb[table]) {
      this.inMemoryDb[table] = [];
    }
    const data = this.inMemoryDb[table];
    
    // Simple mock chainable queries
    return {
      select: (columns: string = '*') => {
        return {
          eq: (field: string, value: any) => {
            const filtered = data.filter(item => item[field] === value);
            return Promise.resolve({ data: filtered, error: null });
          },
          order: (field: string, { ascending = false } = {}) => {
            const sorted = [...data].sort((a, b) => {
              if (a[field] < b[field]) return ascending ? -1 : 1;
              if (a[field] > b[field]) return ascending ? 1 : -1;
              return 0;
            });
            return Promise.resolve({ data: sorted, error: null });
          },
          single: () => {
            return Promise.resolve({ data: data[0] || null, error: data[0] ? null : new Error('Not found') });
          },
          then: (callback: any) => callback({ data, error: null })
        };
      },
      insert: (record: any) => {
        const newRecord = { id: Math.random().toString(), created_at: new Date().toISOString(), processed_at: new Date().toISOString(), detected_at: new Date().toISOString(), ...record };
        data.push(newRecord);
        return {
          select: () => ({
            single: () => Promise.resolve({ data: newRecord, error: null }),
            then: (callback: any) => callback({ data: [newRecord], error: null })
          }),
          then: (callback: any) => callback({ data: [newRecord], error: null })
        };
      },
      update: (updates: any) => {
        return {
          eq: (field: string, value: any) => {
            data.forEach(item => {
              if (item[field] === value) {
                Object.assign(item, updates);
              }
            });
            return Promise.resolve({ data, error: null });
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: any) => {
            this.inMemoryDb[table] = data.filter(item => item[field] !== value);
            return Promise.resolve({ error: null });
          }
        };
      }
    };
  }

  auth = {
    signUp: ({ email }: { email: string }) => {
      const id = Math.random().toString();
      const profile = { id, email, display_name: email.split('@')[0], role: 'Citizen' };
      this.inMemoryDb.profiles.push(profile);
      return Promise.resolve({ data: { user: { id, email }, session: { access_token: 'mock-token' } }, error: null });
    },
    signInWithPassword: ({ email }: { email: string }) => {
      const user = this.inMemoryDb.profiles.find(p => p.email === email);
      if (!user) return Promise.resolve({ data: { user: null, session: null }, error: new Error('User not found') });
      return Promise.resolve({ data: { user, session: { access_token: 'mock-token' } }, error: null });
    },
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: { access_token: 'mock-token', user: { id: 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a29' } } }, error: null })
  };
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new MockSupabaseClient() as any);

export async function authenticatedFetch(url: string, init?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  return fetch(url, { ...init, headers });
}

// ----------------------------------------------------
// TELEMETRY THREAT EVENTS DAEMON SIMULATOR
// ----------------------------------------------------
const simulatedThreats = [
  {
    type: 'Voice Hijack',
    title: 'Telephony Vishing Alert',
    desc: 'Simulated voice signature cloning match (CBI agent extortion template) intercepted.',
    category: 'Vishing',
    score: 84,
    level: 'High',
    analyzer: 'voice'
  },
  {
    type: 'Phishing Redirect',
    title: 'UPI Phishing Intercept',
    desc: 'Suspicious HDFC collection portal verification payload blocked.',
    category: 'Phishing',
    score: 92,
    level: 'Critical',
    analyzer: 'url'
  },
  {
    type: 'QR Malicious',
    title: 'Spoofed QR Code Scan',
    desc: 'Scanned UPI payment signature redirects to a blacklisted personal wallet.',
    category: 'Phishing',
    score: 75,
    level: 'High',
    analyzer: 'qr'
  },
  {
    type: 'Document Alert',
    title: 'Receipt Forgery Audit',
    desc: 'Edited font weights and mismatched tax headers flagged on Invoice PDF.',
    category: 'Document forgery',
    score: 68,
    level: 'Medium',
    analyzer: 'document'
  }
];

function startThreatSimulator() {
  if (typeof window !== 'undefined') return; // Enforce server-side execution only

  console.log('Sentinel AI background protection daemon initialized...');
  
  setInterval(async () => {
    try {
      // Get a real user ID from user_profiles to satisfy foreign keys
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .limit(1);
      
      if (userError || !users || users.length === 0) {
        console.log('[Daemon Active] No registered users found. Skipping threat simulation tick.');
        return;
      }
      
      const realUserId = users[0].user_id;
      const selected = simulatedThreats[Math.floor(Math.random() * simulatedThreats.length)];
      
      // Update global metrics counter
      liveSimulationMetrics.preventedCount += 1;
      if (selected.type === 'Voice Hijack') {
        liveSimulationMetrics.callsTodayCount += 1;
        liveCallState.active = true;
        liveCallState.callerName = 'HDFC Security Division';
        liveCallState.callerNumber = '+91 95382 10928';
      }

      // 1. Log Threat Event
      await supabase.from('threat_events').insert({
        event_type: selected.type,
        details: {
          title: selected.title,
          description: selected.desc,
          threatScore: selected.score
        }
      });

      // 2. Insert into analysis_requests
      const { data: reqData, error: reqError } = await supabase
        .from('analysis_requests')
        .insert({
          user_id: realUserId,
          analysis_type: selected.analyzer === 'voice' ? 'voice' : selected.analyzer === 'url' ? 'URL' : selected.analyzer === 'qr' ? 'QR' : selected.analyzer === 'document' ? 'document' : 'chat',
          input_text: selected.desc
        })
        .select()
        .single();
      
      if (reqError) throw reqError;

      // 3. Generate Analysis Report
      const { data: reportData, error: reportError } = await supabase
        .from('analysis_reports')
        .insert({
          user_id: realUserId,
          request_id: reqData.id,
          summary: selected.desc,
          classification: selected.type,
          fraud_confidence: selected.score,
          ai_confidence: 95,
          threat_level: selected.level as any,
          user_safety: 'Sentinel active shield is monitoring. Avoid sharing OTPs or financial credentials.',
          explainable_ai: [
            {
              name: 'Real-time Telemetry Verification',
              severity: selected.level,
              confidence: 95,
              explanation: selected.desc
            }
          ],
          threat_indicators: [selected.type, 'Telemetry Anomaly'],
          evidence: { title: selected.title },
          recommendations: ['Do Not Transfer Money', 'Block Number', 'Report to Cyber Crime'],
          timeline: ['Threat detected', 'Auto-escalated']
        })
        .select()
        .single();
      
      if (reportError) throw reportError;

      // 4. Generate Investigation case
      const { error: invError } = await supabase
        .from('investigations')
        .insert({
          report_id: reportData.id,
          status: 'Unresolved',
          notes: 'Auto-escalated threat via background active intelligence monitoring.'
        });
      
      if (invError) throw invError;

      // 5. Generate notification alert
      await supabase.from('notifications').insert({
        user_id: realUserId,
        title: `AI Intercept: ${selected.title}`,
        message: selected.desc,
        type: 'emergency',
        is_read: false
      });

      // 6. Generate scan history entry
      await supabase.from('scan_history').insert({
        user_id: realUserId,
        analysis_report_id: reportData.id,
        module: selected.analyzer.toUpperCase() + ' Scanner',
        input_type: selected.analyzer,
        classification: selected.type,
        threat_level: selected.level as any,
        fraud_confidence: selected.score,
        ai_confidence: 95,
        processing_time: 120
      });

      // 7. Generate protection history entry
      await supabase.from('protection_history').insert({
        user_id: realUserId,
        module: selected.analyzer.toUpperCase() + ' Shield',
        status: 'Triggered',
        threat_level: selected.level as any,
        fraud_confidence: selected.score,
        summary: selected.desc
      });

      // 8. Generate system health entry
      const nodeName = selected.analyzer === 'voice' ? 'Telephony Capture Node 4' : 'Core AI Scanner Matrix';
      await supabase.from('system_health').insert({
        node_name: nodeName,
        status: 'Nominal',
        load_avg: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)),
        uptime_seconds: 86400
      });

      console.log(`[Daemon Active] Generated simulated threat event: ${selected.type} (${selected.score}%)`);

    } catch (e: any) {
      console.warn('Background threat simulation tick encountered a connection error (e.g. database schema not found), skipping tick. Error:', e.message);
    }
  }, 22000); // Trigger every 22 seconds
}

// Start simulation daemon on server init
startThreatSimulator();
