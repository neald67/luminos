import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { COLORS } from '@/lib/types';

export interface ToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 22;
const THUMB_PADDING = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const THUMB_ON_POS = TRACK_WIDTH - THUMB_SIZE - THUMB_PADDING;
const THUMB_OFF_POS = THUMB_PADDING;

export default function Toggle({ value, onValueChange, label, sublabel, disabled = false }: ToggleProps) {
  const translateX = useRef(new Animated.Value(value ? THUMB_ON_POS : THUMB_OFF_POS)).current;
  const trackOpacity = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? THUMB_ON_POS : THUMB_OFF_POS,
        useNativeDriver: true,
        speed: 40,
        bounciness: 6,
      }),
      Animated.timing(trackOpacity, {
        toValue: value ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, translateX, trackOpacity]);

  const trackBgColor = trackOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.accent],
  });

  return (
    <Pressable
      style={[styles.row, disabled && styles.disabled]}
      onPress={() => !disabled && onValueChange(!value)}
    >
      {(label || sublabel) && (
        <View style={styles.labelBlock}>
          {label && <Text style={styles.label}>{label}</Text>}
          {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        </View>
      )}

      <Animated.View style={[styles.track, { backgroundColor: trackBgColor, width: TRACK_WIDTH, height: TRACK_HEIGHT }]}>
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX }], width: THUMB_SIZE, height: THUMB_SIZE, top: THUMB_PADDING },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  labelBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  sublabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  track: {
    borderRadius: 9999,
    position: 'relative',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  disabled: {
    opacity: 0.45,
  },
});
