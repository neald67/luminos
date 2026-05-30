import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { COLORS } from '@/lib/types';

export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

export default function SegmentedControl({ options, selectedIndex, onChange, style }: SegmentedControlProps) {
  const segmentWidth = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only animate once layout has fired and we know the real segment width.
    // Before layout, segmentWidth.current is 0, so we skip to avoid
    // the indicator snapping from 0 when selectedIndex > 0 on first render.
    if (segmentWidth.current === 0) return;
    Animated.spring(translateX, {
      toValue: selectedIndex * segmentWidth.current,
      useNativeDriver: true,
      speed: 30,
      bounciness: 2,
    }).start();
  }, [selectedIndex, translateX]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const totalWidth = e.nativeEvent.layout.width;
    segmentWidth.current = totalWidth / options.length;
    // Position the active indicator immediately on layout
    translateX.setValue(selectedIndex * segmentWidth.current);
  };

  return (
    <View style={[styles.track, style]} onLayout={handleLayout}>
      {/* Sliding indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: `${100 / options.length}%`,
            transform: [{ translateX }],
          },
        ]}
      />

      {/* Options */}
      {options.map((option, index) => (
        <Pressable
          key={index}
          style={styles.segment}
          onPress={() => onChange(index)}
        >
          <Text
            style={[
              styles.label,
              index === selectedIndex ? styles.labelActive : styles.labelInactive,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: COLORS.card2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.text,
  },
  labelInactive: {
    color: COLORS.muted,
  },
});
