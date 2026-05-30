import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { POINTS } from '@/lib/points';

export type HangoutMode = 'casual' | 'verified';

interface StakeModeSelectorProps {
  mode: HangoutMode;
  onChange: (mode: HangoutMode) => void;
  userBalance: number;
}

export function StakeModeSelector({ mode, onChange, userBalance }: StakeModeSelectorProps) {
  const canVerify = userBalance >= POINTS.STAKE_AMOUNT;

  return (
    <View style={styles.container}>
      <Text style={styles.balanceNote}>
        You have {userBalance} HP
      </Text>

      <TouchableOpacity
        style={[styles.option, mode === 'casual' && styles.optionSelected]}
        onPress={() => onChange('casual')}
        activeOpacity={0.8}
      >
        <View style={styles.optionLeft}>
          <Text style={styles.optionTitle}>Casual</Text>
          <Text style={styles.optionDesc}>Free · no HP · just hang</Text>
        </View>
        {mode === 'casual' && <View style={styles.selectedDot} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          mode === 'verified' && styles.optionSelected,
          !canVerify && styles.optionDisabled,
        ]}
        onPress={() => canVerify && onChange('verified')}
        activeOpacity={canVerify ? 0.8 : 1}
        disabled={!canVerify}
      >
        <View style={styles.optionLeft}>
          <View style={styles.verifiedTitleRow}>
            <Text style={[styles.optionTitle, !canVerify && { color: '#A1A1AA' }]}>
              Verified
            </Text>
            <View style={styles.hpBadge}>
              <Text style={styles.hpBadgeText}>50 HP stake</Text>
            </View>
          </View>
          <Text style={[styles.optionDesc, !canVerify && { color: '#4B4E57' }]}>
            50 HP stake · leaderboard · certified non-flake
          </Text>
          {!canVerify && (
            <Text style={styles.lockedNote}>
              You need 50 HP to verify. Earn more by hanging out casually first.
            </Text>
          )}
        </View>
        {mode === 'verified' && canVerify && <View style={styles.selectedDot} />}
        {!canVerify && <Text style={styles.lockIcon}>🔒</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
  },
  balanceNote: {
    color: '#A1A1AA',
    fontSize: 13,
    marginBottom: 2,
  },
  option: {
    backgroundColor: '#101114',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: '#00FF85',
    backgroundColor: 'rgba(0,255,133,0.06)',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionLeft: {
    flex: 1,
  },
  optionTitle: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  optionDesc: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  verifiedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  hpBadge: {
    backgroundColor: 'rgba(0,255,133,0.12)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  hpBadgeText: {
    color: '#00FF85',
    fontSize: 11,
    fontWeight: '600',
  },
  lockedNote: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF85',
    marginLeft: 12,
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 12,
  },
});
