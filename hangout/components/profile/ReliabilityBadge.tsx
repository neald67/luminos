import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ReliabilityBadgeProps {
  label: string;
}

function dotColor(label: string): string {
  if (label === 'Very reliable') return '#00FF85';
  if (label === 'Pretty reliable') return '#4DA3FF';
  if (label === 'Somewhat reliable') return '#FFD166';
  return '#A1A1AA';
}

export function ReliabilityBadge({ label }: ReliabilityBadgeProps) {
  const color = dotColor(label);
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '500',
  },
});
