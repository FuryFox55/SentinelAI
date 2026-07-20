# SentinelAI - Supabase Integration & REST API Guide

This guide details how to integrate your frontend Next.js/React application with the **SentinelAI** database architecture using the Supabase JS Client (`@supabase/supabase-js`).

---

## 1. Initializing the Client

Ensure you have installed `@supabase/supabase-js` and configured your `.env.local`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 2. Common Frontend Queries

### A. Fetch Dashboard Statistics
Retrieve the aggregated global statistics to display on the landing page or admin dashboard.

```typescript
const fetchStats = async () => {
  const { data, error } = await supabase
    .from('dashboard_statistics')
    .select('*')
    .single();

  if (error) console.error('Error fetching stats:', error);
  return data;
};
```

### B. Submit a Scam for AI Analysis
Log a new voice, chat, screenshot, or URL analysis request. Row Level Security ensures it is mapped to the active authenticated user.

```typescript
const submitAnalysis = async (analysisData: {
  analysis_type: 'voice' | 'document' | 'screenshot' | 'QR' | 'URL' | 'chat';
  uploaded_file_url?: string;
  input_text?: string;
  scam_type?: string;
  fraud_confidence_score: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  ai_summary: string;
  explainable_reasoning: any[];
  evidence_points: any[];
  recommended_actions: any[];
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const { data, error } = await supabase
    .from('scam_analysis')
    .insert([
      {
        user_id: user.id,
        ...analysisData
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### C. Trigger an SOS / Emergency Event
Triggered manually or via background threat interception. Sends notifications and logs location.

```typescript
const triggerSOS = async (gpsLocation: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  // Fetch priority contacts to notify
  const { data: contacts } = await supabase
    .from('emergency_contacts')
    .select('phone')
    .eq('user_id', user.id)
    .order('priority', { ascending: true });

  const contactNumbers = contacts?.map(c => c.phone) || [];

  const { data, error } = await supabase
    .from('emergency_events')
    .insert([
      {
        user_id: user.id,
        trigger_source: 'Manual SOS Button',
        gps_location: gpsLocation,
        notified_contacts: contactNumbers,
        cybercrime_alert_sent: true
      }
    ])
    .select()
    .single();

  // Also update user's overall protection status
  await supabase
    .from('users')
    .update({ protection_status: 'SOS Triggered' })
    .eq('id', user.id);

  if (error) throw error;
  return data;
};
```

### D. Look Up a Scammer Phone Number
Query the global registry database to see if an incoming number is flagged.

```typescript
const checkPhoneNumber = async (phoneNumber: string) => {
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  
  const { data, error } = await supabase
    .from('scam_numbers')
    .select('*')
    .eq('number', cleanNumber)
    .maybeSingle();

  if (error) {
    console.error('Lookup error:', error);
    return null;
  }
  
  return data; // Returns scam details if flagged, null if clean
};
```

### E. Search Fraud Patterns & Keywords (AI Inference helper)
Pull local vector-like matching keywords or scripts to run frontend heuristics.

```typescript
const getScamKeywords = async () => {
  const { data, error } = await supabase
    .from('scam_keywords')
    .select('phrase, severity');

  if (error) throw error;
  return data; // Returns list of 150+ blacklisted phrases
};
```

---

## 3. Realtime Subscription

To listen to newly registered emergency events or threat history live on your admin dashboard:

```typescript
const subscribeToThreats = (onNewThreat: (payload: any) => void) => {
  const subscription = supabase
    .channel('public:threat_history')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'threat_history' },
      (payload) => onNewThreat(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
```
