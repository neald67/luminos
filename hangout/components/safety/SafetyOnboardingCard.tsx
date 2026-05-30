import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SafetyOnboardingCardProps {
  icon: string;
  title: string;
  description: string;
  accent?: 'green' | 'blue' | 'orange';
}

const ACCENT_COLORS = {
  green: '#00FF85',
  blue: '#4DA3FF',
  orange: '#FF6B4A',
};

export function SafetyOnboardingCard({
  icon,
  title,
  description,
  accent = 'green',
}: SafetyOnboardingCardProps) {
  const accentColor = ACCENT_COLORS[accent];

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    borderLeftWidth: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#15171C',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
  },
});
