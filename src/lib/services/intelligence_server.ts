import { supabase } from '../supabase';

export interface ThreatIntelligenceMatch {
  found: boolean;
  reputation: number;
  category: string;
}

export function extractIndicatorsFromText(text: string) {
  const urls: string[] = [];
  const phones: string[] = [];
  const emails: string[] = [];
  const wallets: string[] = [];
  const upis: string[] = [];

  // Match URLs / Domains
  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(?:\/[^\s]*)?)/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0].trim();
    if (!urls.includes(url) && !url.includes('sentinel') && !url.includes('localhost') && !url.includes('supabase')) {
      urls.push(url);
    }
  }

  // Match Phone Numbers (e.g. +91 95382 10928, 1800-455-900)
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const phone = match[0].trim();
    if (phone.replace(/[-.\s()]/g, '').length >= 8 && !phones.includes(phone)) {
      phones.push(phone);
    }
  }

  // Match Email Addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
  while ((match = emailRegex.exec(text)) !== null) {
    const email = match[0].trim();
    if (!emails.includes(email)) {
      emails.push(email);
    }
  }

  // Match UPI IDs / Virtual Payment Addresses (e.g. paying@paytm, name@okhdfcbank)
  const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]{3,}/g;
  while ((match = upiRegex.exec(text)) !== null) {
    const upi = match[0].trim();
    // Exclude emails matched as UPIs
    if (!emails.includes(upi) && !upis.includes(upi)) {
      upis.push(upi);
    }
  }

  // Match Crypto Wallet Addresses (Bitcoin / Ethereum basic checks)
  const walletRegex = /\b(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{26,35})\b/g;
  while ((match = walletRegex.exec(text)) !== null) {
    const wallet = match[0].trim();
    if (!wallets.includes(wallet)) {
      wallets.push(wallet);
    }
  }

  return { urls, phones, emails, wallets, upis };
}

export async function lookupThreatIndicator(value: string): Promise<ThreatIntelligenceMatch> {
  try {
    const { data, error } = await supabase
      .from('intelligence_events')
      .select('*')
      .eq('event_type', 'threat_indicator')
      .eq('raw_data->>value', value.trim().toLowerCase());

    if (error || !data || data.length === 0) {
      return { found: false, reputation: 0, category: 'unknown' };
    }

    // Return the match details
    const event = data[0];
    const reputation = event.raw_data?.reputation || 1;
    const category = event.raw_data?.category || 'General Scammer';
    return { found: true, reputation, category };
  } catch (err) {
    console.error('Threat intelligence lookup failure:', err);
    return { found: false, reputation: 0, category: 'unknown' };
  }
}

export async function recordThreatIndicator(value: string, category: string): Promise<void> {
  const cleanVal = value.trim().toLowerCase();
  if (!cleanVal || cleanVal.length < 4) return;

  try {
    // 1. Check if indicator exists
    const { data, error } = await supabase
      .from('intelligence_events')
      .select('*')
      .eq('event_type', 'threat_indicator')
      .eq('raw_data->>value', cleanVal);

    if (error) throw error;

    if (data && data.length > 0) {
      const event = data[0];
      const newReputation = (event.raw_data?.reputation || 1) + 1;
      
      await supabase
        .from('intelligence_events')
        .update({
          raw_data: {
            ...event.raw_data,
            reputation: newReputation,
            last_seen: new Date().toISOString()
          }
        })
        .eq('id', event.id);
    } else {
      await supabase
        .from('intelligence_events')
        .insert({
          event_type: 'threat_indicator',
          raw_data: {
            value: cleanVal,
            category,
            reputation: 1,
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          }
        });
    }
  } catch (err: any) {
    console.error('Threat intelligence recording failure:', err.message);
  }
}
