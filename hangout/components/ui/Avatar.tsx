import React, { useRef, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS } from '@/lib/types';

const SIZES = {
  xs: 24,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
} as const;

export interface AvatarProps {
  uri?: string | null;
  displayName?: string;
  size?: keyof typeof SIZES;
  showRing?: boolean;
  ringAnimated?: boolean;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({ uri, displayName, size = 'md', showRing = false, ringAnimated = false }: AvatarProps) {
  const dim = SIZES[size];
  const fontSize = Math.max(10, Math.floor(dim * 0.34));
  const ringPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showRing && ringAnimated) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(ringPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      anim.start();
      // Stop and reset the animation when props change or component unmounts
      return () => {
        anim.stop();
        ringPulse.setValue(1);
      };
    } else {
      // Ensure scale is reset if ring is toggled off while animating
      ringPulse.setValue(1);
    }
  }, [showRing, ringAnimated, ringPulse]);

  return (
    <View style={[styles.wrapper, { width: dim, height: dim }]}>
      {showRing && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: dim + 4,
              height: dim + 4,
              borderRadius: (dim + 4) / 2,
              transform: [{ scale: ringPulse }],
            },
          ]}
        />
      )}
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]}
        />
      ) : (
        <View
          style={[styles.fallback, { width: dim, height: dim, borderRadius: dim / 2 }]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(displayName)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: COLORS.card2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  initials: {
    color: COLORS.muted,
    fontWeight: '700',
  },
});
