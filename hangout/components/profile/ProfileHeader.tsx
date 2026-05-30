import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Profile } from '@/lib/types';
import { InterestChips } from './InterestChips';
import type { ActivityType } from '@/lib/types';

interface ProfileHeaderProps {
  profile: Profile;
  onEditPress?: () => void;
  pointsBalance?: number;
  streak?: number;
  reliabilityLabel?: string;
  hangoutsCompleted?: number;
}

const AVATAR_COLORS = [
  '#4DA3FF',
  '#00FF85',
  '#FF6B4A',
  '#FFD166',
  '#C77DFF',
  '#06D6A0',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ProfileHeader({
  profile,
  onEditPress,
  pointsBalance = 0,
  streak = 0,
  reliabilityLabel = 'New here',
  hangoutsCompleted = 0,
}: ProfileHeaderProps) {
  const initial = profile.display_name.charAt(0).toUpperCase();
  const bg = avatarColor(profile.display_name);

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </View>

      {/* Name */}
      <Text style={styles.displayName}>{profile.display_name}</Text>
      <Text style={styles.username}>@{profile.username}</Text>

      {/* Bio */}
      {profile.bio ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : null}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pointsBalance}</Text>
          <Text style={styles.statLabel}>HP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{hangoutsCompleted}</Text>
          <Text style={styles.statLabel}>Hangouts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
      </View>

      {/* Reliability */}
      <View style={styles.reliabilityRow}>
        <View style={styles.reliabilityDot} />
        <Text style={styles.reliabilityText}>{reliabilityLabel}</Text>
      </View>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 ? (
        <View style={styles.interestsContainer}>
          <InterestChips interests={profile.interests as ActivityType[]} />
        </View>
      ) : null}

      {/* Edit button */}
      {onEditPress ? (
        <TouchableOpacity style={styles.editBtn} onPress={onEditPress} activeOpacity={0.8}>
          <Text style={styles.editBtnText}>Edit profile</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarInitial: {
    color: '#050505',
    fontSize: 32,
    fontWeight: '700',
  },
  displayName: {
    color: '#F4F4F5',
    fontSize: 22,
    fontWeight: '700',
  },
  username: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  bio: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 12,
    backgroundColor: '#101114',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#262A31',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#262A31',
  },
  reliabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reliabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF85',
  },
  reliabilityText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  interestsContainer: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  editBtn: {
    marginTop: 8,
    backgroundColor: '#15171C',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  editBtnText: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
  },
});
