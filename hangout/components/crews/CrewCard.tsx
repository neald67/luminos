import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Crew {
  id: string;
  name: string;
  avatarColor?: string;
}

interface CrewCardProps {
  crew: Crew;
  memberCount: number;
  onlineCount?: number;
  onPress: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CrewCard({ crew, memberCount, onlineCount = 0, onPress }: CrewCardProps) {
  const hasOnline = onlineCount > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: crew.avatarColor ?? '#262A31' }]}>
        <Text style={styles.initials}>{getInitials(crew.name)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{crew.name}</Text>
        <Text style={styles.memberCount}>{memberCount} members</Text>
      </View>

      {hasOnline && (
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>{onlineCount} free now</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initials: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
  },
  memberCount: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,133,0.10)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF85',
    marginRight: 5,
  },
  onlineText: {
    color: '#00FF85',
    fontSize: 11,
    fontWeight: '600',
  },
});
