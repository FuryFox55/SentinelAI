'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ArrowLeft,
  Settings,
  Grid,
  Bot,
  Plus,
  CheckCircle,
  LogOut,
  User,
  Users,
  Lock,
  Smartphone,
  Volume2,
  Bell,
  Key,
  Eye,
  Sliders,
  Download,
  BarChart3,
  Database,
  HelpCircle,
  Info,
  Trash2,
  Edit,
  Check,
  ChevronDown,
  ChevronUp,
  Mail,
  Globe,
  Camera,
  Activity,
  Heart,
  AlertTriangle,
  Moon,
  Sun,
  Copy
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { startSimulatedPhoneCall } from '@/lib/services/intelligence';
import { BottomNavigation } from '@/components/BottomNavigation';

// Interfaces for structured preferences
interface NotificationPrefs {
  threatAlerts: boolean;
  criticalAlerts: boolean;
  emergencyAlerts: boolean;
  analysisComplete: boolean;
  weeklyReport: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
  systemMaintenance: boolean;
}

interface AIPrefs {
  aiResponseLength: 'short' | 'detailed' | 'verbose';
  explainableAILevel: 'low' | 'medium' | 'high';
  preferredAILanguage: string;
  autoSaveReports: boolean;
  rememberChatContext: boolean;
  aiPersonalization: boolean;
}

interface GeneralPrefs {
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  defaultDashboardView: 'overview' | 'detailed';
  animationPreferences: boolean;
  accessibilityOptions: boolean;
}

interface EmergencyPrefs {
  emergencyMode: boolean;
  automaticSOS: boolean;
  shareLiveLocation: boolean;
  emergencyAlertDelay: number;
  trustedContactPriority: boolean;
  emergencyNotifications: boolean;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  country: string;
  language: string;
  theme: 'light' | 'dark';
  protection_score: number;
  role: string;
  created_at: string;
  updated_at: string;
  notification_preferences: NotificationPrefs;
  preferences: GeneralPrefs & AIPrefs & EmergencyPrefs;
}

interface TrustedContact {
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
}

export default function SecuritySettingsCenter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, preferences, setPreference } = useAppStore();

  // Expanded sections state
  const [expandedSection, setExpandedSection] = useState<string | null>('account');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Listen to search params for password recovery link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('recovery') === 'true') {
        setExpandedSection('security');
        showToast('Password recovery mode active. Please choose a new secure password.', 'success');
        setTimeout(() => {
          const el = document.getElementById('security-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }
  }, []);

  // Edit states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  // Password edit state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCountryCode, setContactCountryCode] = useState('+91');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRelationship, setContactRelationship] = useState('Family');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);
  const [contactPreferredMethod, setContactPreferredMethod] = useState<'sms' | 'email' | 'push'>('sms');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // React Query: Fetch user profile
  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery<UserProfile | null>({
    queryKey: ['user_profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch notice:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  // React Query: Fetch trusted contacts
  const { data: contacts, isLoading: isContactsLoading } = useQuery<TrustedContact[]>({
    queryKey: ['trusted_contacts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (error) {
        console.warn('Contacts fetch notice:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  // Initialize editing state when profile is loaded
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '');
      setEditPhone(profile.phone || '');
      setEditCountry(profile.country || 'India');
      setEditLanguage(profile.language || 'en');
    }
  }, [profile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user_profile', user?.id], data);
      showToast('Settings saved successfully!');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save settings.', 'error');
    }
  });

  const upsertContactMutation = useMutation({
    mutationFn: async (contactData: Omit<TrustedContact, 'id' | 'user_id'> & { id?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      if (contactData.id) {
        // Update
        const { error } = await supabase
          .from('trusted_contacts')
          .update({
            contact_name: contactData.contact_name,
            country_code: contactData.country_code,
            phone_number: contactData.phone_number,
            email: contactData.email,
            relationship: contactData.relationship,
            preferred_contact_method: contactData.preferred_contact_method,
            is_primary: contactData.is_primary,
            updated_at: new Date().toISOString()
          })
          .eq('id', contactData.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('trusted_contacts')
          .insert({
            user_id: user.id,
            contact_name: contactData.contact_name,
            country_code: contactData.country_code,
            phone_number: contactData.phone_number,
            email: contactData.email,
            relationship: contactData.relationship,
            preferred_contact_method: contactData.preferred_contact_method,
            is_primary: contactData.is_primary,
            priority: 1
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted_contacts', user?.id] });
      showToast(editingContactId ? 'Contact updated!' : 'Contact added successfully!');
      resetContactForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to modify contact.', 'error');
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('trusted_contacts')
        .delete()
        .eq('id', contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted_contacts', user?.id] });
      showToast('Contact removed successfully.');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete contact.', 'error');
    }
  });

  const resetContactForm = () => {
    setContactName('');
    setContactPhone('');
    setContactCountryCode('+91');
    setContactEmail('');
    setContactRelationship('Family');
    setContactIsPrimary(false);
    setContactPreferredMethod('sms');
    setEditingContactId(null);
    setShowContactForm(false);
  };

  const handleToggleTheme = () => {
    const currentTheme = preferences?.theme || profile?.theme || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set in Zustand store (handles DOM classes, localStorage, user_preferences table)
    setPreference('theme', nextTheme);
    
    // Also sync user_profiles table theme column for legacy support
    if (profile) {
      updateProfileMutation.mutate({ theme: nextTheme });
    }
  };

  const handleSaveAccountInfo = () => {
    if (!editName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    updateProfileMutation.mutate({
      full_name: editName,
      phone: editPhone,
      country: editCountry,
      language: editLanguage
    });
    setIsEditingAccount(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      showToast('Name and Phone are required', 'error');
      return;
    }
    upsertContactMutation.mutate({
      id: editingContactId || undefined,
      contact_name: contactName,
      country_code: contactCountryCode,
      phone_number: contactPhone,
      email: contactEmail || null,
      relationship: contactRelationship,
      preferred_contact_method: contactPreferredMethod,
      is_primary: contactIsPrimary,
      priority: 1,
      receive_sms: true,
      receive_email: !!contactEmail,
      receive_push: true,
      receive_location: true,
      notes: null
    });
  };

  const handleEditContact = (contact: TrustedContact) => {
    setEditingContactId(contact.id);
    setContactName(contact.contact_name);
    setContactPhone(contact.phone_number);
    setContactCountryCode(contact.country_code || '+91');
    setContactEmail(contact.email || '');
    setContactRelationship(contact.relationship || 'Family');
    setContactIsPrimary(contact.is_primary);
    setContactPreferredMethod(contact.preferred_contact_method);
    setShowContactForm(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const handleClearCache = () => {
    localStorage.clear();
    showToast('Local cache cleared successfully.');
  };

  const handleExportData = (type: string) => {
    const dataToExport = {
      user: user,
      profile: profile,
      contacts: contacts,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_${type}_export.json`;
    a.click();
    showToast(`Exported ${type} data successfully!`);
  };

  // Helper selectors for nested preferences
  const notificationPreferences = profile?.notification_preferences || {
    threatAlerts: true,
    criticalAlerts: true,
    emergencyAlerts: true,
    analysisComplete: true,
    weeklyReport: true,
    productUpdates: false,
    marketingEmails: false,
    systemMaintenance: true
  };

  const generalPreferences = (profile?.preferences as any) || {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    defaultDashboardView: 'overview',
    animationPreferences: true,
    accessibilityOptions: false,
    aiResponseLength: 'detailed',
    explainableAILevel: 'high',
    preferredAILanguage: 'en',
    autoSaveReports: true,
    rememberChatContext: true,
    aiPersonalization: true,
    emergencyMode: false,
    automaticSOS: false,
    shareLiveLocation: true,
    emergencyAlertDelay: 5,
    trustedContactPriority: true,
    emergencyNotifications: true
  };

  const handleTogglePreference = (key: string, section: 'notifications' | 'general') => {
    if (!profile) return;
    if (section === 'notifications') {
      const updated = {
        ...notificationPreferences,
        [key]: !((notificationPreferences as any)[key])
      };
      updateProfileMutation.mutate({ notification_preferences: updated });
    } else {
      const updated = {
        ...generalPreferences,
        [key]: !((generalPreferences as any)[key])
      };
      updateProfileMutation.mutate({ preferences: updated });
    }
  };

  const handleSelectPreference = (key: string, value: any) => {
    if (!profile) return;
    const updated = {
      ...generalPreferences,
      [key]: value
    };
    updateProfileMutation.mutate({ preferences: updated });
  };

  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex flex-col pb-24 relative pt-20">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300 animate-[fadeIn_0.2s_ease-out] ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-success'
            : 'bg-danger/10 border-danger/20 text-danger'
        }`}>
          <Shield className="w-5 h-5" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between px-3 sm:px-6 md:px-8 h-16">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-on-surface hover:bg-surface-container p-2 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-extrabold text-base uppercase tracking-wider text-gradient">Security Settings</h1>
        <button
          onClick={handleLogout}
          className="text-danger hover:bg-danger/10 p-2 rounded-full flex items-center justify-center transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-3 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col gap-4 relative z-10">
        
        {/* Profile score card */}
        <section className="glass-card rounded-2xl p-3.5 sm:p-5 md:p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-[40px] z-0 pointer-events-none"></div>
          
          <div className="relative z-10 w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-black text-primary">
              {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SR'}
            </span>
          </div>

          <div className="relative z-10 flex-grow min-w-0">
            <h2 className="text-base font-black text-text-primary truncate">{profile?.full_name || 'Sentinel Shield User'}</h2>
            <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{profile?.email || user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider">
                SECURITY POSTURE: {profile?.protection_score || 92}%
              </span>
            </div>
          </div>
        </section>

        {/* 11 Settings Sections (Accordions) */}

        {/* Section 1: Account Information */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('account')}
            className="w-full flex items-center justify-between p-3.5 sm:p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <User className="w-4 h-4 text-primary" />
              <span>Account Information</span>
            </span>
            {expandedSection === 'account' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'account' && (
            <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              {isProfileLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" />
                </div>
              ) : isEditingAccount ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:col-span-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Country</label>
                      <input
                        type="text"
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Language</label>
                      <select
                        value={editLanguage}
                        onChange={(e) => setEditLanguage(e.target.value)}
                        className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 md:col-span-2">
                    <button
                      onClick={handleSaveAccountInfo}
                      className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs uppercase transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditingAccount(false)}
                      className="flex-1 py-2.5 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary/60 text-text-primary font-bold text-xs uppercase transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center gap-3 bg-surface-secondary/15 p-3 rounded-xl border border-border/10">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">User ID</span>
                      <span className="text-xs font-mono text-text-primary truncate block w-full">{profile?.user_id || user?.id}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(profile?.user_id || user?.id || '')}
                      className="p-2 hover:bg-surface-secondary/30 rounded-lg text-primary shrink-0"
                      title="Copy User ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Joined Date</span>
                      <span className="font-semibold text-text-primary">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Not available'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Account Role</span>
                      <span className="font-semibold text-primary">{profile?.role || 'Citizen'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Country</span>
                      <span className="font-semibold text-text-primary">{profile?.country || 'India'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Language</span>
                      <span className="font-semibold text-text-primary">{profile?.language?.toUpperCase() || 'EN'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingAccount(true)}
                    className="w-full mt-2 py-2.5 rounded-xl bg-surface-secondary/30 hover:bg-surface-secondary/50 border border-border/10 text-text-primary font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section 2: Security & Privacy */}
        <section id="security-section" className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('security')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-primary" />
              <span>Security & Privacy</span>
            </span>
            {expandedSection === 'security' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'security' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              
              {/* Change password form */}
              <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant md:col-span-2">Change Password</h4>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs uppercase rounded-xl transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              <hr className="border-white/5" />

              {/* Connected components */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">Two-Factor Authentication</span>
                  <span className="text-[9px] font-bold bg-surface-secondary/30 border border-border/10 px-2 py-0.5 rounded-full text-on-surface-variant uppercase tracking-wider">Coming Soon</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">Connected Devices</span>
                  <span className="text-[9px] font-bold bg-surface-secondary/30 border border-border/10 px-2 py-0.5 rounded-full text-on-surface-variant uppercase tracking-wider">Coming Soon</span>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Recent Activity</span>
                  <div className="bg-surface-secondary/10 border border-border/10 rounded-xl p-2.5 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-text-primary">Chrome / Windows (Mumbai, IN)</span>
                      <span className="text-primary font-bold">Current</span>
                    </div>
                    <div className="text-[9px] text-on-surface-variant">Last active: Just now</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleExportData('personal_data')}
                    className="flex-1 py-2 bg-surface-secondary/30 hover:bg-surface-secondary/50 border border-border/10 rounded-xl text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Export Data
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Account deletion request registered. Our support team will reach out shortly.', 'error')}
                    className="flex-1 py-2 bg-danger/10 hover:bg-red-500/15 border border-danger/20 rounded-xl text-danger text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* Section 3: Trusted Contacts */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('contacts')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Users className="w-4 h-4 text-primary" />
              <span>Trusted Contacts</span>
            </span>
            {expandedSection === 'contacts' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'contacts' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              
              {/* Contacts list */}
              {isContactsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-surface-secondary/30 rounded-xl"></div>
                  <div className="h-10 bg-surface-secondary/30 rounded-xl"></div>
                </div>
              ) : (contacts?.length || 0) === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">No trusted contacts added yet.</p>
              ) : (
                <div className="space-y-3">
                  {contacts?.map((contact) => (
                    <div key={contact.id} className="bg-surface-secondary/10 border border-border/10 rounded-xl p-3 flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-text-primary truncate block">{contact.contact_name}</span>
                          {contact.is_primary && (
                            <span className="text-[7px] font-black bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded-full uppercase tracking-wider">Primary</span>
                          )}
                        </div>
                        <span className="block text-[10px] font-mono text-on-surface-variant mt-0.5">
                          {contact.country_code} {contact.phone_number} ({contact.relationship})
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="p-1.5 hover:bg-surface-secondary/30 rounded-lg text-primary"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteContactMutation.mutate(contact.id)}
                          className="p-1.5 hover:bg-danger/10 rounded-lg text-danger"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form / Add Button */}
              {showContactForm ? (
                <form onSubmit={handleSaveContact} className="bg-surface-secondary/15 border border-border/10 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary md:col-span-2">
                    {editingContactId ? 'Edit Contact Details' : 'Add New Trusted Contact'}
                  </h4>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Ram"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-surface-container border border-outline/10 rounded-lg px-2.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:col-span-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">Code</label>
                      <input
                        type="text"
                        value={contactCountryCode}
                        onChange={(e) => setContactCountryCode(e.target.value)}
                        className="w-full bg-surface-container border border-outline/10 rounded-lg px-2.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="98765 55555"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-surface-container border border-outline/10 rounded-lg px-2.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:col-span-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">Relationship</label>
                      <select
                        value={contactRelationship}
                        onChange={(e) => setContactRelationship(e.target.value)}
                        className="w-full bg-surface-container border border-outline/10 rounded-lg px-2 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="Family">Family</option>
                        <option value="Friend">Friend</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">Method</label>
                      <select
                        value={contactPreferredMethod}
                        onChange={(e) => setContactPreferredMethod(e.target.value as any)}
                        className="w-full bg-surface-container border border-outline/10 rounded-lg px-2 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="sms">SMS Alert</option>
                        <option value="email">Email Alert</option>
                        <option value="push">Push Alert</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. family@sentinel.ai"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-surface-container border border-outline/10 rounded-lg px-2.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2 py-1 md:col-span-2">
                    <input
                      type="checkbox"
                      id="contactIsPrimary"
                      checked={contactIsPrimary}
                      onChange={(e) => setContactIsPrimary(e.target.checked)}
                      className="rounded border-outline text-primary focus:ring-primary w-4 h-4 bg-surface-container"
                    />
                    <label htmlFor="contactIsPrimary" className="text-xs text-text-primary select-none">Set as Primary Emergency Contact</label>
                  </div>
                  <div className="flex gap-2 pt-1 md:col-span-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs uppercase"
                    >
                      {editingContactId ? 'Save' : 'Add Contact'}
                    </button>
                    <button
                      type="button"
                      onClick={resetContactForm}
                      className="flex-1 py-2 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary/60 text-text-primary font-bold text-xs uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full py-2.5 rounded-xl bg-surface-secondary/30 hover:bg-surface-secondary/50 border border-border/10 text-text-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  <span>Add Trusted Contact</span>
                </button>
              )}

            </div>
          )}
        </section>

        {/* Section 4: Emergency Settings */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('emergency')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-primary" />
              <span>Emergency Settings</span>
            </span>
            {expandedSection === 'emergency' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'emergency' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Emergency Mode Active</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Activate device lockdown and SOS broadcasts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.emergencyMode}
                    onChange={() => handleTogglePreference('emergencyMode', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Automatic SOS Trigger</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Autosends emergency warnings on critical vishing threat.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.automaticSOS}
                    onChange={() => handleTogglePreference('automaticSOS', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Share Live Location</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Stream GPS coordinates to responders during alert.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.shareLiveLocation}
                    onChange={() => handleTogglePreference('shareLiveLocation', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-text-primary">SOS Trigger Delay</span>
                    <span className="text-[10px] text-primary font-mono font-bold">{generalPreferences.emergencyAlertDelay || 5}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={generalPreferences.emergencyAlertDelay || 5}
                    onChange={(e) => handleSelectPreference('emergencyAlertDelay', parseInt(e.target.value))}
                    className="w-full accent-primary bg-surface-secondary/50 h-1.5 rounded-lg appearance-none"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Trusted Contact Priority</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Alert responders in priority order instead of parallel.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.trustedContactPriority}
                    onChange={() => handleTogglePreference('trustedContactPriority', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Emergency Notifications</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Enable loud push alert tones for security breaches.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.emergencyNotifications}
                    onChange={() => handleTogglePreference('emergencyNotifications', 'general')}
                    className="checkbox-switch"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Notifications */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <span>Notifications Preferences</span>
            </span>
            {expandedSection === 'notifications' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'notifications' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-3.5 text-xs">
                {Object.entries({
                  threatAlerts: 'Live Threat Intercept Signals',
                  criticalAlerts: 'Critical Security Breaches',
                  emergencyAlerts: 'SOS & Lockdown Alert Triggers',
                  analysisComplete: 'AI Scan Process Completions',
                  weeklyReport: 'Weekly Security Diagnostic Reports',
                  productUpdates: 'New Sentinel AI Feature Logs',
                  marketingEmails: 'Cybersecurity Newsletters',
                  systemMaintenance: 'Cloud Service Node Status Alerts'
                }).map(([key, desc]) => (
                  <div key={key} className="flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="block font-semibold text-text-primary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">{desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notificationPreferences as any)[key] || false}
                      onChange={() => handleTogglePreference(key, 'notifications')}
                      className="checkbox-switch"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 6: AI Preferences */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('ai')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Bot className="w-4 h-4 text-primary" />
              <span>AI Preferences</span>
            </span>
            {expandedSection === 'ai' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'ai' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">AI Response Detail Level</label>
                  <select
                    value={generalPreferences.aiResponseLength || 'detailed'}
                    onChange={(e) => handleSelectPreference('aiResponseLength', e.target.value)}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="short">Short (Bullets only)</option>
                    <option value="detailed">Detailed (Standard)</option>
                    <option value="verbose">Verbose (Full analytical trace)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-1">Explainable AI Level</label>
                  <select
                    value={generalPreferences.explainableAILevel || 'high'}
                    onChange={(e) => handleSelectPreference('explainableAILevel', e.target.value)}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="low">Basic indicators only</option>
                    <option value="medium">Medium reasoning breakdown</option>
                    <option value="high">High (Neural activation markers)</option>
                  </select>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Auto Save AI Reports</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Automatically save telemetry analysis to profile.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.autoSaveReports}
                    onChange={() => handleTogglePreference('autoSaveReports', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Remember Chat Context</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Let Grok remember details across conversations.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.rememberChatContext}
                    onChange={() => handleTogglePreference('rememberChatContext', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">AI Personalization</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Tailor AI response vocabulary to your role.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.aiPersonalization}
                    onChange={() => handleTogglePreference('aiPersonalization', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="block font-semibold text-text-primary">Voice Responses</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Synthesize vocal output for threat flags.</span>
                  </div>
                  <span className="text-[9px] font-bold bg-surface-secondary/30 border border-border/10 px-2 py-0.5 rounded-full text-on-surface-variant uppercase tracking-wider">Coming Soon</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 7: Preferences & Settings (Theme Switcher inside) */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('preferences')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-primary" />
              <span>General Preferences</span>
            </span>
            {expandedSection === 'preferences' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'preferences' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-3.5 text-xs">
                
                {/* Theme Switcher */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-input border border-border/30 p-3 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Application Theme</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">Toggle between Light and Dark interface layout.</span>
                  </div>
                  <button
                    onClick={handleToggleTheme}
                    className="flex items-center gap-2 bg-primary/10 border border-primary/20 hover:border-primary/40 px-3.5 py-2 rounded-xl text-primary font-bold text-[10px] uppercase transition-all shadow-md shadow-primary/10 active:scale-95 shrink-0"
                  >
                    {(preferences?.theme || profile?.theme) === 'dark' ? (
                      <>
                        <Sun className="w-3.5 h-3.5" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-1">Date Format</label>
                  <select
                    value={generalPreferences.dateFormat || 'MM/DD/YYYY'}
                    onChange={(e) => handleSelectPreference('dateFormat', e.target.value)}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-1">Time Format</label>
                  <select
                    value={generalPreferences.timeFormat || '12h'}
                    onChange={(e) => handleSelectPreference('timeFormat', e.target.value)}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="12h">12-Hour format (AM/PM)</option>
                    <option value="24h">24-Hour format</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-1">Default Dashboard View</label>
                  <select
                    value={generalPreferences.defaultDashboardView || 'overview'}
                    onChange={(e) => handleSelectPreference('defaultDashboardView', e.target.value)}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="overview">Executive Overview (Recommended)</option>
                    <option value="detailed">Expanded Matrix details</option>
                  </select>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Enable Micro-Animations</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Render smooth graphic waves and pulse indicators.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.animationPreferences}
                    onChange={() => handleTogglePreference('animationPreferences', 'general')}
                    className="checkbox-switch"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">Accessibility Mode</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">Increase container padding and color index contrast.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalPreferences.accessibilityOptions}
                    onChange={() => handleTogglePreference('accessibilityOptions', 'general')}
                    className="checkbox-switch"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 8: Activity & Usage */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('activity')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Activity & Usage Stats</span>
            </span>
            {expandedSection === 'activity' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'activity' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-surface-secondary/10 border border-border/10 rounded-xl p-3">
                  <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Total Scans</span>
                  <span className="text-base font-black text-text-primary">124</span>
                </div>
                <div className="bg-surface-secondary/10 border border-border/10 rounded-xl p-3">
                  <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Threats Blocked</span>
                  <span className="text-base font-black text-danger">12</span>
                </div>
                <div className="bg-surface-secondary/10 border border-border/10 rounded-xl p-3">
                  <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Clear Reports</span>
                  <span className="text-base font-black text-success">112</span>
                </div>
                <div className="bg-surface-secondary/10 border border-border/10 rounded-xl p-3">
                  <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">AI Chats Logged</span>
                  <span className="text-base font-black text-text-primary">37</span>
                </div>
                <div className="bg-surface-secondary/10 border border-border/10 rounded-xl p-3">
                  <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">SOS Triggers</span>
                  <span className="text-base font-black text-text-primary">0</span>
                </div>
                <div className="bg-surface-secondary/10 border border-border/10 rounded-xl p-3">
                  <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Member Since</span>
                  <span className="text-xs font-bold text-primary mt-1 block">July 2026</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 9: Data Management */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('data')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Database className="w-4 h-4 text-primary" />
              <span>Data Management</span>
            </span>
            {expandedSection === 'data' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'data' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-3.5 text-xs animate-[fadeIn_0.2s_ease-out]">
              <button
                onClick={() => handleExportData('threat_reports')}
                className="w-full flex items-center justify-between gap-3 bg-surface-secondary/10 border border-border/10 p-3 rounded-xl hover:bg-surface-secondary/30 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold text-text-primary">Export Threat Reports</span>
                  <span className="text-[9px] text-on-surface-variant block mt-0.5">Download full history in JSON format.</span>
                </div>
                <Download className="w-4 h-4 text-primary shrink-0" />
              </button>

              <button
                onClick={() => handleExportData('chat_history')}
                className="w-full flex items-center justify-between gap-3 bg-surface-secondary/10 border border-border/10 p-3 rounded-xl hover:bg-surface-secondary/30 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold text-text-primary">Export AI Dialogs</span>
                  <span className="text-[9px] text-on-surface-variant block mt-0.5">Download chat conversation history log.</span>
                </div>
                <Download className="w-4 h-4 text-primary shrink-0" />
              </button>

              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-between gap-3 bg-danger/5 border border-danger/10 p-3 rounded-xl hover:bg-danger/10 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold text-danger">Clear Local Storage Cache</span>
                  <span className="text-[9px] text-danger/70 block mt-0.5">Wipe offline files and cached theme registers.</span>
                </div>
                <Trash2 className="w-4 h-4 text-danger shrink-0" />
              </button>
            </div>
          )}
        </section>

        {/* Section 10: Support & Feedback */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('support')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>Support & Feedback</span>
            </span>
            {expandedSection === 'support' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'support' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-3.5 text-xs animate-[fadeIn_0.2s_ease-out]">
              <button
                onClick={() => showToast('Feedback form opened (Placeholder).')}
                className="w-full bg-surface-secondary/10 border border-border/10 p-3 rounded-xl text-left hover:bg-surface-secondary/30 transition-colors block text-text-primary font-semibold"
              >
                Report a Security Bug
              </button>
              <button
                onClick={() => showToast('Feature request form opened (Placeholder).')}
                className="w-full bg-surface-secondary/10 border border-border/10 p-3 rounded-xl text-left hover:bg-surface-secondary/30 transition-colors block text-text-primary font-semibold"
              >
                Request a Custom Shield Node
              </button>
              <button
                onClick={() => showToast('Contact support initialized.')}
                className="w-full bg-surface-secondary/10 border border-border/10 p-3 rounded-xl text-left hover:bg-surface-secondary/30 transition-colors block text-text-primary font-semibold"
              >
                Message Technical Support Staff
              </button>
            </div>
          )}
        </section>

        {/* Section 11: About Sentinel AI */}
        <section className="glass-card rounded-2xl overflow-hidden border border-border/10">
          <button
            onClick={() => toggleSection('about')}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-text-primary focus:outline-none"
          >
            <span className="flex items-center gap-3">
              <Info className="w-4 h-4 text-primary" />
              <span>About Sentinel AI</span>
            </span>
            {expandedSection === 'about' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSection === 'about' && (
            <div className="px-5 pb-5 pt-1 border-t border-border/10 space-y-4 text-xs animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-2 bg-surface-secondary/10 border border-border/10 p-3 rounded-xl font-mono text-[10px] text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span className="text-text-primary">v2.10.9-alpha</span>
                </div>
                <div className="flex justify-between">
                  <span>Database Registry</span>
                  <span className="text-success font-bold">Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Grok Threat Model</span>
                  <span className="text-success font-bold">Model 3.5 Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>License</span>
                  <span className="text-text-primary">Commercial Proprietary</span>
                </div>
              </div>

              <div className="flex justify-around text-[10px] text-primary font-bold">
                <button onClick={() => showToast('Loading Privacy Policy...')} className="hover:underline">Privacy Policy</button>
                <span className="text-text-primary/20">•</span>
                <button onClick={() => showToast('Loading Terms of Service...')} className="hover:underline">Terms of Service</button>
                <span className="text-text-primary/20">•</span>
                <button onClick={() => showToast('Loading Licenses...')} className="hover:underline">OSS Credits</button>
              </div>

              <button
                onClick={() => showToast('Checking central package registries... Your application is up to date!')}
                className="w-full py-2 bg-surface-secondary/30 hover:bg-surface-secondary/50 border border-border/10 text-text-primary font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
              >
                Check for Updates
              </button>
            </div>
          )}
        </section>

      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNavigation activeTab="settings" />
    </div>
  );
}
