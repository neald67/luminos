import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  username: string;
  score: number;
  isCurrentUser: boolean;
}

type Scope = 'Friends' | 'Crew' | 'City';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.rankGold}>#1</Text>;
  if (rank === 2) return <Text style={styles.rankSilver}>#2</Text>;
  if (rank === 3) return <Text style={styles.rankBronze}>#3</Text>;
  return <Text style={styles.rankDefault}>#{rank}</Text>;
}

function LeaderboardRow({ item }: { item: LeaderboardEntry }) {
  const isTop = item.rank === 1;
  return (
    <View
      style={[
        styles.row,
        item.isCurrentUser && styles.rowCurrentUser,
        isTop && styles.rowTop,
      ]}
    >
      <View style={styles.rankCol}>
        <RankBadge rank={item.rank} />
      </View>
      <View style={styles.nameCol}>
        <Text style={styles.displayName}>
          {item.displayName}
          {item.isCurrentUser ? ' (you)' : ''}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <Text style={[styles.score, isTop && { color: '#00FF85' }]}>
        {item.score} HP
      </Text>
    </View>
  );
}

export function LeaderboardList({ entries }: LeaderboardListProps) {
  const [scope, setScope] = useState<Scope>('Friends');
  const scopes: Scope[] = ['Friends', 'Crew', 'City'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top 10 This Week</Text>
        <Text style={styles.resetNote}>Resets every Monday</Text>
      </View>

      <View style={styles.scopeRow}>
        {scopes.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.scopeBtn, scope === s && styles.scopeBtnActive]}
            onPress={() => setScope(s)}
          >
            <Text style={[styles.scopeText, scope === s && styles.scopeTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.rank)}
        renderItem={({ item }) => <LeaderboardRow item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
  },
  resetNote: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  scopeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  scopeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#15171C',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  scopeBtnActive: {
    backgroundColor: 'rgba(0,255,133,0.12)',
    borderColor: '#00FF85',
  },
  scopeText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  scopeTextActive: {
    color: '#00FF85',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowCurrentUser: {
    backgroundColor: 'rgba(77,163,255,0.08)',
  },
  rowTop: {
    backgroundColor: 'rgba(0,255,133,0.06)',
  },
  rankCol: {
    width: 36,
  },
  rankGold: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '800',
  },
  rankSilver: {
    color: '#C0C0C0',
    fontSize: 14,
    fontWeight: '700',
  },
  rankBronze: {
    color: '#CD7F32',
    fontSize: 14,
    fontWeight: '700',
  },
  rankDefault: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  nameCol: {
    flex: 1,
  },
  displayName: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
  },
  username: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 1,
  },
  score: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#262A31',
    marginHorizontal: 16,
  },
});
