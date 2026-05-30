import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CrewAvailabilityBoard, MemberAvailability } from '@/components/crews/CrewAvailabilityBoard';
import { CrewPollCard } from '@/components/crews/CrewPollCard';

const MOCK_MEMBERS: MemberAvailability[] = [
  {
    profile: { id: '1', displayName: 'Maya', username: 'maya.h', avatarColor: '#4DA3FF' },
    isAvailable: true,
    availableFor: ['coffee', 'food'],
  },
  {
    profile: { id: '2', displayName: 'Jordan', username: 'jordanr', avatarColor: '#00FF85' },
    isAvailable: true,
    availableFor: ['walk', 'food'],
  },
  {
    profile: { id: '3', displayName: 'Priya', username: 'priya.m', avatarColor: '#F59E0B' },
    isAvailable: false,
    availableFor: [],
  },
  {
    profile: { id: '4', displayName: 'Zack', username: 'zackw', avatarColor: '#A1A1AA' },
    isAvailable: false,
    availableFor: [],
  },
];

const MOCK_POLLS = [
  {
    question: 'What should we do this weekend?',
    options: ['Boba run', 'Thrift shopping', 'Park hangout', 'Movie night'],
    votes: [3, 1, 4, 2],
  },
  {
    question: 'Best time to hang this week?',
    options: ['Thu evening', 'Fri night', 'Sat afternoon', 'Sun morning'],
    votes: [2, 5, 3, 1],
  },
];

export default function CrewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // In a real app, fetch crew by id
  const crewName = id === '1' ? 'Core Crew' : id === '2' ? 'Campus Homies' : `Crew ${id}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{crewName}</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Members / Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who's Free</Text>
          <CrewAvailabilityBoard members={MOCK_MEMBERS} />
        </View>

        {/* Active Hangout Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Hangout</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active hangout right now.</Text>
            <TouchableOpacity style={styles.startHangoutBtn}>
              <Text style={styles.startHangoutText}>Start a hangout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Polls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Polls</Text>
          {MOCK_POLLS.map((poll, idx) => (
            <CrewPollCard
              key={idx}
              question={poll.question}
              options={poll.options}
              votes={poll.votes}
            />
          ))}
        </View>

        {/* Group Chat Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crew Chat</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Crew chat coming soon.</Text>
          </View>
        </View>

        {/* Crew+ Upsell */}
        <View style={styles.upsellBanner}>
          <Text style={styles.upsellText}>
            Crew+ unlocks AI group planner, best overlap time, and advanced polls.
          </Text>
          <TouchableOpacity
            style={styles.upsellBtn}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upsellBtnText}>$7.99/mo · Crew+</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#4DA3FF',
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  settingsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  settingsIcon: {
    color: '#A1A1AA',
    fontSize: 18,
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
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: '#101114',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
    marginBottom: 12,
  },
  startHangoutBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  startHangoutText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '700',
  },
  upsellBanner: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(77,163,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(77,163,255,0.25)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  upsellText: {
    color: '#F4F4F5',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  upsellBtn: {
    backgroundColor: '#4DA3FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  upsellBtnText: {
    color: '#050505',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});
