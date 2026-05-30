import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VerificationChecklistProps {
  stakeLocked: boolean;
  qrHandshake: boolean;
  durationMet: boolean;
  completed: boolean;
  pointsStatus: 'pending' | 'earned' | 'forfeited' | 'none';
}

interface CheckItemProps {
  label: string;
  checked: boolean;
  pending?: boolean;
}

function CheckItem({ label, checked, pending }: CheckItemProps) {
  const icon = checked ? '✓' : pending ? '…' : '○';
  const color = checked ? '#00FF85' : pending ? '#FFD166' : '#A1A1AA';

  return (
    <View style={styles.checkRow}>
      <Text style={[styles.checkIcon, { color }]}>{icon}</Text>
      <Text style={[styles.checkLabel, checked && styles.checkLabelDone]}>{label}</Text>
    </View>
  );
}

export function VerificationChecklist({
  stakeLocked,
  qrHandshake,
  durationMet,
  completed,
  pointsStatus,
}: VerificationChecklistProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification</Text>

      <View style={styles.list}>
        <CheckItem label="50 HP stake locked" checked={stakeLocked} />
        <CheckItem label="QR handshake" checked={qrHandshake} pending={stakeLocked && !qrHandshake} />
        <CheckItem label="Duration met" checked={durationMet} pending={qrHandshake && !durationMet} />
        <CheckItem label="Hangout completed" checked={completed} pending={durationMet && !completed} />
      </View>

      {/* Points status */}
      <View style={[styles.pointsBanner, pointsStatus === 'earned' && styles.pointsBannerEarned, pointsStatus === 'forfeited' && styles.pointsBannerForfeited]}>
        <Text style={[
          styles.pointsText,
          pointsStatus === 'earned' && styles.pointsTextEarned,
          pointsStatus === 'forfeited' && styles.pointsTextForfeited,
        ]}>
          {pointsStatus === 'pending' && '⏳ Points pending — complete your hangout'}
          {pointsStatus === 'earned' && '✓ 50 HP earned!'}
          {pointsStatus === 'forfeited' && '✗ Stake forfeited'}
          {pointsStatus === 'none' && 'No HP at stake (casual mode)'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101114',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  title: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: '700',
    width: 18,
    textAlign: 'center',
  },
  checkLabel: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  checkLabelDone: {
    color: '#F4F4F5',
  },
  pointsBanner: {
    backgroundColor: '#15171C',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  pointsBannerEarned: {
    backgroundColor: 'rgba(0, 255, 133, 0.08)',
    borderColor: 'rgba(0, 255, 133, 0.3)',
  },
  pointsBannerForfeited: {
    backgroundColor: 'rgba(255, 107, 74, 0.08)',
    borderColor: 'rgba(255, 107, 74, 0.3)',
  },
  pointsText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  pointsTextEarned: {
    color: '#00FF85',
  },
  pointsTextForfeited: {
    color: '#FF6B4A',
  },
});
