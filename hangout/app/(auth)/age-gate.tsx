import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/types';
import { TEEN_MODE_ENABLED } from '@/lib/constants';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;
const YEARS = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

type AgeStatus = 'too_young' | 'teen_locked' | 'ok' | null;

function getAgeStatus(birthYear: number): AgeStatus {
  const age = CURRENT_YEAR - birthYear;
  if (age < 13) return 'too_young';
  if (age < 18 && !TEEN_MODE_ENABLED) return 'teen_locked';
  return 'ok';
}

export default function AgeGate() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<AgeStatus>(null);
  const [useInput, setUseInput] = useState(true);

  const handleYearInput = (text: string) => {
    setInputValue(text);
    setStatus(null);
    const year = parseInt(text, 10);
    if (text.length === 4 && !isNaN(year)) {
      setSelectedYear(year);
    } else {
      setSelectedYear(null);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStatus(null);
  };

  const handleConfirm = async () => {
    if (!selectedYear) return;

    const ageStatus = getAgeStatus(selectedYear);
    setStatus(ageStatus);

    if (ageStatus === 'ok') {
      await AsyncStorage.setItem('hangout_age_year', String(selectedYear));
      router.push('/(auth)/sign-up');
    }
  };

  const canConfirm = selectedYear !== null && selectedYear >= MIN_YEAR && selectedYear <= CURRENT_YEAR;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>How old are you?</Text>
          <Text style={styles.subtitle}>We use this to keep the community safe.</Text>

          {/* Year input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.yearInput}
              placeholder="Birth year (e.g. 2001)"
              placeholderTextColor={COLORS.muted}
              keyboardType="number-pad"
              maxLength={4}
              value={inputValue}
              onChangeText={handleYearInput}
              returnKeyType="done"
            />
          </View>

          {/* Year picker toggle */}
          <Pressable onPress={() => setUseInput((v) => !v)} style={styles.togglePicker}>
            <Text style={styles.togglePickerText}>
              {useInput ? 'Or pick from list' : 'Type instead'}
            </Text>
          </Pressable>

          {/* Year list */}
          {!useInput && (
            <View style={styles.yearListWrapper}>
              <ScrollView
                style={styles.yearList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {YEARS.map((year) => (
                  <Pressable
                    key={year}
                    style={[
                      styles.yearItem,
                      selectedYear === year && styles.yearItemSelected,
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text
                      style={[
                        styles.yearItemText,
                        selectedYear === year && styles.yearItemTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Status messages */}
          {status === 'too_young' && (
            <View style={styles.messageBox}>
              <Ionicons name="shield-outline" size={20} color={COLORS.danger} />
              <Text style={styles.messageText}>
                Hangout is for ages 13 and up. Come back when you're older!
              </Text>
            </View>
          )}

          {status === 'teen_locked' && (
            <View style={styles.messageBox}>
              <Ionicons name="time-outline" size={20} color={COLORS.muted} />
              <Text style={styles.messageText}>
                Hangout is currently available for 18+ users. We're working on a safe experience for younger users.
              </Text>
              <Pressable style={styles.waitlistButton}>
                <Text style={styles.waitlistButtonText}>Join waitlist</Text>
              </Pressable>
            </View>
          )}

          {/* Confirm button */}
          {status !== 'too_young' && status !== 'teen_locked' && (
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                !canConfirm && styles.confirmButtonDisabled,
                pressed && canConfirm && styles.pressed,
              ]}
              onPress={handleConfirm}
              disabled={!canConfirm}
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
            </Pressable>
          )}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: -4,
  },
  inputContainer: {
    marginTop: 8,
  },
  yearInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 4,
  },
  togglePicker: {
    alignSelf: 'center',
  },
  togglePickerText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  yearListWrapper: {
    height: 220,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  yearList: {
    flex: 1,
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  yearItemSelected: {
    backgroundColor: `${COLORS.accent}20`,
  },
  yearItemText: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },
  yearItemTextSelected: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  messageBox: {
    backgroundColor: COLORS.card2,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  messageText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  waitlistButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  waitlistButtonText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
