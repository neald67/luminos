import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface HostProfile {
  id: string;
  name: string;
  hostType: 'individual' | 'venue' | 'community' | 'campus';
  isVerified: boolean;
  description?: string;
  avatarColor?: string;
}

interface HostProfileCardProps {
  host: HostProfile;
}

const HOST_TYPE_LABELS: Record<HostProfile['hostType'], string> = {
  individual: 'Individual Host',
  venue: 'Venue',
  community: 'Community',
  campus: 'Campus Org',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function HostProfileCard({ host }: HostProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: host.avatarColor ?? '#262A31' }]}>
          <Text style={styles.avatarInitials}>{getInitials(host.name)}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{host.name}</Text>
            {host.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{HOST_TYPE_LABELS[host.hostType]}</Text>
          </View>
        </View>
      </View>

      {host.description ? (
        <Text style={styles.description}>{host.description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(0,255,133,0.12)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  verifiedText: {
    color: '#00FF85',
    fontSize: 11,
    fontWeight: '600',
  },
  typePill: {
    backgroundColor: '#15171C',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '500',
  },
  description: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
});
