import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/types';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Background glow */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={['rgba(0,255,133,0.18)', 'rgba(0,255,133,0.04)', 'transparent']}
          style={styles.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={styles.content}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>Hangout</Text>
          <Text style={styles.tagline}>See who's actually free.</Text>
        </View>

        {/* Body text */}
        <View style={styles.bodySection}>
          <Text style={styles.body}>
            Toggle available, find people nearby, drop a real plan.{'\n'}
            No endless 'wyd' texts.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonSection}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={() => router.push('/(auth)/age-gate')}
          >
            <Text style={styles.primaryButtonText}>Start hanging out</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.ghostButtonText}>Sign in</Text>
          </Pressable>
        </View>

        {/* Safety note */}
        <Text style={styles.safetyNote}>
          Meet in public. No exact location shared. Bail anytime.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    alignItems: 'center',
  },
  glow: {
    width: 500,
    height: 400,
    borderRadius: 250,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -2,
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 32,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  bodySection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSection: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  ghostButton: {
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 9999,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  ghostButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  safetyNote: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
});
