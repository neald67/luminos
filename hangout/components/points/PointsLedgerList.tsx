import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export interface PointsLedgerEntry {
  id: string;
  type:
    | 'onboarding_bonus'
    | 'stake_locked'
    | 'stake_returned'
    | 'completion_bonus'
    | 'profile_bonus'
    | 'safety_bonus'
    | 'stake_forfeit'
    | 'respect_rebate';
  amount: number;
  status: 'approved' | 'pending' | 'held' | 'forfeited';
  createdAt: string;
  description?: string;
}

const TYPE_LABELS: Record<PointsLedgerEntry['type'], string> = {
  onboarding_bonus: 'Onboarding bonus',
  stake_locked: 'Stake locked',
  stake_returned: 'Stake returned',
  completion_bonus: 'Completion bonus',
  profile_bonus: 'Profile bonus',
  safety_bonus: 'Safety onboarding bonus',
  stake_forfeit: 'Stake forfeited',
  respect_rebate: 'Respect rebate',
};

const STATUS_COLORS: Record<PointsLedgerEntry['status'], string> = {
  approved: '#00FF85',
  pending: '#4DA3FF',
  held: '#F59E0B',
  forfeited: '#FF6B4A',
};

interface PointsLedgerListProps {
  entries: PointsLedgerEntry[];
}

function LedgerItem({ item }: { item: PointsLedgerEntry }) {
  const isPositive = item.amount > 0;
  const label = TYPE_LABELS[item.type] ?? item.type;

  const date = new Date(item.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={styles.row}>
      <View style={styles.leftCol}>
        <Text style={styles.typeLabel}>{label}</Text>
        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}
        <Text style={styles.date}>{dateStr}</Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.amount, { color: isPositive ? '#00FF85' : '#FF6B4A' }]}>
          {isPositive ? '+' : ''}
          {item.amount} HP
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${STATUS_COLORS[item.status]}18` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function PointsLedgerList({ entries }: PointsLedgerListProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No transactions yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <LedgerItem item={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      scrollEnabled={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftCol: {
    flex: 1,
    marginRight: 12,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  typeLabel: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  date: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 3,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  separator: {
    height: 1,
    backgroundColor: '#262A31',
    marginHorizontal: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
});
