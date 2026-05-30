import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface MemberAvailability {
  profile: {
    id: string;
    displayName: string;
    username: string;
    avatarColor?: string;
  };
  isAvailable: boolean;
  availableFor: string[];
}

interface CrewAvailabilityBoardProps {
  members: MemberAvailability[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function AvailableForChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export function CrewAvailabilityBoard({ members }: CrewAvailabilityBoardProps) {
  const availableMembers = members.filter((m) => m.isAvailable);
  const totalCount = members.length;
  const availableCount = availableMembers.length;

  // Compute best overlap time and top vibe (simple mock computation)
  const allVibes = availableMembers.flatMap((m) => m.availableFor);
  const vibeCounts: Record<string, number> = {};
  for (const v of allVibes) {
    vibeCounts[v] = (vibeCounts[v] ?? 0) + 1;
  }
  const topVibe = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {availableCount}/{totalCount} members free rn
        </Text>
        {topVibe && (
          <Text style={styles.summaryMeta}>Top vibe: {topVibe}</Text>
        )}
      </View>

      {members.map((member) => (
        <View key={member.profile.id} style={styles.memberRow}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: member.profile.avatarColor ?? '#262A31' },
              ]}
            >
              <Text style={styles.avatarInitials}>
                {getInitials(member.profile.displayName)}
              </Text>
            </View>
            {member.isAvailable && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.profile.displayName}</Text>
            <View style={styles.chipsRow}>
              {member.isAvailable ? (
                member.availableFor.length > 0 ? (
                  member.availableFor.map((v) => (
                    <AvailableForChip key={v} label={v} />
                  ))
                ) : (
                  <Text style={styles.freeNow}>Free now</Text>
                )
              ) : (
                <Text style={styles.notAvail}>Not available</Text>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101114',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 12,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262A31',
  },
  summaryText: {
    color: '#00FF85',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryMeta: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF85',
    borderWidth: 2,
    borderColor: '#101114',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    backgroundColor: 'rgba(77,163,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    color: '#4DA3FF',
    fontSize: 11,
    fontWeight: '600',
  },
  freeNow: {
    color: '#00FF85',
    fontSize: 12,
    fontWeight: '500',
  },
  notAvail: {
    color: '#4B4E57',
    fontSize: 12,
  },
});
