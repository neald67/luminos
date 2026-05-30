import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_CURRENT_USER, MOCK_WALLET } from '@/lib/mock-data';
import { ProfileHeader } from '@/components/profile/ProfileHeader';

export default function ProfileScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'You can always sign back in.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.topHeader}>
          <Text style={styles.topTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Profile header */}
        <ProfileHeader
          profile={MOCK_CURRENT_USER}
          onEditPress={() => {}}
          pointsBalance={MOCK_WALLET.balance}
          streak={MOCK_WALLET.streak_days}
          reliabilityLabel={MOCK_WALLET.reliability_label}
          hangoutsCompleted={MOCK_WALLET.hangouts_completed}
        />

        {/* HP Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My HP</Text>
            <View style={styles.hpBadge}>
              <Text style={styles.hpBadgeText}>{MOCK_WALLET.balance} HP</Text>
            </View>
          </View>

          <View style={styles.hpStats}>
            <View style={styles.hpStat}>
              <Text style={styles.hpStatValue}>{MOCK_WALLET.total_earned}</Text>
              <Text style={styles.hpStatLabel}>Total earned</Text>
            </View>
            <View style={styles.hpDivider} />
            <View style={styles.hpStat}>
              <Text style={styles.hpStatValue}>{MOCK_WALLET.streak_days}</Text>
              <Text style={styles.hpStatLabel}>Day streak 🔥</Text>
            </View>
            <View style={styles.hpDivider} />
            <View style={styles.hpStat}>
              <Text style={styles.hpStatValue}>
                {Math.round(MOCK_WALLET.reliability_score * 100)}%
              </Text>
              <Text style={styles.hpStatLabel}>Show-up rate</Text>
            </View>
          </View>

          <View style={styles.reliabilityRow}>
            <View style={styles.reliabilityDot} />
            <Text style={styles.reliabilityLabel}>{MOCK_WALLET.reliability_label}</Text>
            <Text style={styles.reliabilityDetail}>
              {MOCK_WALLET.hangouts_completed} completed · {MOCK_WALLET.hangouts_bailed} bail
            </Text>
          </View>
        </View>

        {/* Settings links */}
        <View style={styles.linksCard}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.linkIcon}>⚙️</Text>
            <Text style={styles.linkLabel}>Settings & Privacy</Text>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.linkDivider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/safety')}
          >
            <Text style={styles.linkIcon}>🛡️</Text>
            <Text style={styles.linkLabel}>Safety & Guidelines</Text>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.linkDivider} />
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkIcon}>❓</Text>
            <Text style={styles.linkLabel}>Help & Support</Text>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Hangout v0.1.0 · Made with ☕ and cope</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingBottom: 100,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  topTitle: {
    color: '#F4F4F5',
    fontSize: 24,
    fontWeight: '700',
  },
  settingsBtn: {
    padding: 6,
  },
  settingsIcon: {
    fontSize: 22,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#101114',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '600',
  },
  hpBadge: {
    backgroundColor: 'rgba(0, 255, 133, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.3)',
  },
  hpBadgeText: {
    color: '#00FF85',
    fontSize: 13,
    fontWeight: '700',
  },
  hpStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  hpStat: {
    alignItems: 'center',
    gap: 2,
  },
  hpStatValue: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  hpStatLabel: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  hpDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#262A31',
  },
  reliabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reliabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF85',
  },
  reliabilityLabel: {
    color: '#00FF85',
    fontSize: 13,
    fontWeight: '500',
  },
  reliabilityDetail: {
    color: '#A1A1AA',
    fontSize: 12,
    marginLeft: 4,
  },
  linksCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkIcon: {
    fontSize: 18,
  },
  linkLabel: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  linkChevron: {
    color: '#A1A1AA',
    fontSize: 18,
  },
  linkDivider: {
    height: 1,
    backgroundColor: '#15171C',
    marginLeft: 48,
  },
  signOutBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  signOutText: {
    color: '#FF6B4A',
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    color: '#A1A1AA',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
});
