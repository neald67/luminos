import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ALL_BADGES = [
  'Actually Shows Up',
  'Low Flake Risk',
  'Touch Grass Legend',
  'New Here',
  'Top 10 This Week',
  'Crew Catalyst',
  'Public Place Pro',
  'Host Verified',
] as const;

export type Badge = (typeof ALL_BADGES)[number];

interface BadgeGridProps {
  badges: string[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const earnedSet = new Set(badges);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.grid}>
        {ALL_BADGES.map((badge) => {
          const earned = earnedSet.has(badge);
          return (
            <View
              key={badge}
              style={[styles.pill, earned ? styles.pillEarned : styles.pillLocked]}
            >
              <Text style={[styles.pillText, earned ? styles.pillTextEarned : styles.pillTextLocked]}>
                {earned ? '✓ ' : ''}{badge}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  pillEarned: {
    backgroundColor: 'rgba(0,255,133,0.12)',
    borderColor: '#00FF85',
  },
  pillLocked: {
    backgroundColor: '#15171C',
    borderColor: '#262A31',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextEarned: {
    color: '#00FF85',
  },
  pillTextLocked: {
    color: '#A1A1AA',
  },
});
