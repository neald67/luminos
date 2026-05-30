import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PointsWalletCardProps {
  balance: number;
  weeklyScore: number;
  streak: number;
  lifetimeEarned: number;
}

export function PointsWalletCard({
  balance,
  weeklyScore,
  streak,
  lifetimeEarned,
}: PointsWalletCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balance}>{balance} HP</Text>
        <Text style={styles.subtitle}>Earned, never bought.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={styles.weeklyPill}>
            <Text style={styles.weeklyPillText}>+{weeklyScore} this week</Text>
          </View>
        </View>

        <View style={styles.stat}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>streak</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>{lifetimeEarned}</Text>
          <Text style={styles.statLabel}>lifetime HP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balance: {
    color: '#00FF85',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#262A31',
  },
  stat: {
    alignItems: 'center',
  },
  weeklyPill: {
    backgroundColor: 'rgba(0,255,133,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,255,133,0.3)',
  },
  weeklyPillText: {
    color: '#00FF85',
    fontSize: 12,
    fontWeight: '600',
  },
  streakIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    color: '#F4F4F5',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 2,
  },
});
