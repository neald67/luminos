import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RSVPButton } from '@/components/host/RSVPButton';
import { HostProfileCard, HostProfile } from '@/components/host/HostProfileCard';

// Mock data matching host tab events
const MOCK_EVENTS: Record<
  string,
  {
    id: string;
    title: string;
    category: string;
    startTime: string;
    endTime?: string;
    generalLocation: string;
    rsvpCount: number;
    capacity?: number;
    isPaid: boolean;
    isPublicPlace: boolean;
    safetyNotes?: string;
    description: string;
    host: HostProfile;
  }
> = {
  '1': {
    id: '1',
    title: 'Boba Study Night',
    category: 'Study',
    startTime: new Date(Date.now() + 4 * 3600000).toISOString(),
    endTime: new Date(Date.now() + 7 * 3600000).toISOString(),
    generalLocation: 'SOMA library area',
    rsvpCount: 8,
    capacity: 20,
    isPaid: false,
    isPublicPlace: true,
    safetyNotes: 'Meet inside the library entrance. Well-lit public space.',
    description:
      'Bring your laptop. We study, chat, sip boba. Low pressure, good vibes only. Perfect for meeting new people without the awkwardness of a purely social event.',
    host: {
      id: 'h2',
      name: 'SF Campus Events',
      hostType: 'campus',
      isVerified: true,
      description: 'Student-run events on campus and around the city.',
      avatarColor: '#00FF85',
    },
  },
  '2': {
    id: '2',
    title: 'Pickup Basketball Run',
    category: 'Sports',
    startTime: new Date(Date.now() + 48 * 3600000).toISOString(),
    generalLocation: 'Mission Rec Center',
    rsvpCount: 12,
    capacity: 20,
    isPaid: false,
    isPublicPlace: true,
    description: 'Casual pickup run. All skill levels welcome. Bring water and wear athletic shoes.',
    host: {
      id: 'h1',
      name: 'Community Corner',
      hostType: 'community',
      isVerified: true,
      description: 'Organizing local hangouts and meetups across the city.',
      avatarColor: '#4DA3FF',
    },
  },
};

function formatFullTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isRSVPd, setIsRSVPd] = useState(false);

  const event = MOCK_EVENTS[id ?? ''] ?? MOCK_EVENTS['1'];

  function handleReport() {
    Alert.alert(
      'Report Event',
      'Are you sure you want to report this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => Alert.alert('Thank you', 'Your report has been submitted.'),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.topRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            {event.isPublicPlace && (
              <View style={styles.publicBadge}>
                <Text style={styles.publicBadgeText}>Public place recommended</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{event.title}</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow icon="🕐" label="When" value={formatFullTime(event.startTime)} />
          {event.endTime && (
            <DetailRow icon="🕓" label="Until" value={formatFullTime(event.endTime)} />
          )}
          <DetailRow icon="📍" label="Where" value={event.generalLocation} />
          <DetailRow
            icon="👥"
            label="Going"
            value={`${event.rsvpCount}${event.capacity ? ` / ${event.capacity} spots` : ' going'}`}
          />
          <DetailRow icon="💰" label="Price" value={event.isPaid ? 'Paid at venue' : 'Free'} />
        </View>

        <View style={styles.descSection}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {event.safetyNotes && (
          <View style={styles.safetyCard}>
            <Text style={styles.safetyIcon}>🛡</Text>
            <View style={styles.safetyText}>
              <Text style={styles.safetyLabel}>Safety notes</Text>
              <Text style={styles.safetyNote}>{event.safetyNotes}</Text>
            </View>
          </View>
        )}

        <View style={styles.hostSection}>
          <Text style={styles.sectionLabel}>Hosted by</Text>
          <HostProfileCard host={event.host} />
        </View>

        <View style={styles.rsvpSection}>
          <RSVPButton isRSVPd={isRSVPd} onPress={() => setIsRSVPd((p) => !p)} />
          <Text style={styles.locationNote}>
            You'll receive the exact location after RSVP if the host chooses to share it.
          </Text>
        </View>

        <TouchableOpacity style={styles.reportBtn} onPress={handleReport}>
          <Text style={styles.reportText}>Report this event</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#4DA3FF',
    fontSize: 15,
    fontWeight: '500',
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: 'rgba(77,163,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  categoryText: {
    color: '#4DA3FF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  publicBadge: {
    backgroundColor: 'rgba(0,255,133,0.10)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  publicBadgeText: {
    color: '#00FF85',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#F4F4F5',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  detailsCard: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '500',
  },
  descSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  description: {
    color: '#F4F4F5',
    fontSize: 15,
    lineHeight: 22,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,255,133,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,255,133,0.2)',
    marginHorizontal: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  safetyIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  safetyText: {
    flex: 1,
  },
  safetyLabel: {
    color: '#00FF85',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  safetyNote: {
    color: '#F4F4F5',
    fontSize: 13,
    lineHeight: 18,
  },
  hostSection: {
    marginBottom: 16,
  },
  rsvpSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  locationNote: {
    color: '#A1A1AA',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  reportBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  reportText: {
    color: '#FF6B4A',
    fontSize: 13,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});
