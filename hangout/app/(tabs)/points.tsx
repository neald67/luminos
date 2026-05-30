import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { PointsWalletCard } from '@/components/points/PointsWalletCard';
import { PointsExplainer } from '@/components/points/PointsExplainer';
import { LeaderboardList, LeaderboardEntry } from '@/components/points/LeaderboardList';
import { PointsLedgerList, PointsLedgerEntry } from '@/components/points/PointsLedgerList';
import { BadgeGrid } from '@/components/points/BadgeGrid';

type Tab = 'Leaderboard' | 'Wallet' | 'Badges';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, displayName: 'Lena', username: 'lena.k', score: 445, isCurrentUser: false },
  { rank: 2, displayName: 'Maya', username: 'maya.h', score: 320, isCurrentUser: false },
  { rank: 3, displayName: 'You', username: 'you', score: 310, isCurrentUser: true },
  { rank: 4, displayName: 'Darius', username: 'dariusb', score: 280, isCurrentUser: false },
  { rank: 5, displayName: 'Sofia', username: 'sofiav', score: 255, isCurrentUser: false },
  { rank: 6, displayName: 'Jordan', username: 'jordanr', score: 240, isCurrentUser: false },
  { rank: 7, displayName: 'Priya', username: 'priya.m', score: 210, isCurrentUser: false },
  { rank: 8, displayName: 'Zack', username: 'zackw', score: 190, isCurrentUser: false },
  { rank: 9, displayName: 'Ella', username: 'ellaf', score: 165, isCurrentUser: false },
  { rank: 10, displayName: 'Chris', username: 'chrisp', score: 140, isCurrentUser: false },
];

const MOCK_LEDGER: PointsLedgerEntry[] = [
  {
    id: '1',
    type: 'onboarding_bonus',
    amount: 100,
    status: 'approved',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    description: 'Welcome to Hangout!',
  },
  {
    id: '2',
    type: 'safety_bonus',
    amount: 25,
    status: 'approved',
    createdAt: new Date(Date.now() - 13 * 86400000).toISOString(),
  },
  {
    id: '3',
    type: 'profile_bonus',
    amount: 25,
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: '4',
    type: 'stake_locked',
    amount: -50,
    status: 'held',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    description: 'Verified hangout stake',
  },
  {
    id: '5',
    type: 'stake_returned',
    amount: 50,
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    description: 'Stake returned — showed up!',
  },
  {
    id: '6',
    type: 'completion_bonus',
    amount: 30,
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    description: 'Coffee + Walk (75 min)',
  },
  {
    id: '7',
    type: 'stake_locked',
    amount: -50,
    status: 'held',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: 'Verified hangout stake',
  },
  {
    id: '8',
    type: 'stake_returned',
    amount: 50,
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '9',
    type: 'completion_bonus',
    amount: 35,
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: 'Boba Study Session (90 min)',
  },
  {
    id: '10',
    type: 'completion_bonus',
    amount: 55,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    description: 'Thrift + Food Run (120 min) — pending review',
  },
];

const MOCK_EARNED_BADGES = [
  'Actually Shows Up',
  'New Here',
  'Public Place Pro',
  'Low Flake Risk',
];

export default function PointsTab() {
  const [activeTab, setActiveTab] = useState<Tab>('Leaderboard');
  const tabs: Tab[] = ['Leaderboard', 'Wallet', 'Badges'];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hangout Points</Text>
        </View>

        <PointsWalletCard
          balance={320}
          weeklyScore={75}
          streak={4}
          lifetimeEarned={645}
        />

        <PointsExplainer />

        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Leaderboard' && (
          <View style={styles.section}>
            <LeaderboardList entries={MOCK_LEADERBOARD} />
            <Text style={styles.resetNote}>Resets every Monday at midnight.</Text>
          </View>
        )}

        {activeTab === 'Wallet' && (
          <View style={styles.section}>
            <PointsLedgerList entries={MOCK_LEDGER} />
          </View>
        )}

        {activeTab === 'Badges' && (
          <View style={styles.section}>
            <BadgeGrid badges={MOCK_EARNED_BADGES} />
          </View>
        )}

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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#101114',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#262A31',
  },
  tabText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#F4F4F5',
  },
  section: {
    marginBottom: 16,
  },
  resetNote: {
    color: '#A1A1AA',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  bottomPadding: {
    height: 40,
  },
});
