import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import type { ActivityType, NearbyUser } from '@/lib/types';
import { MOCK_NEARBY_USERS, MOCK_CURRENT_USER, MOCK_WALLET } from '@/lib/mock-data';
import { AvailabilityCard } from '@/components/availability/AvailabilityCard';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { RequestComposer } from '@/components/hangout/RequestComposer';
import { PointsBadge } from '@/components/profile/PointsBadge';
import type { HangoutRequest } from '@/lib/types';

type ViewMode = 'list' | 'map';

export default function NearbyScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);
  const [radius, setRadius] = useState(3);
  const [duration, setDuration] = useState(60);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [composerVisible, setComposerVisible] = useState(false);
  const [composerTarget, setComposerTarget] = useState<NearbyUser | null>(null);

  const handleDropPlan = (user: NearbyUser) => {
    setComposerTarget(user);
    setComposerVisible(true);
  };

  const handleSendRequest = (req: Partial<HangoutRequest>) => {
    // In a real app, this would call the API
    console.log('Sending request:', req);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      <FlatList
        data={isAvailable ? MOCK_NEARBY_USERS : []}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>hangout</Text>
              <View style={styles.headerRight}>
                <PointsBadge points={MOCK_WALLET.balance} />
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>
                    {MOCK_CURRENT_USER.display_name.charAt(0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Availability Card */}
            <View style={styles.availabilitySection}>
              <AvailabilityCard
                isAvailable={isAvailable}
                onAvailabilityChange={setIsAvailable}
                selectedActivities={selectedActivities}
                onActivitiesChange={setSelectedActivities}
                radius={radius}
                onRadiusChange={setRadius}
                duration={duration}
                onDurationChange={setDuration}
              />
            </View>

            {/* "Who's free?" section header */}
            {isAvailable && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Who&apos;s free?</Text>
                {/* Segmented control */}
                <View style={styles.segmented}>
                  <TouchableOpacity
                    style={[styles.segBtn, viewMode === 'list' && styles.segBtnActive]}
                    onPress={() => setViewMode('list')}
                  >
                    <Text style={[styles.segText, viewMode === 'list' && styles.segTextActive]}>
                      List
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segBtn, viewMode === 'map' && styles.segBtnActive]}
                    onPress={() => setViewMode('map')}
                  >
                    <Text style={[styles.segText, viewMode === 'map' && styles.segTextActive]}>
                      Map
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Map placeholder */}
            {isAvailable && viewMode === 'map' && (
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>🗺️</Text>
                <Text style={styles.mapPlaceholderTitle}>Map view</Text>
                <Text style={styles.mapPlaceholderDesc}>
                  Tap the Map tab for the full view
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) =>
          viewMode === 'list' ? (
            <ProfileCard
              user={item}
              onDropPlan={() => handleDropPlan(item)}
            />
          ) : null
        }
        ListEmptyComponent={
          !isAvailable ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👀</Text>
              <Text style={styles.emptyTitle}>
                Toggle available to see who&apos;s free nearby.
              </Text>
              <Text style={styles.emptySubtitle}>
                Your exact location is never shared.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>😔</Text>
              <Text style={styles.emptyTitle}>Nobody nearby is free. Tragic.</Text>
              <Text style={styles.emptySubtitle}>
                Check back soon — people go available all the time.
              </Text>
            </View>
          )
        }
      />

      {/* Request Composer */}
      {composerTarget && (
        <RequestComposer
          receiverId={composerTarget.user_id}
          receiverName={composerTarget.display_name}
          visible={composerVisible}
          onClose={() => setComposerVisible(false)}
          onSend={handleSendRequest}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logo: {
    color: '#00FF85',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4DA3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '700',
  },
  availabilitySection: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#15171C',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  segBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  segBtnActive: {
    backgroundColor: '#262A31',
  },
  segText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  segTextActive: {
    color: '#F4F4F5',
    fontWeight: '600',
  },
  mapPlaceholder: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#101114',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  mapPlaceholderText: {
    fontSize: 32,
  },
  mapPlaceholderTitle: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '600',
  },
  mapPlaceholderDesc: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#A1A1AA',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
