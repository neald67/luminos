import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/types';
import { POINTS } from '@/lib/constants';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SafetyCard {
  icon: IoniconName;
  title: string;
  description: string;
  color: string;
}

const SAFETY_CARDS: SafetyCard[] = [
  {
    icon: 'shield-checkmark-outline',
    title: 'Approx location only',
    description: "We never share your exact location with anyone. Other users see a distance range, not your coordinates.",
    color: COLORS.accent,
  },
  {
    icon: 'chatbubble-outline',
    title: 'Plans before DMs',
    description: "You can only message someone after they accept your hangout request.",
    color: COLORS.blue,
  },
  {
    icon: 'location-outline',
    title: 'Meet in public',
    description: "Our AI planner prioritizes public places. Trust your gut.",
    color: '#FF9F0A',
  },
  {
    icon: 'exit-outline',
    title: 'Bail anytime',
    description: "Tap 'Bail safely' to instantly go invisible and end any hangout. No penalty.",
    color: COLORS.accent2,
  },
  {
    icon: 'flag-outline',
    title: 'Report is always free',
    description: "Block and report are never paywalled. Ever.",
    color: COLORS.danger,
  },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressDots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < current ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

export default function OnboardingSafety() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Read stored onboarding data
      const [displayName, username, bio, interests, ageYear] = await AsyncStorage.multiGet([
        'hangout_display_name',
        'hangout_username',
        'hangout_bio',
        'hangout_interests',
        'hangout_age_year',
      ]);

      const parsedInterests: string[] = interests[1] ? JSON.parse(interests[1]) : [];

      // Derive is_18_plus from stored birth year
      const birthYear = ageYear[1] ? parseInt(ageYear[1], 10) : null;
      const currentYear = new Date().getFullYear();
      const is18Plus = birthYear !== null && (currentYear - birthYear) >= 18;

      // Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName[1] ?? '',
          username: username[1] ?? '',
          bio: bio[1] ?? null,
          interests: parsedInterests,
          profile_completed: true,
          safety_onboarding_completed: true,
          profile_theme: 'default',
          map_pin_style: 'default',
          is_18_plus: is18Plus,
          availability_default_radius_miles: 3,
          availability_default_duration_minutes: 60,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Create points wallet with 150 HP
      const totalBonus = POINTS.INITIAL_BALANCE + POINTS.PROFILE_BONUS + POINTS.SAFETY_ONBOARDING_BONUS;
      const { error: walletError } = await supabase
        .from('points_wallets')
        .upsert({
          user_id: user.id,
          balance: totalBonus,
          lifetime_earned: totalBonus,
          lifetime_spent_or_forfeited: 0,
          weekly_score: 0,
          current_streak: 0,
          longest_streak: 0,
          reliability_score: 100,
        });

      if (walletError) throw walletError;

      // Clean up AsyncStorage
      await AsyncStorage.multiRemove([
        'hangout_display_name',
        'hangout_username',
        'hangout_bio',
        'hangout_interests',
        'hangout_age_year',
      ]);

      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ProgressDots current={3} total={3} />
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Before you hang out</Text>
          <Text style={styles.subtitle}>We built Hangout around your safety. Here's what that means.</Text>

          {/* Safety cards */}
          <View style={styles.cardList}>
            {SAFETY_CARDS.map((card, index) => (
              <View key={index} style={styles.card}>
                <View style={[styles.iconWrapper, { backgroundColor: `${card.color}20` }]}>
                  <Ionicons name={card.icon} size={22} color={card.color} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Points bonus callout */}
          <View style={styles.bonusBox}>
            <Ionicons name="flash" size={18} color={COLORS.accent} />
            <Text style={styles.bonusText}>
              You're starting with <Text style={styles.bonusHighlight}>150 Hangout Points</Text> — 100 base + 25 for your profile + 25 for this.
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.finishButton,
            loading && styles.finishButtonDisabled,
            pressed && !loading && styles.pressed,
          ]}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.bg} size="small" />
          ) : (
            <Text style={styles.finishButtonText}>Got it, let's go</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.accent,
  },
  dotInactive: {
    width: 6,
    backgroundColor: COLORS.border,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  scroll: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: -8,
  },
  cardList: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
  bonusBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: `${COLORS.accent}12`,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
  },
  bonusText: {
    color: COLORS.muted,
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  bonusHighlight: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: `${COLORS.danger}40`,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  finishButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
