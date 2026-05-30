import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HostEventCard, HostEvent } from '@/components/host/HostEventCard';
import { HostProfileCard, HostProfile } from '@/components/host/HostProfileCard';
import { HostProUpsell } from '@/components/host/HostProUpsell';
import { getEntitlements } from '@/lib/entitlements';

// Mock host events
const MOCK_HOST_EVENTS: HostEvent[] = [
  {
    id: '1',
    title: 'Boba Study Night',
    category: 'Study',
    startTime: new Date(Date.now() + 4 * 3600000).toISOString(),
    generalLocation: 'SOMA library area',
    rsvpCount: 8,
    isPaid: false,
    isPublicPlace: true,
    safetyNotes: 'Meet inside the library entrance.',
    description: 'Bring your laptop. We study, chat, sip boba. Low pressure, good vibes.',
  },
  {
    id: '2',
    title: 'Pickup Basketball Run',
    category: 'Sports',
    startTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
      d.setHours(10, 0, 0, 0);
      return d.toISOString();
    })(),
    generalLocation: 'Mission Rec Center',
    rsvpCount: 12,
    isPaid: false,
    isPublicPlace: true,
    description: 'Casual pickup run. All skill levels welcome. Bring water.',
  },
  {
    id: '3',
    title: 'Downtown Photo Walk',
    category: 'Creative',
    startTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + ((0 - d.getDay() + 7) % 7 || 7));
      d.setHours(15, 0, 0, 0);
      return d.toISOString();
    })(),
    generalLocation: 'Embarcadero',
    rsvpCount: 6,
    isPaid: false,
    isPublicPlace: true,
    description: 'Walk, shoot, share. Bring any camera — phone is fine.',
  },
  {
    id: '4',
    title: 'Board Game Hangout',
    category: 'Games',
    startTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
      d.setHours(18, 0, 0, 0);
      return d.toISOString();
    })(),
    generalLocation: 'Local game cafe',
    rsvpCount: 15,
    isPaid: false,
    isPublicPlace: true,
    description: 'Games provided. Show up, meet people, have fun.',
  },
  {
    id: '5',
    title: 'Open Mic Chill Night',
    category: 'Music',
    startTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
      d.setHours(20, 0, 0, 0);
      return d.toISOString();
    })(),
    generalLocation: 'Local venue',
    rsvpCount: 22,
    isPaid: false,
    isPublicPlace: true,
    description: 'Open mic set. Come perform or just vibe in the crowd.',
  },
];

const MOCK_HOST_PROFILES: HostProfile[] = [
  {
    id: 'h1',
    name: 'Community Corner',
    hostType: 'community',
    isVerified: true,
    description: 'Organizing local hangouts and meetups across the city.',
    avatarColor: '#4DA3FF',
  },
  {
    id: 'h2',
    name: 'SF Campus Events',
    hostType: 'campus',
    isVerified: true,
    description: 'Student-run events on campus and around the city.',
    avatarColor: '#00FF85',
  },
];

export default function HostTab() {
  const router = useRouter();
  const entitlements = getEntitlements();
  const [rsvpSet, setRsvpSet] = useState<Set<string>>(new Set());

  function toggleRSVP(id: string) {
    setRsvpSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Host</Text>
        </View>

        {/* Featured Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Events</Text>
          {MOCK_HOST_EVENTS.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.9}
            >
              <HostEventCard
                event={event}
                onRSVP={() => toggleRSVP(event.id)}
                isRSVPd={rsvpSet.has(event.id)}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Host Profiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Hosts</Text>
          {MOCK_HOST_PROFILES.map((host) => (
            <HostProfileCard key={host.id} host={host} />
          ))}
        </View>

        {/* Want to host? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Want to Host?</Text>
          {entitlements.canCreateHostEvent ? (
            <TouchableOpacity
              style={styles.createEventBtn}
              onPress={() => {/* navigate to create event */}}
              activeOpacity={0.85}
            >
              <Text style={styles.createEventBtnText}>Create an event</Text>
            </TouchableOpacity>
          ) : (
            <HostProUpsell />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  createEventBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  createEventBtnText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});
