import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/lib/types';
import { ACTIVITY_TYPES, ACTIVITY_CONFIG } from '@/lib/constants';
import type { ActivityType } from '@/lib/types';

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

export default function OnboardingInterests() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<ActivityType>>(new Set());
  const [error, setError] = useState('');

  const toggle = (activity: ActivityType) => {
    setError('');
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(activity)) {
        next.delete(activity);
      } else {
        next.add(activity);
      }
      return next;
    });
  };

  const handleNext = async () => {
    if (selected.size === 0) {
      setError('Pick at least one activity.');
      return;
    }

    await AsyncStorage.setItem('hangout_interests', JSON.stringify(Array.from(selected)));
    router.push('/(auth)/onboarding-safety');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ProgressDots current={2} total={3} />
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>What are you usually down for?</Text>
          <Text style={styles.subtitle}>Pick everything that fits. You can change this later.</Text>

          {/* Activity grid */}
          <View style={styles.grid}>
            {ACTIVITY_TYPES.map((activity) => {
              const config = ACTIVITY_CONFIG[activity];
              const isSelected = selected.has(activity);
              return (
                <Pressable
                  key={activity}
                  style={({ pressed }) => [
                    styles.pill,
                    isSelected ? styles.pillSelected : styles.pillUnselected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => toggle(activity)}
                >
                  <Text style={styles.pillEmoji}>{config.emoji}</Text>
                  <Text
                    style={[
                      styles.pillText,
                      isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                    ]}
                  >
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Selection count */}
          {selected.size > 0 && (
            <Text style={styles.selectionCount}>{selected.size} selected</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1.5,
  },
  pillSelected: {
    backgroundColor: `${COLORS.accent}20`,
    borderColor: COLORS.accent,
  },
  pillUnselected: {
    backgroundColor: COLORS.card2,
    borderColor: COLORS.border,
  },
  pillEmoji: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: COLORS.accent,
  },
  pillTextUnselected: {
    color: COLORS.muted,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
  selectionCount: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
