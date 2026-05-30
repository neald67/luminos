import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { HangoutRequest, Profile } from '@/lib/types';
import { PlanCard } from './PlanCard';

interface RequestCardProps {
  request: HangoutRequest;
  senderProfile: Profile;
  onAccept: () => void;
  onDecline: () => void;
  onBlock: () => void;
}

const AVATAR_COLORS = [
  '#4DA3FF', '#00FF85', '#FF6B4A', '#FFD166', '#C77DFF', '#06D6A0',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function RequestCard({
  request,
  senderProfile,
  onAccept,
  onDecline,
  onBlock,
}: RequestCardProps) {
  const initial = senderProfile.display_name.charAt(0).toUpperCase();
  const bg = avatarColor(senderProfile.display_name);

  return (
    <View style={styles.card}>
      {/* Sender row */}
      <View style={styles.senderRow}>
        <View style={[styles.avatar, { backgroundColor: bg }]}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <View style={styles.senderInfo}>
          <Text style={styles.senderName}>{senderProfile.display_name}</Text>
          <Text style={styles.senderUsername}>@{senderProfile.username} · {timeAgo(request.created_at)}</Text>
        </View>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      </View>

      {/* Plan card */}
      <PlanCard request={request} senderProfile={senderProfile} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
          <Text style={styles.acceptText}>Accept plan ✓</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.7}>
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.blockBtn} onPress={onBlock} activeOpacity={0.7}>
            <Text style={styles.blockText}>Block</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety footer */}
      <View style={styles.safetyFooter}>
        <Text style={styles.safetyText}>
          Meet in public. Trust your gut. Bail safely anytime.
        </Text>
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
    gap: 12,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  senderInfo: {
    flex: 1,
    gap: 2,
  },
  senderName: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '600',
  },
  senderUsername: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  newBadge: {
    backgroundColor: 'rgba(0, 255, 133, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.3)',
  },
  newBadgeText: {
    color: '#00FF85',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  acceptText: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#15171C',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  declineText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  blockBtn: {
    backgroundColor: 'rgba(255, 107, 74, 0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.2)',
  },
  blockText: {
    color: '#FF6B4A',
    fontSize: 14,
    fontWeight: '500',
  },
  safetyFooter: {
    borderTopWidth: 1,
    borderTopColor: '#262A31',
    paddingTop: 10,
    alignItems: 'center',
  },
  safetyText: {
    color: '#A1A1AA',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
