import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/types';

export interface GradientGlowProps {
  color?: string;
  intensity?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
  size?: number;
}

export default function GradientGlow({
  color = COLORS.accent,
  intensity = 0.5,
  children,
  style,
  size = 300,
}: GradientGlowProps) {
  const alpha = Math.min(1, Math.max(0, intensity));
  const innerAlpha = Math.round(alpha * 40).toString(16).padStart(2, '0');
  const outerAlpha = '00';

  // Build rgba-like hex colors for gradient
  const innerColor = `${color}${innerAlpha}`;
  const outerColor = `${color}${outerAlpha}`;

  return (
    <View style={[styles.wrapper, style]}>
      <LinearGradient
        colors={[innerColor, outerColor]}
        style={[styles.glow, { width: size, height: size, borderRadius: size / 2 }]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
});
