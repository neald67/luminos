import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import type { NearbyUser } from '@/lib/types';
import { ACTIVITY_CONFIG, DISTANCE_BUCKET_LABELS } from '@/lib/constants';
import { ReliabilityBadge } from './ReliabilityBadge';
import { PointsBadge } from './PointsBadge';

interface ProfileCardProps {
  user: NearbyUser;
  onDropPlan: () => void;
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

function ActivityChips({ activities }: { activities: string[] }) {
  const shown = activities.slice(0, 3);
  const extra = activities.length - 3;
  return (
    <View style={styles.chipsRow}>
      {shown.map((key) => {
        const config = ACTIVITY_CONFIG[key as keyof typeof ACTIVITY_CONFIG];
        const icon = config?.icon ?? '●';
        const label = config?.label ?? key;
        return (
          <View key={key} style={styles.chip}>
            <Text style={styles.chipIcon}>{icon}</Text>
            <Text style={styles.chipLabel}>{label}</Text>
          </View>
        );
      })}
      {extra > 0 && (
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>+{extra} more</Text>
        </View>
      )}
    </View>
  );
}

export function ProfileCard({ user, onDropPlan }: ProfileCardProps) {
  const initial = user.display_name.charAt(0).toUpperCase();
  const bg = avatarColor(user.display_name);
  const distanceLabel = DISTANCE_BUCKET_LABELS[user.distance_bucket] ?? user.distance_bucket;

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: bg }]}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

        {/* Name + meta */}
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.display_name}</Text>
            {user.mutual_crew_count > 0 && (
              <View style={styles.mutualPill}>
                <Text style={styles.mutualText}>
                  {user.mutual_crew_count} mutual crew
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.distance}>{distanceLabel}</Text>
        </View>

        {/* Points badge */}
        <PointsBadge points={user.points_badge} />
      </View>

      {/* Bio */}
      {user.bio_short ? (
        <Text style={styles.bio}>{user.bio_short}</Text>
      ) : null}

      {/* Status note */}
      {user.status_note ? (
        <View style={styles.statusRow}>
          <Text style={styles.statusDot}>●</Text>
          <Text style={styles.statusNote}>{user.status_note}</Text>
        </View>
      ) : null}

      {/* Activity chips */}
      <ActivityChips activities={user.available_for} />

      {/* Footer row */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <ReliabilityBadge label={user.reliability_label} />
          <Text style={styles.expires}>Expires in {user.expires_in_minutes}m</Text>
        </View>
        <TouchableOpacity style={styles.dropBtn} onPress={onDropPlan} activeOpacity={0.8}>
          <Text style={styles.dropBtnText}>Drop a plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262A31',
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#050505',
    fontSize: 18,
    fontWeight: '700',
  },
  nameCol: {
    flex: 1,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  displayName: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '600',
  },
  mutualPill: {
    backgroundColor: 'rgba(77, 163, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  mutualText: {
    color: '#4DA3FF',
    fontSize: 10,
    fontWeight: '500',
  },
  username: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  distance: {
    color: '#4DA3FF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  bio: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    color: '#00FF85',
    fontSize: 8,
  },
  statusNote: {
    color: '#F4F4F5',
    fontSize: 12,
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#15171C',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  chipIcon: {
    fontSize: 11,
  },
  chipLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  footerLeft: {
    gap: 4,
  },
  expires: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  dropBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropBtnText: {
    color: '#050505',
    fontSize: 13,
    fontWeight: '700',
  },
});
