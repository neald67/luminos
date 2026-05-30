import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/lib/types';

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressDots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < current ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

export default function OnboardingProfile() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sanitizeUsername = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9_]/g, '');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required.';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Must be at least 2 characters.';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-z0-9_]+$/.test(username)) {
      newErrors.username = 'Only lowercase letters, numbers, and underscores.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    await AsyncStorage.multiSet([
      ['hangout_display_name', displayName.trim()],
      ['hangout_username', username.trim()],
      ['hangout_bio', bio.trim()],
    ]);

    router.push('/(auth)/onboarding-interests');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ProgressDots current={1} total={3} />
            <Text style={styles.stepLabel}>Step 1 of 3</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Who are you?</Text>
            <Text style={styles.subtitle}>Tell people a bit about yourself.</Text>

            {/* Display name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display name *</Text>
              <TextInput
                style={[styles.input, errors.displayName ? styles.inputError : null]}
                placeholder="Your name"
                placeholderTextColor={COLORS.muted}
                value={displayName}
                onChangeText={(t) => {
                  setDisplayName(t);
                  setErrors((e) => ({ ...e, displayName: '' }));
                }}
                maxLength={50}
              />
              {errors.displayName ? (
                <Text style={styles.errorText}>{errors.displayName}</Text>
              ) : null}
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username *</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.atSign}>@</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.usernameInput,
                    errors.username ? styles.inputError : null,
                  ]}
                  placeholder="your_handle"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={(t) => {
                    setUsername(sanitizeUsername(t));
                    setErrors((e) => ({ ...e, username: '' }));
                  }}
                  maxLength={30}
                />
              </View>
              {errors.username ? (
                <Text style={styles.errorText}>{errors.username}</Text>
              ) : (
                <Text style={styles.hintText}>Lowercase, numbers, underscores only.</Text>
              )}
            </View>

            {/* Bio */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Bio (optional)</Text>
                <Text style={styles.charCount}>{bio.length}/150</Text>
              </View>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="A little about you..."
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={3}
                value={bio}
                onChangeText={(t) => setBio(t.slice(0, 150))}
                maxLength={150}
              />
            </View>

            {/* Next button */}
            <Pressable
              style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.accent,
  },
  dotInactive: {
    width: 6,
    backgroundColor: COLORS.border,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: -4,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.muted,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  atSign: {
    paddingLeft: 14,
    paddingRight: 4,
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '600',
  },
  usernameInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  bioInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: -2,
  },
  hintText: {
    color: COLORS.muted,
    fontSize: 12,
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
