import React, { useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_PENDING_REQUESTS, MOCK_SENDER_PROFILES } from '@/lib/mock-data';
import { PlanCard } from '@/components/hangout/PlanCard';
import { ReliabilityBadge } from '@/components/profile/ReliabilityBadge';
import { PointsBadge } from '@/components/profile/PointsBadge';
import { BlockButton } from '@/components/safety/BlockButton';
import { ReportButton } from '@/components/safety/ReportButton';

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

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const request = MOCK_PENDING_REQUESTS.find((r) => r.id === id) ?? MOCK_PENDING_REQUESTS[0];
  const sender = MOCK_SENDER_PROFILES[request.sender_id];

  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');

  if (!sender) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Request not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initial = sender.display_name.charAt(0).toUpperCase();
  const bg = avatarColor(sender.display_name);

  const handleAccept = () => {
    setStatus('accepted');
    Alert.alert(
      'Plan locked. 🔒',
      `You&apos;re set to hang with ${sender.display_name}. Meet in public, trust your gut.`,
      [{ text: 'Let&apos;s go', onPress: () => router.back() }]
    );
  };

  const handleDecline = () => {
    setStatus('declined');
    router.back();
  };

  const handleBlock = () => {
    router.back();
  };

  const handleReport = (_category: string) => {
    // report submitted
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Nav header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Plan request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Sender profile section */}
        <View style={styles.senderCard}>
          <View style={styles.senderTopRow}>
            <View style={[styles.avatar, { backgroundColor: bg }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <View style={styles.senderInfo}>
              <Text style={styles.senderName}>{sender.display_name}</Text>
              <Text style={styles.senderUsername}>@{sender.username}</Text>
              {sender.bio ? (
                <Text style={styles.senderBio}>{sender.bio}</Text>
              ) : null}
            </View>
            <PointsBadge points={320} />
          </View>
          <View style={styles.senderBadges}>
            <ReliabilityBadge label="Very reliable" />
          </View>
        </View>

        {/* Plan card */}
        <PlanCard request={request} senderProfile={sender} />

        {/* Actions */}
        {status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptText}>Accept plan ✓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.declineBtn}
              onPress={handleDecline}
              activeOpacity={0.7}
            >
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>

            <View style={styles.safetyActions}>
              <BlockButton username={sender.username} onBlock={handleBlock} />
              <ReportButton username={sender.username} onReport={handleReport} />
            </View>
          </View>
        )}

        {status === 'accepted' && (
          <View style={styles.acceptedBanner}>
            <Text style={styles.acceptedText}>Plan locked. 🔒</Text>
            <Text style={styles.acceptedSub}>
              You&apos;re on for it with {sender.display_name}.
            </Text>
          </View>
        )}

        {/* Safety footer */}
        <View style={styles.safetyFooter}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <Text style={styles.safetyText}>
            Meet in public. Trust your gut. Bail safely anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#15171C',
  },
  backBtn: {
    width: 40,
    padding: 4,
  },
  backIcon: {
    color: '#F4F4F5',
    fontSize: 28,
    fontWeight: '300',
  },
  navTitle: {
    color: '#F4F4F5',
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 60,
  },
  senderCard: {
    backgroundColor: '#101114',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  senderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#050505',
    fontSize: 20,
    fontWeight: '700',
  },
  senderInfo: {
    flex: 1,
    gap: 2,
  },
  senderName: {
    color: '#F4F4F5',
    fontSize: 17,
    fontWeight: '600',
  },
  senderUsername: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  senderBio: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 17,
    marginTop: 3,
  },
  senderBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  actions: {
    gap: 10,
  },
  acceptBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptText: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  declineText: {
    color: '#A1A1AA',
    fontSize: 15,
    fontWeight: '500',
  },
  safetyActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  acceptedBanner: {
    backgroundColor: 'rgba(0, 255, 133, 0.08)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.25)',
  },
  acceptedText: {
    color: '#00FF85',
    fontSize: 18,
    fontWeight: '700',
  },
  acceptedSub: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  safetyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  safetyIcon: {
    fontSize: 14,
  },
  safetyText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontStyle: 'italic',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  backLink: {
    color: '#4DA3FF',
    fontSize: 14,
  },
});
