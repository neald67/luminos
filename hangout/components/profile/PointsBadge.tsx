import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PointsBadgeProps {
  points: number;
}

export function PointsBadge({ points }: PointsBadgeProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{points} HP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: 'rgba(0, 255, 133, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.3)',
  },
  text: {
    color: '#00FF85',
    fontSize: 11,
    fontWeight: '600',
  },
});
