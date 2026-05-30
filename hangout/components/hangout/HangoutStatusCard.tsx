import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Hangout } from '@/lib/types';
import { ACTIVITY_CONFIG } from '@/lib/constants';

interface HangoutStatusCardProps {
  hangout: Hangout;
  pointsAwarded?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  planned: { label: 'Plan locked', color: '#4DA3FF', icon: '🔒' },
  active: { label: 'In progress', color: '#00FF85', icon: '⚡' },
  completed: { label: 'Touch grass confirmed.', color: '#00FF85', icon: '✅' },
  cancelled: { label: 'Cancelled', color: '#A1A1AA', icon: '✕' },
  bailed: { label: 'Bailed safely', color: '#FFD166', icon: '🚪' },
  expired: { label: 'Expired', color: '#A1A1AA', icon: '⏰' },
};

export function HangoutStatusCard({ hangout, pointsAwarded }: HangoutStatusCardProps) {
  const statusInfo = STATUS_CONFIG[hangout.status] ?? STATUS_CONFIG.planned;
  const actConfig = ACTIVITY_CONFIG[hangout.activity as keyof typeof ACTIVITY_CONFIG];
  const actLabel = actConfig?.label ?? hangout.activity;
  const actIcon = actConfig?.emoji ?? '✌️';

  return (
    <View style={styles.card}>
      {/* Status banner */}
      <View style={[styles.statusBanner, { borderColor: statusInfo.color + '44' }]}>
        <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
        <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
      </View>

      {/* Details */}
      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>{actIcon}</Text>
        <Text style={styles.detailText}>{actLabel}</Text>
      </View>

      {hangout.mode === 'verified' && (
        <View style={styles.verifiedRow}>
          <Text style={styles.verifiedIcon}>⚡</Text>
          <Text style={styles.verifiedText}>Verified mode — 50 HP staked</Text>
        </View>
      )}

      {hangout.points_awarded && hangout.status === 'completed' && (
        <View style={styles.pointsRow}>
          <Text style={styles.pointsText}>+{pointsAwarded ?? 50} HP earned 🎉</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#15171C',
    borderRadius: 10,
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedIcon: {
    fontSize: 12,
  },
  verifiedText: {
    color: '#00FF85',
    fontSize: 12,
    fontWeight: '500',
  },
  pointsRow: {
    backgroundColor: 'rgba(0, 255, 133, 0.08)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  pointsText: {
    color: '#00FF85',
    fontSize: 14,
    fontWeight: '600',
  },
});
