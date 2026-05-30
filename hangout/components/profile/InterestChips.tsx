import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ACTIVITY_CONFIG } from '@/lib/constants';
import type { ActivityType } from '@/lib/types';

interface InterestChipsProps {
  interests: ActivityType[];
  scrollable?: boolean;
}

export function InterestChips({ interests, scrollable = true }: InterestChipsProps) {
  const chips = interests.map((key) => {
    const config = ACTIVITY_CONFIG[key as keyof typeof ACTIVITY_CONFIG];
    const label = config?.label ?? key;
    const icon = config?.icon ?? '●';
    return { key, label, icon };
  });

  const content = (
    <View style={styles.row}>
      {chips.map(({ key, label, icon }) => (
        <View key={key} style={styles.chip}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.wrap}>{chips.map(({ key, label, icon }) => (
    <View key={key} style={styles.chip}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  ))}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#15171C',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  icon: {
    fontSize: 13,
  },
  label: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '500',
  },
});
