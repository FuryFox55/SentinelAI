import { TrustedContact } from '../store';

export interface EmergencyPayload {
  userId: string;
  incidentDetails: string;
  timestamp: string;
  location?: { latitude: number; longitude: number };
}

export const smsProvider = {
  sendEmergencyAlert: async (contacts: TrustedContact[], payload: EmergencyPayload): Promise<{ success: boolean }> => {
    const targets = contacts.filter(c => c.receive_sms);
    console.log(`[SMS Provider Placeholder] Dispatching emergency SMS alerts to ${targets.length} contacts...`);
    targets.forEach(c => {
      console.log(`  -> To: ${c.country_code} ${c.phone_number} (Name: ${c.contact_name})`);
      console.log(`     Message: ALERT: Sentinel AI has triggered Emergency Mode for user ID ${payload.userId}. Details: ${payload.incidentDetails}`);
    });
    return { success: true };
  }
};

export const emailProvider = {
  sendEmergencyAlert: async (contacts: TrustedContact[], payload: EmergencyPayload): Promise<{ success: boolean }> => {
    const targets = contacts.filter(c => c.receive_email && c.email);
    console.log(`[Email Provider Placeholder] Dispatching emergency email alerts to ${targets.length} contacts...`);
    targets.forEach(c => {
      console.log(`  -> To: ${c.email} (Name: ${c.contact_name})`);
      console.log(`     Subject: SENTINEL AI - EMERGENCY ALARM`);
      console.log(`     Body: Emergency Mode triggered for user ID ${payload.userId}. Incident description: ${payload.incidentDetails}`);
    });
    return { success: true };
  }
};

export const pushProvider = {
  sendEmergencyAlert: async (contacts: TrustedContact[], payload: EmergencyPayload): Promise<{ success: boolean }> => {
    const targets = contacts.filter(c => c.receive_push);
    console.log(`[Push Provider Placeholder] Dispatching emergency push notifications to ${targets.length} contacts...`);
    targets.forEach(c => {
      console.log(`  -> To Contact: ${c.contact_name} (Preferred method: ${c.preferred_contact_method})`);
      console.log(`     Payload: { title: "Emergency Lockdown Active", message: "${payload.incidentDetails}" }`);
    });
    return { success: true };
  }
};

export const locationSharingProvider = {
  shareLiveLocation: async (contacts: TrustedContact[], location: { latitude: number; longitude: number }): Promise<{ success: boolean }> => {
    const targets = contacts.filter(c => c.receive_location);
    console.log(`[Location Sharing Provider Placeholder] Initializing secure telemetry location channel for ${targets.length} contacts...`);
    targets.forEach(c => {
      console.log(`  -> Streaming live coordinates to: ${c.country_code} ${c.phone_number}`);
      console.log(`     Coords: Latitude = ${location.latitude}, Longitude = ${location.longitude}`);
    });
    return { success: true };
  }
};

export const emergencyCallService = {
  initiateRobocall: async (contacts: TrustedContact[], payload: EmergencyPayload): Promise<{ success: boolean }> => {
    // Standard procedure: call primary contact or highest priority first
    const primary = contacts.find(c => c.is_primary) || contacts[0];
    if (primary) {
      console.log(`[Emergency Call Service Placeholder] Initiating emergency robocall route to primary responder...`);
      console.log(`  -> Dialing: ${primary.country_code} ${primary.phone_number} (Name: ${primary.contact_name})`);
      console.log(`     Audio Payload: "This is Sentinel AI security alert. Emergency mode triggered for contact. Please verify identity."`);
    } else {
      console.log(`[Emergency Call Service Placeholder] No emergency contact configured for voice routing.`);
    }
    return { success: true };
  }
};
