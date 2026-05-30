import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import type { HangoutRequest, ActivityType, HangoutMode } from '@/lib/types';
import { ACTIVITY_CONFIG, HANGOUT_DURATIONS } from '@/lib/constants';

interface RequestComposerProps {
  receiverId: string;
  receiverName: string;
  visible: boolean;
  onClose: () => void;
  onSend: (req: Partial<HangoutRequest>) => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const ALL_ACTIVITIES = Object.keys(ACTIVITY_CONFIG) as ActivityType[];

export function RequestComposer({
  receiverId,
  receiverName,
  visible,
  onClose,
  onSend,
}: RequestComposerProps) {
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [duration, setDuration] = useState(60);
  const [placeName, setPlaceName] = useState('');
  const [generalLocation, setGeneralLocation] = useState('');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<HangoutMode>('casual');

  const canSend = activity !== null && note.trim().length >= 5;

  const handleSend = () => {
    if (!canSend || !activity) return;
    onSend({
      receiver_id: receiverId,
      activity,
      estimated_duration_minutes: duration,
      place_name: placeName.trim() || undefined,
      general_location: generalLocation.trim() || undefined,
      note: note.trim(),
      mode,
      proposed_time: new Date(Date.now() + 3600000).toISOString(),
    });
    // Reset
    setActivity(null);
    setDuration(60);
    setPlaceName('');
    setGeneralLocation('');
    setNote('');
    setMode('casual');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Drop a plan for {receiverName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Activity selector */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Activity</Text>
              <View style={styles.activityGrid}>
                {ALL_ACTIVITIES.map((key) => {
                  const config = ACTIVITY_CONFIG[key as keyof typeof ACTIVITY_CONFIG];
                  const active = activity === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.actChip, active && styles.actChipActive]}
                      onPress={() => setActivity(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actIcon}>{config?.icon ?? '●'}</Text>
                      <Text style={[styles.actLabel, active && styles.actLabelActive]}>
                        {config?.label ?? key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {HANGOUT_DURATIONS.map((d) => {
                  const active = d === duration;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.durationPill, active && styles.durationPillActive]}
                      onPress={() => setDuration(d)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.durationText, active && styles.durationTextActive]}>
                        {formatDuration(d)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Where (optional)</Text>
              <TextInput
                style={styles.input}
                value={placeName}
                onChangeText={setPlaceName}
                placeholder="Place name e.g. Blue Bottle Coffee"
                placeholderTextColor="#A1A1AA"
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={generalLocation}
                onChangeText={setGeneralLocation}
                placeholder="General area e.g. SOMA, Mission"
                placeholderTextColor="#A1A1AA"
              />
            </View>

            {/* Note */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Note <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={note}
                onChangeText={setNote}
                placeholder="Say something. 'wyd' doesn't count."
                placeholderTextColor="#A1A1AA"
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, note.length < 5 && styles.charCountWarn]}>
                {note.length}/200 {note.length < 5 && note.length > 0 ? '(min 5 chars)' : ''}
              </Text>
            </View>

            {/* Mode selector */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Mode</Text>
              <TouchableOpacity
                style={[styles.modeOption, mode === 'casual' && styles.modeOptionActive]}
                onPress={() => setMode('casual')}
                activeOpacity={0.7}
              >
                <View style={styles.modeRow}>
                  <Text style={styles.modeIcon}>☕</Text>
                  <View style={styles.modeText}>
                    <Text style={[styles.modeTitle, mode === 'casual' && styles.modeTitleActive]}>
                      Casual
                    </Text>
                    <Text style={styles.modeDesc}>Free, no HP required</Text>
                  </View>
                  {mode === 'casual' && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeOption, mode === 'verified' && styles.modeOptionActive]}
                onPress={() => setMode('verified')}
                activeOpacity={0.7}
              >
                <View style={styles.modeRow}>
                  <Text style={styles.modeIcon}>⚡</Text>
                  <View style={styles.modeText}>
                    <Text style={[styles.modeTitle, mode === 'verified' && styles.modeTitleActive]}>
                      Verified
                    </Text>
                    <Text style={styles.modeDesc}>
                      50 HP stake • leaderboard eligible • higher commitment
                    </Text>
                  </View>
                  {mode === 'verified' && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Send button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.8}
            >
              <Text style={styles.sendBtnText}>
                {canSend ? 'Send plan 🚀' : 'Pick activity + write a note'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#101114',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#262A31',
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262A31',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#262A31',
  },
  title: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 0,
  },
  scrollInner: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  required: {
    color: '#FF6B4A',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#15171C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  actChipActive: {
    backgroundColor: 'rgba(0, 255, 133, 0.12)',
    borderColor: '#00FF85',
  },
  actIcon: {
    fontSize: 14,
  },
  actLabel: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  actLabelActive: {
    color: '#00FF85',
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationPill: {
    backgroundColor: '#15171C',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  durationPillActive: {
    backgroundColor: 'rgba(0, 255, 133, 0.12)',
    borderColor: '#00FF85',
  },
  durationText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  durationTextActive: {
    color: '#00FF85',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#15171C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262A31',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F4F5',
    fontSize: 14,
  },
  noteInput: {
    height: 80,
  },
  charCount: {
    color: '#A1A1AA',
    fontSize: 11,
    textAlign: 'right',
  },
  charCountWarn: {
    color: '#FF6B4A',
  },
  modeOption: {
    backgroundColor: '#15171C',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#262A31',
    marginBottom: 8,
  },
  modeOptionActive: {
    borderColor: '#00FF85',
    backgroundColor: 'rgba(0, 255, 133, 0.05)',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  modeIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  modeText: {
    flex: 1,
    gap: 2,
  },
  modeTitle: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTitleActive: {
    color: '#00FF85',
  },
  modeDesc: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 16,
  },
  checkmark: {
    color: '#00FF85',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    borderTopColor: '#262A31',
  },
  sendBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#262A31',
  },
  sendBtnText: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
});
