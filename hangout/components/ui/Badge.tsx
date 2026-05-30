import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/types';

export type BadgeVariant = 'points' | 'reliability' | 'verified' | 'new';

export interface BadgeProps {
  variant: BadgeVariant;
  value?: number | string;
  style?: ViewStyle;
}

const RELIABILITY_CONFIG: Record<string, { color: string; dotColor: string }> = {
  'Very reliable':     { color: COLORS.accent,  dotColor: COLORS.accent },
  'Pretty reliable':   { color: '#7CFF6B',       dotColor: '#7CFF6B' },
  'Somewhat reliable': { color: '#FF9F0A',       dotColor: '#FF9F0A' },
  'Unreliable':        { color: COLORS.danger,   dotColor: COLORS.danger },
};

export default function Badge({ variant, value, style }: BadgeProps) {
  if (variant === 'points') {
    return (
      <View style={[styles.base, styles.points, style]}>
        <Ionicons name="flash" size={10} color={COLORS.bg} />
        <Text style={[styles.text, styles.pointsText]}>{value ?? 0} HP</Text>
      </View>
    );
  }

  if (variant === 'reliability') {
    const label = String(value ?? 'Unknown');
    const config = RELIABILITY_CONFIG[label] ?? { color: COLORS.muted, dotColor: COLORS.muted };
    return (
      <View style={[styles.base, styles.reliability, style]}>
        <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
        <Text style={[styles.text, { color: config.color }]}>{label}</Text>
      </View>
    );
  }

  if (variant === 'verified') {
    return (
      <View style={[styles.base, styles.verified, style]}>
        <Ionicons name="checkmark-circle" size={12} color={COLORS.blue} />
        <Text style={[styles.text, styles.verifiedText]}>Verified</Text>
      </View>
    );
  }

  if (variant === 'new') {
    return (
      <View style={[styles.base, styles.newBadge, style]}>
        <Text style={[styles.text, styles.newText]}>NEW</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    paddingVertical: 3,
    paddingHorizontal: 7,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
  points: {
    backgroundColor: COLORS.accent,
  },
  pointsText: {
    color: COLORS.bg,
  },
  reliability: {
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  verified: {
    backgroundColor: `${COLORS.blue}20`,
    borderWidth: 1,
    borderColor: `${COLORS.blue}50`,
  },
  verifiedText: {
    color: COLORS.blue,
  },
  newBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  newText: {
    color: COLORS.accent,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
