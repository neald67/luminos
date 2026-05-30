import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import type { ActivityType } from '@/lib/types';
import { AvailabilityToggle } from './AvailabilityToggle';
import { RadiusPicker } from './RadiusPicker';
import { DurationPicker } from './DurationPicker';
import { AvailableForChips } from './AvailableForChips';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AvailabilityCardProps {
  isAvailable: boolean;
  onAvailabilityChange: (val: boolean) => void;
  selectedActivities: ActivityType[];
  onActivitiesChange: (activities: ActivityType[]) => void;
  radius: number;
  onRadiusChange: (val: number) => void;
  duration: number;
  onDurationChange: (val: number) => void;
}

export function AvailabilityCard({
  isAvailable,
  onAvailabilityChange,
  selectedActivities,
  onActivitiesChange,
  radius,
  onRadiusChange,
  duration,
  onDurationChange,
}: AvailabilityCardProps) {
  const [statusNote, setStatusNote] = useState('');
  const [expanded, setExpanded] = useState(!isAvailable);

  const handleToggle = (val: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!val);
    onAvailabilityChange(val);
  };

  const handleActivityToggle = (activity: ActivityType) => {
    if (selectedActivities.includes(activity)) {
      onActivitiesChange(selectedActivities.filter((a) => a !== activity));
    } else {
      onActivitiesChange([...selectedActivities, activity]);
    }
  };

  return (
    <View style={styles.card}>
      <AvailabilityToggle
        isAvailable={isAvailable}
        onToggle={handleToggle}
        availableFor={selectedActivities}
        duration={duration}
        radius={radius}
      />

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.divider} />

          <AvailableForChips
            selected={selectedActivities}
            onToggle={handleActivityToggle}
          />

          <RadiusPicker selected={radius} onSelect={onRadiusChange} />

          <DurationPicker selected={duration} onSelect={onDurationChange} />

          {/* Status note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Status note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={statusNote}
              onChangeText={setStatusNote}
              placeholder="e.g. Free until 6pm ☕"
              placeholderTextColor="#A1A1AA"
              maxLength={60}
            />
          </View>

          {selectedActivities.length === 0 && (
            <View style={styles.hintRow}>
              <Text style={styles.hint}>Pick at least one activity to go available</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.goBtn,
              selectedActivities.length === 0 && styles.goBtnDisabled,
            ]}
            onPress={() => selectedActivities.length > 0 && handleToggle(true)}
            activeOpacity={0.8}
            disabled={selectedActivities.length === 0}
          >
            <Text style={styles.goBtnText}>Go available</Text>
          </TouchableOpacity>
        </View>
      )}

      {!expanded && isAvailable && (
        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpanded(true);
          }}
          style={styles.editRow}
        >
          <Text style={styles.editText}>Edit availability</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  expandedSection: {
    padding: 16,
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#262A31',
    marginVertical: 4,
  },
  noteContainer: {
    gap: 6,
  },
  noteLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  noteInput: {
    backgroundColor: '#15171C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262A31',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F4F5',
    fontSize: 14,
  },
  hintRow: {
    alignItems: 'center',
  },
  hint: {
    color: '#A1A1AA',
    fontSize: 12,
    fontStyle: 'italic',
  },
  goBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  goBtnDisabled: {
    backgroundColor: '#262A31',
  },
  goBtnText: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
  editRow: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#262A31',
  },
  editText: {
    color: '#4DA3FF',
    fontSize: 13,
    fontWeight: '500',
  },
});
