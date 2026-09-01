'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';

import { ThemeProvider } from '@/theme/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { isAuthenticated, login, logout } = useAppStore();

  useEffect(() => {
    // 0. Initial theme apply from localStorage
    const savedTheme = localStorage.getItem('theme_preference') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    const fetchProfile = async (userId: string) => {
      // 1. Try fetching from user_profiles (new schema)
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        if (data && !error) return data;
      } catch (err) {
        console.warn('user_profiles fetch failed, trying profiles:', err);
      }

      // 2. Try fetching from profiles (old schema)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (data && !error) {
          return {
            full_name: data.display_name,
            phone: data.phone_number,
            role: data.role,
            theme: 'light' // default
          };
        }
      } catch (err) {
        console.warn('profiles fetch failed:', err);
      }

      return null;
    };

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data }: any) => {
      const session = data?.session;
      const store = useAppStore.getState();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        store.login(
          session.user.id,
          session.user.email || '',
          profile?.full_name || session.user.user_metadata?.full_name || session.user.raw_user_meta_data?.full_name || session.user.email?.split('@')[0] || 'User',
          profile?.phone || session.user.phone || session.user.user_metadata?.phone || session.user.raw_user_meta_data?.phone || ''
        );
      } else {
        store.logout();
      }
      setAuthChecked(true);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const store = useAppStore.getState();
      
      // Handle password recovery event
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/profile?recovery=true');
        return;
      }

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        store.login(
          session.user.id,
          session.user.email || '',
          profile?.full_name || session.user.user_metadata?.full_name || session.user.raw_user_meta_data?.full_name || session.user.email?.split('@')[0] || 'User',
          profile?.phone || session.user.phone || session.user.user_metadata?.phone || session.user.raw_user_meta_data?.phone || ''
        );
      } else {
        if (store.isAuthenticated) {
          store.logout();
        }
      }
      setAuthChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 3. Routing Guard
  useEffect(() => {
    if (!authChecked) return;

    const protectedPaths = [
      '/dashboard',
      '/protection',
      '/monitoring',
      '/profile',
      '/emergency',
      '/command-center',
      '/assistant',
      '/setup'
    ];
    const guestPaths = ['/login', '/register', '/'];

    const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
    const isGuest = guestPaths.some((p) => pathname === p);

    if (isProtected && !isAuthenticated) {
      router.push('/login');
    } else if (isGuest && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [pathname, isAuthenticated, authChecked, router]);

  // Loading Screen for Protected Pages
  const protectedPaths = [
    '/dashboard',
    '/protection',
    '/monitoring',
    '/profile',
    '/emergency',
    '/command-center',
    '/assistant',
    '/setup'
  ];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isProtected && !authChecked) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#060e17] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase animate-pulse">Initializing Security Core...</span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
