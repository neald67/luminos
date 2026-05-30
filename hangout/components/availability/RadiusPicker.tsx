import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { HANGOUT_RADII } from '@/lib/constants';

interface RadiusPickerProps {
  selected: number;
  onSelect: (value: number) => void;
}

export function RadiusPicker({ selected, onSelect }: RadiusPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Radius</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {HANGOUT_RADII.map((r) => {
            const active = r === selected;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => onSelect(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {r} mi
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    backgroundColor: '#15171C',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  pillActive: {
    backgroundColor: 'rgba(0, 255, 133, 0.12)',
    borderColor: '#00FF85',
  },
  pillText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#00FF85',
    fontWeight: '600',
  },
});
