import '../global.css';
import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

function AuthGate({ session }: { session: Session | null }) {
  const router = useRouter();
  const segments = useSegments();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    // Reset state on every session change to avoid stale values
    // when a user signs out and a different account signs in.
    setProfileChecked(false);
    setProfileComplete(false);

    if (!session) {
      setProfileChecked(true);
      return;
    }
    // Check profile completion status
    supabase
      .from('profiles')
      .select('profile_completed, safety_onboarding_completed')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.profile_completed && data?.safety_onboarding_completed) {
          setProfileComplete(true);
        }
        setProfileChecked(true);
      })
      .catch(() => {
        setProfileChecked(true);
      });
  }, [session]);

  useEffect(() => {
    if (!profileChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session) {
      // Not signed in — redirect to welcome
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
    } else if (profileComplete) {
      // Signed in and profile complete — go to tabs
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    } else {
      // Signed in but onboarding not done
      if (!inAuthGroup) {
        router.replace('/(auth)/onboarding-profile');
      }
    }
  }, [session, profileChecked, profileComplete, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthGate session={session} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
