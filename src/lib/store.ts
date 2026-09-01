import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

export interface TrustedContact {
  id: string;
  user_id: string;
  contact_name: string;
  country_code: string;
  phone_number: string;
  email: string | null;
  relationship: string | null;
  priority: number;
  preferred_contact_method: 'sms' | 'email' | 'push';
  receive_sms: boolean;
  receive_email: boolean;
  receive_push: boolean;
  receive_location: boolean;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScanResult {
  id: string;
  module: string;
  timestamp: string;
  status: 'clean' | 'threat';
  score: number;
  aiConfidence: number;
  threatLevel: 'Secure' | 'Warning' | 'Critical';
  evidence: string[];
  recommendations: string[];
  explanation: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  status: 'unresolved' | 'resolved';
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  source: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  timestamp: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  evidenceSummary: string;
  pcapDetails?: string;
  phoneNo?: string;
  location?: string;
  sharedWith: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  date_format: string;
  time_format: string;
  dashboard_layout: string;
  animations_enabled: boolean;
  accessibility_preferences: Record<string, any>;
}

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    avatar: string;
  } | null;
  login: (id: string, email: string, name: string, phone: string) => void;
  logout: () => void;
  updateUsername: (name: string) => Promise<void>;

  // User Preferences
  preferences: UserPreferences | null;
  loadPreferences: (userId: string) => Promise<void>;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  setPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;

  // Security Status & Config
  protectionScore: number;
  fraudConfidenceIndex: number;
  threatLevel: 'Secure' | 'Warning' | 'Critical';
  activeProtections: Record<string, boolean>;
  alerts: SecurityAlert[];
  scanLogs: ScanResult[];
  toggleProtection: (key: string) => Promise<void>;
  addAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'status'>) => void;
  resolveAlert: (id: string) => void;
  addScanResult: (result: ScanResult) => void;
  recalculateScore: () => Promise<void>;

  // Live Call Simulator
  callActive: boolean;
  callContactName: string;
  callNumber: string;
  callDuration: number;
  callConfidenceIndex: number;
  callAIObservations: string[];
  callTimeline: Array<{ time: string; text: string; risk: boolean }>;
  callOverlayActive: boolean;
  callVoiceMode: 'Securing' | 'Suspicious' | 'Critical Vishing' | 'Clean';
  startCallSimulation: (number?: string, name?: string) => void;
  tickCallDuration: () => void;
  addCallObservation: (obs: string, risk?: boolean) => void;
  updateCallFraudIndex: (index: number) => void;
  endCallSimulation: () => void;
  setOverlayActive: (active: boolean) => void;

  // Emergency Mode
  emergencyActive: boolean;
  lockdownEnabled: boolean;
  trustedContacts: string[];
  emergencyReports: Array<{ id: string; timestamp: string; details: string; contactsNotified: string[] }>;
  triggerEmergencyMode: (incidentDetails: string) => Promise<void>;
  toggleLockdown: () => void;
  addTrustedContact: (phone: string) => Promise<void>;
  removeTrustedContact: (phone: string) => Promise<void>;
  resetEmergencyMode: () => void;

  // AI Assistant
  assistantMessages: Message[];
  addAssistantMessage: (text: string, sender: 'user' | 'assistant') => void;
  clearAssistantHistory: () => void;

  // Command Center (Enterprise side)
  incidents: Incident[];
  governmentIntegrations: Record<string, 'Connected' | 'Syncing' | 'Not Connected'>;
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'status' | 'sharedWith'>) => void;
  resolveIncident: (id: string) => void;
  shareIncidentWithGovt: (incidentId: string, agency: string) => void;
  updateGovtStatus: (agency: string, status: 'Connected' | 'Syncing' | 'Not Connected') => void;

  // Syncing & Database Integration
  syncWithDatabase: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Authentication State (Default is logged out)
      isAuthenticated: false,
      user: null,
      preferences: null,

      login: (id, email, name, phone) => {
        set({
          isAuthenticated: true,
          user: {
            id,
            email,
            name,
            phone,
            avatar: name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SR'
          }
        });
        get().loadPreferences(id);
      },

      logout: () => {
        supabase.auth.signOut().catch(() => {});
        set({ isAuthenticated: false, user: null, preferences: null });
      },

      loadPreferences: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            const theme = data.theme || 'light';
            set({ preferences: {
              theme: theme,
              language: data.language || 'en',
              date_format: data.date_format || 'YYYY-MM-DD',
              time_format: data.time_format || '24h',
              dashboard_layout: data.dashboard_layout || 'grid',
              animations_enabled: data.animations_enabled !== false,
              accessibility_preferences: data.accessibility_preferences || {}
            }});
            
            localStorage.setItem('theme_preference', theme);
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            } else {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
            }
          } else {
            // Create defaults
            const defaultPrefs = {
              user_id: userId,
              theme: 'light',
              language: 'en',
              date_format: 'YYYY-MM-DD',
              time_format: '24h',
              dashboard_layout: 'grid',
              animations_enabled: true,
              accessibility_preferences: {}
            };
            const { data: inserted } = await supabase
              .from('user_preferences')
              .insert(defaultPrefs)
              .select()
              .single();

            if (inserted) {
              set({ preferences: {
                theme: inserted.theme,
                language: inserted.language,
                date_format: inserted.date_format,
                time_format: inserted.time_format,
                dashboard_layout: inserted.dashboard_layout,
                animations_enabled: inserted.animations_enabled,
                accessibility_preferences: inserted.accessibility_preferences
              }});
            }
          }
        } catch (e) {
          console.warn('Failed to load user preferences:', e);
          const localTheme = (localStorage.getItem('theme_preference') as 'light' | 'dark') || 'light';
          set({
            preferences: {
              theme: localTheme,
              language: 'en',
              date_format: 'YYYY-MM-DD',
              time_format: '24h',
              dashboard_layout: 'grid',
              animations_enabled: true,
              accessibility_preferences: {}
            }
          });
        }
      },

      setPreference: async (key, value) => {
        const currentPrefs = get().preferences;
        if (!currentPrefs) return;

        const updatedPrefs = {
          ...currentPrefs,
          [key]: value
        };
        set({ preferences: updatedPrefs });

        if (key === 'theme') {
          localStorage.setItem('theme_preference', value as string);
          if (value === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          }
        }

        const user = get().user;
        if (user && typeof window !== 'undefined' && navigator.onLine) {
          try {
            await supabase
              .from('user_preferences')
              .update({ [key]: value, updated_at: new Date().toISOString() })
              .eq('user_id', user.id);
          } catch (e) {
            console.warn(`Failed to update preference ${key} in database:`, e);
          }
        }
      },

      setPreferences: async (prefs) => {
        const currentPrefs = get().preferences;
        if (!currentPrefs) return;

        const updatedPrefs = {
          ...currentPrefs,
          ...prefs
        };
        set({ preferences: updatedPrefs });

        if (prefs.theme) {
          localStorage.setItem('theme_preference', prefs.theme);
          if (prefs.theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          }
        }

        const user = get().user;
        if (user && typeof window !== 'undefined' && navigator.onLine) {
          try {
            await supabase
              .from('user_preferences')
              .update({ ...prefs, updated_at: new Date().toISOString() })
              .eq('user_id', user.id);
          } catch (e) {
            console.warn('Failed to update preferences in database:', e);
          }
        }
      },

      updateUsername: async (name) => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            name,
            avatar: name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SR'
          }
        });
        
        try {
          await supabase.auth.updateUser({ data: { full_name: name } });
        } catch (e) {
          console.warn('Failed to update auth metadata:', e);
        }

        if (typeof window !== 'undefined' && navigator.onLine) {
          // Update user_profiles table (production schema)
          try {
            await supabase
              .from('user_profiles')
              .update({ full_name: name })
              .eq('user_id', user.id);
          } catch (e) {
            console.warn('Failed to update user_profiles in database:', e);
          }
        }
      },

      // Security Status Setup
      protectionScore: 92,
      fraudConfidenceIndex: 8,
      threatLevel: 'Secure',
      activeProtections: {
        backgroundAI: true,
        liveCallMonitor: true,
        liveOverlay: true,
        screenshotScanner: false,
        urlBlocker: true,
        voiceBiometrics: true,
        documentShield: true,
        qrAnalysis: true
      },
      alerts: [
        {
          id: 'alert-1',
          title: 'UPI Phishing Link Intercepted',
          description: 'A suspicious UPI payment gateway redirection link was blocked in SMS inbox.',
          type: 'URL Scan',
          severity: 'high',
          timestamp: '2 hours ago',
          status: 'resolved'
        },
        {
          id: 'alert-2',
          title: 'Simulated Threat: High Fraud Call',
          description: 'Live Audio matching known Telemarketer Spoofing signatures identified.',
          type: 'Voice Scan',
          severity: 'medium',
          timestamp: '1 day ago',
          status: 'resolved'
        }
      ],
      scanLogs: [
        {
          id: 'scan-1',
          module: 'URL Scanner',
          timestamp: '2 hours ago',
          status: 'clean',
          score: 4,
          aiConfidence: 99,
          threatLevel: 'Secure',
          evidence: ['SSL certificate matches HDFC bank official signature', 'Domain age is 4 years', 'No phishing listings found in PhishTank'],
          recommendations: ['Always check that the URL starts with https://', 'Do not enter passwords on external links'],
          explanation: 'The checked domain is valid and verified as belonging to the official banking portal.'
        }
      ],

      toggleProtection: async (key) => {
        const active = !get().activeProtections[key];
        set((state) => ({
          activeProtections: {
            ...state.activeProtections,
            [key]: active
          }
        }));
        await get().recalculateScore();

        // Write preferences to Supabase if connected
        const user = get().user;
        if (user && typeof window !== 'undefined' && navigator.onLine) {
          try {
            await supabase
              .from('user_profiles')
              .update({ preferences: get().activeProtections })
              .eq('user_id', user.id);
          } catch (e) {
            console.warn('Failed to upload user preferences to database:', e);
          }
        }
      },

      addAlert: (alert) => set((state) => {
        const newAlert: SecurityAlert = {
          ...alert,
          id: `alert-${Date.now()}`,
          timestamp: 'Just now',
          status: 'unresolved'
        };
        return {
          alerts: [newAlert, ...state.alerts],
          threatLevel: alert.severity === 'high' ? 'Critical' : alert.severity === 'medium' ? 'Warning' : state.threatLevel
        };
      }),

      resolveAlert: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a)
      })),

      addScanResult: (result) => set((state) => ({
        scanLogs: [result, ...state.scanLogs]
      })),

      recalculateScore: async () => {
        const activeCount = Object.values(get().activeProtections).filter(Boolean).length;
        const totalCount = Object.keys(get().activeProtections).length;
        const baseScore = Math.round((activeCount / totalCount) * 40) + 60; // minimum score 60, maximum 100
        
        let threatDeduction = 0;
        const activeThreats = get().alerts.filter(a => a.status === 'unresolved');
        activeThreats.forEach(t => {
          if (t.severity === 'high') threatDeduction += 15;
          else if (t.severity === 'medium') threatDeduction += 8;
          else threatDeduction += 3;
        });

        const finalScore = Math.max(10, Math.min(100, baseScore - threatDeduction));
        const threatLevel = finalScore > 85 ? 'Secure' : finalScore > 65 ? 'Warning' : 'Critical';

        set({
          protectionScore: finalScore,
          threatLevel,
          fraudConfidenceIndex: Math.round(100 - finalScore)
        });

        // Write score back to Supabase user profiles
        const user = get().user;
        if (user && typeof window !== 'undefined' && navigator.onLine) {
          try {
            await supabase
              .from('user_profiles')
              .update({ protection_score: finalScore })
              .eq('user_id', user.id);
          } catch (e) {
            console.warn('Failed to upload user protection score to database:', e);
          }
        }
      },

      // Live Call Simulator setup
      callActive: false,
      callContactName: 'Unknown Caller',
      callNumber: '+91 98765 00000',
      callDuration: 0,
      callConfidenceIndex: 12,
      callAIObservations: [],
      callTimeline: [],
      callOverlayActive: false,
      callVoiceMode: 'Clean',

      startCallSimulation: (number = '+91 95382 10928', name = 'SBI Customer Service Desk') => set({
        callActive: true,
        callContactName: name,
        callNumber: number,
        callDuration: 0,
        callConfidenceIndex: 15,
        callAIObservations: ['Caller identified via local Telecom database'],
        callTimeline: [{ time: '00:00', text: 'Call connected', risk: false }],
        callVoiceMode: 'Securing'
      }),

      tickCallDuration: () => set((state) => ({ callDuration: state.callDuration + 1 })),

      addCallObservation: (obs, risk = false) => set((state) => {
        const formattedDuration = `${Math.floor(state.callDuration / 60).toString().padStart(2, '0')}:${(state.callDuration % 60).toString().padStart(2, '0')}`;
        return {
          callAIObservations: [obs, ...state.callAIObservations],
          callTimeline: [...state.callTimeline, { time: formattedDuration, text: obs, risk }]
        };
      }),

      updateCallFraudIndex: (index) => set((state) => {
        let mode: 'Securing' | 'Suspicious' | 'Critical Vishing' | 'Clean' = 'Clean';
        if (index > 75) mode = 'Critical Vishing';
        else if (index > 40) mode = 'Suspicious';
        else if (index > 15) mode = 'Securing';
        
        if (index >= 70 && !state.emergencyActive) {
          const title = `Vishing Attack Attempt: ${state.callContactName}`;
          const existing = state.incidents.find(i => i.phoneNo === state.callNumber);
          if (!existing) {
            setTimeout(() => {
              get().addIncident({
                title,
                source: 'Live Call Monitoring',
                severity: 'high',
                confidence: index,
                phoneNo: state.callNumber,
                location: 'New Delhi, India',
                evidenceSummary: `Active social engineering call detected. Script matched known financial scam templates. Requested remote-desktop access & OTP verification.`
              });
            }, 100);
          }
        }

        return {
          callConfidenceIndex: index,
          callVoiceMode: mode
        };
      }),

      endCallSimulation: () => set({
        callActive: false,
        callOverlayActive: false
      }),

      setOverlayActive: (active) => set({ callOverlayActive: active }),

      // Emergency Mode
      emergencyActive: false,
      lockdownEnabled: false,
      trustedContacts: [],
      emergencyReports: [],

      triggerEmergencyMode: async (incidentDetails) => {
        const report = {
          id: `report-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          details: incidentDetails,
          contactsNotified: [...get().trustedContacts]
        };
        
        set((state) => ({
          emergencyActive: true,
          lockdownEnabled: true,
          emergencyReports: [report, ...state.emergencyReports]
        }));

        const user = get().user;
        if (user && typeof window !== 'undefined' && navigator.onLine) {
          try {
            // Write emergency event in the database
            await supabase.from('protection_history').insert({
              user_id: user.id,
              module: 'SOS Emergency System',
              status: 'Lockdown Triggered',
              threat_level: 'Critical',
              fraud_confidence: 100,
              summary: `User SOS manual trigger: ${incidentDetails}`
            });

            await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'Emergency SOS Broadcasted',
              message: 'Trusted contacts notified. Safety protocols active.',
              type: 'emergency'
            });
          } catch (e) {
            console.warn('Failed to submit emergency logs to database:', e);
          }
        }
      },

      toggleLockdown: () => set((state) => ({ lockdownEnabled: !state.lockdownEnabled })),

      addTrustedContact: async (phone) => {
        set((state) => ({ trustedContacts: [...state.trustedContacts, phone] }));
        
        const user = get().user;
        if (user && typeof window !== 'undefined' && navigator.onLine) {
          try {
            await supabase.from('trusted_contacts').insert({
              user_id: user.id,
              contact_name: 'Contact',
              contact_phone: phone,
              verified: true
            });
          } catch (e) {
            console.warn('Failed to upload trusted contact to database:', e);
          }
        }
      },

      removeTrustedContact: async (phone) => {
        set((state) => ({ trustedContacts: state.trustedContacts.filter(c => c !== phone) }));

        const user = get().user;
        if (user && typeof window !== 'undefined' && navigator.onLine) {
          try {
            await supabase
              .from('trusted_contacts')
              .delete()
              .eq('user_id', user.id)
              .eq('contact_phone', phone);
          } catch (e) {
            console.warn('Failed to delete trusted contact from database:', e);
          }
        }
      },

      resetEmergencyMode: () => set({ emergencyActive: false, lockdownEnabled: false }),

      // AI Assistant Setup
      assistantMessages: [
        {
          id: '1',
          sender: 'assistant',
          text: 'Hello, I am Sentinel AI. I am scanning your system in the background. You are fully secure. How can I help you today?',
          timestamp: '10:00 AM'
        }
      ],
      addAssistantMessage: (text, sender) => set((state) => ({
        assistantMessages: [
          ...state.assistantMessages,
          {
            id: `msg-${Date.now()}`,
            sender,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      })),
      clearAssistantHistory: () => set({ assistantMessages: [] }),

      // Command Center Incidents Queue
      incidents: [
        {
          id: 'inc-1',
          title: 'Suspicious UPI Merchant Account Blocked',
          source: 'Background URL Pipeline',
          severity: 'medium',
          confidence: 84,
          timestamp: '3 hours ago',
          status: 'Investigating',
          evidenceSummary: 'UPI Merchant ID "scan.quickpay@hdfc" was flagged for sudden transaction velocity and mismatched QR signature.',
          location: 'Bengaluru, Karnataka',
          sharedWith: ['RBI Cyber Cell', 'Financial Intelligence Unit']
        },
        {
          id: 'inc-2',
          title: 'SMS Phishing Network Detected',
          source: 'Aggregated Threat Feed',
          severity: 'high',
          confidence: 96,
          timestamp: '5 hours ago',
          status: 'Open',
          evidenceSummary: 'Bulk SMS sender ID "AD-SBIKCC" broadcasting fake KCC loan waiver links in regional scripts (Hindi, Kannada).',
          phoneNo: '1930 Blocklist',
          location: 'Jamtara, Jharkhand',
          sharedWith: ['I4C Portal']
        }
      ],
      governmentIntegrations: {
        cyberCrimeDept: 'Connected',
        lawEnforcement: 'Connected',
        banks: 'Connected',
        certIn: 'Connected'
      },

      addIncident: (inc) => set((state) => {
        const newInc: Incident = {
          ...inc,
          id: `inc-${Date.now()}`,
          timestamp: 'Just now',
          status: 'Open',
          sharedWith: []
        };
        return {
          incidents: [newInc, ...state.incidents]
        };
      }),

      resolveIncident: (id) => set((state) => ({
        incidents: state.incidents.map(i => i.id === id ? { ...i, status: 'Resolved' } : i)
      })),

      shareIncidentWithGovt: (incidentId, agency) => set((state) => ({
        incidents: state.incidents.map(i => {
          if (i.id === incidentId) {
            return {
              ...i,
              sharedWith: i.sharedWith.includes(agency) ? i.sharedWith : [...i.sharedWith, agency]
            };
          }
          return i;
        })
      })),

      updateGovtStatus: (agency, status) => set((state) => ({
        governmentIntegrations: {
          ...state.governmentIntegrations,
          [agency]: status
        }
      })),

      // Synchronize offline additions/preferences with database on reconnect
      syncWithDatabase: async () => {
        const user = get().user;
        if (!user || typeof window === 'undefined' || !navigator.onLine) return;

        try {
          // 1. Sync active protections (preferences)
          await supabase
            .from('user_profiles')
            .update({ preferences: get().activeProtections })
            .eq('user_id', user.id);

          // 2. Sync trusted contacts (fetch from database to resolve difference)
          const { data: contacts } = await supabase
            .from('trusted_contacts')
            .select('contact_phone')
            .eq('user_id', user.id);

          const dbPhones = contacts?.map((c: any) => c.contact_phone) || [];
          const localPhones = get().trustedContacts;

          for (const phone of localPhones) {
            if (!dbPhones.includes(phone)) {
              await supabase.from('trusted_contacts').insert({
                user_id: user.id,
                contact_name: 'Contact',
                contact_phone: phone,
                verified: true
              });
            }
          }

          const { data: finalContacts } = await supabase
            .from('trusted_contacts')
            .select('contact_phone')
            .eq('user_id', user.id);

          if (finalContacts) {
            set({ trustedContacts: finalContacts.map((c: any) => c.contact_phone) });
          }

          console.log('[Sentinel Sync] Successfully synchronized offline cache with Supabase.');
        } catch (err: any) {
          console.warn('[Sentinel Sync] Offline synchronization failed:', err.message);
        }
      }
    }),
    {
      name: 'sentinel-secure-cache',
      // Explicitly pick ONLY non-sensitive properties to persist
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        preferences: state.preferences,
        activeProtections: state.activeProtections,
        alerts: state.alerts,
        scanLogs: state.scanLogs,
        assistantMessages: state.assistantMessages,
        trustedContacts: state.trustedContacts,
        emergencyReports: state.emergencyReports
      })
    }
  )
);

// Offline-online network status listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().syncWithDatabase();
  });
}
