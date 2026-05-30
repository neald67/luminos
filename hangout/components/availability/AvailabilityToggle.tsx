import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { ACTIVITY_CONFIG } from '@/lib/constants';
import type { ActivityType } from '@/lib/types';

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: (val: boolean) => void;
  availableFor: ActivityType[];
  duration: number;
  radius: number;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function AvailabilityToggle({
  isAvailable,
  onToggle,
  availableFor,
  duration,
  radius,
}: AvailabilityToggleProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isAvailable ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();

    if (isAvailable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAvailable, glowAnim, pulseAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#262A31', '#00FF85'],
  });

  const bgColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#101114', '#0A1A10'],
  });

  const activitySummary = availableFor
    .slice(0, 3)
    .map((k) => ACTIVITY_CONFIG[k as keyof typeof ACTIVITY_CONFIG]?.label ?? k)
    .join(' · ');

  return (
    <TouchableOpacity onPress={() => onToggle(!isAvailable)} activeOpacity={0.85}>
      <Animated.View
        style={[
          styles.container,
          { borderColor, backgroundColor: bgColor },
        ]}
      >
        <View style={styles.left}>
          {/* Dot indicator */}
          <Animated.View
            style={[
              styles.dot,
              isAvailable && styles.dotActive,
              isAvailable && { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <View style={styles.textCol}>
            <Text style={[styles.title, isAvailable && styles.titleActive]}>
              {isAvailable ? 'Available now' : "I'm available"}
            </Text>
            {isAvailable && activitySummary ? (
              <Text style={styles.summary}>
                For {activitySummary} · {radius} mi · {formatDuration(duration)} left
              </Text>
            ) : (
              <Text style={styles.subtitle}>
                Tap to show nearby friends you&apos;re free
              </Text>
            )}
          </View>
        </View>

        {/* Toggle switch */}
        <View style={[styles.switch, isAvailable && styles.switchActive]}>
          <View style={[styles.thumb, isAvailable && styles.thumbActive]} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A1A1AA',
  },
  dotActive: {
    backgroundColor: '#00FF85',
    shadowColor: '#00FF85',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  textCol: {
    gap: 2,
    flex: 1,
  },
  title: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '600',
  },
  titleActive: {
    color: '#00FF85',
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  summary: {
    color: 'rgba(0, 255, 133, 0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  switch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#262A31',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchActive: {
    backgroundColor: '#00FF85',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A1A1AA',
  },
  thumbActive: {
    backgroundColor: '#050505',
    marginLeft: 18,
  },
});
