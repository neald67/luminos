import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '@/lib/types';

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 9,  paddingHorizontal: 16, fontSize: 13 },
  md: { paddingVertical: 13, paddingHorizontal: 20, fontSize: 15 },
  lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 },
};

const VARIANT_CONTAINER: Record<NonNullable<ButtonProps['variant']>, ViewStyle> = {
  primary:   { backgroundColor: COLORS.accent,    borderWidth: 0,   borderColor: 'transparent' },
  ghost:     { backgroundColor: 'transparent',    borderWidth: 1.5, borderColor: COLORS.accent },
  danger:    { backgroundColor: COLORS.dangerBg,  borderWidth: 1.5, borderColor: COLORS.danger },
  secondary: { backgroundColor: COLORS.card2,     borderWidth: 1,   borderColor: COLORS.border },
};

const VARIANT_TEXT: Record<NonNullable<ButtonProps['variant']>, TextStyle> = {
  primary:   { color: COLORS.bg },
  ghost:     { color: COLORS.accent },
  danger:    { color: COLORS.danger },
  secondary: { color: COLORS.text },
};

const VARIANT_INDICATOR: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   COLORS.bg,
  ghost:     COLORS.accent,
  danger:    COLORS.danger,
  secondary: COLORS.muted,
};

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sizeSt = SIZE_STYLES[size];
  const variantContainer = VARIANT_CONTAINER[variant];
  const variantText = VARIANT_TEXT[variant];
  const indicatorColor = VARIANT_INDICATOR[variant];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          variantContainer,
          { paddingVertical: sizeSt.paddingVertical, paddingHorizontal: sizeSt.paddingHorizontal },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={indicatorColor} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, variantText, { fontSize: sizeSt.fontSize }]}>
              {children}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
});
