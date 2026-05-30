import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ACTIVITY_CONFIG } from '@/lib/constants';
import type { ActivityType } from '@/lib/types';

interface AvailableForChipsProps {
  selected: ActivityType[];
  onToggle: (activity: ActivityType) => void;
}

const ALL_ACTIVITIES = Object.keys(ACTIVITY_CONFIG) as ActivityType[];

export function AvailableForChips({ selected, onToggle }: AvailableForChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>I&apos;m up for</Text>
      <View style={styles.grid}>
        {ALL_ACTIVITIES.map((key) => {
          const config = ACTIVITY_CONFIG[key as keyof typeof ACTIVITY_CONFIG];
          const active = selected.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{config?.icon ?? '●'}</Text>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {config?.label ?? key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#15171C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  chipActive: {
    backgroundColor: 'rgba(0, 255, 133, 0.12)',
    borderColor: '#00FF85',
  },
  icon: {
    fontSize: 14,
  },
  chipLabel: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#00FF85',
    fontWeight: '600',
  },
});
