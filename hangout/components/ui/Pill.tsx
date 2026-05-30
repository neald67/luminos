import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/lib/types';

export interface PillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  emoji?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export default function Pill({ label, selected = false, onPress, icon, emoji, style, size = 'md' }: PillProps) {
  const isSm = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected ? styles.pillSelected : styles.pillUnselected,
        isSm && styles.pillSm,
        pressed && styles.pressed,
        style,
      ]}
    >
      {emoji ? <Text style={isSm ? styles.emojiSm : styles.emoji}>{emoji}</Text> : null}
      {icon}
      <Text
        style={[
          styles.label,
          selected ? styles.labelSelected : styles.labelUnselected,
          isSm && styles.labelSm,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1.5,
  },
  pillSm: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pillSelected: {
    backgroundColor: `${COLORS.accent}20`,
    borderColor: COLORS.accent,
  },
  pillUnselected: {
    backgroundColor: COLORS.card2,
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 15,
  },
  emojiSm: {
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 12,
  },
  labelSelected: {
    color: COLORS.accent,
  },
  labelUnselected: {
    color: COLORS.muted,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
