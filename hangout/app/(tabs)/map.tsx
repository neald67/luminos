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
import type { NearbyUser } from '@/lib/types';
import { MOCK_NEARBY_USERS } from '@/lib/mock-data';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { RequestComposer } from '@/components/hangout/RequestComposer';
import type { HangoutRequest } from '@/lib/types';

type ViewMode = 'map' | 'list';

// Simple mock map grid lines for visual interest
function MapBackground() {
  return (
    <View style={mapStyles.bg}>
      {/* Horizontal grid lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={`h${i}`} style={[mapStyles.hLine, { top: `${(i + 1) * 12}%` as any }]} />
      ))}
      {/* Vertical grid lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={`v${i}`} style={[mapStyles.vLine, { left: `${(i + 1) * 16}%` as any }]} />
      ))}

      {/* Mock location pins */}
      {MOCK_NEARBY_USERS.slice(0, 4).map((u, i) => {
        const positions = [
          { top: '30%', left: '40%' },
          { top: '55%', left: '25%' },
          { top: '45%', left: '65%' },
          { top: '25%', left: '70%' },
        ];
        const pos = positions[i];
        return (
          <View key={u.user_id} style={[mapStyles.pin, pos as any]}>
            <View style={mapStyles.pinDot} />
            <Text style={mapStyles.pinLabel}>{u.display_name}</Text>
          </View>
        );
      })}

      {/* Center marker — "you" */}
      <View style={mapStyles.centerPin}>
        <View style={mapStyles.centerDot} />
        <Text style={mapStyles.centerLabel}>You</Text>
      </View>

      {/* Note */}
      <View style={mapStyles.noteChip}>
        <Text style={mapStyles.noteText}>No exact location. We are not doing crime documentary vibes.</Text>
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#0A0C0E',
    position: 'relative',
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#1A1D24',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#1A1D24',
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    gap: 3,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4DA3FF',
    borderWidth: 2,
    borderColor: '#050505',
  },
  pinLabel: {
    color: '#F4F4F5',
    fontSize: 10,
    fontWeight: '500',
    backgroundColor: 'rgba(5,5,5,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    gap: 3,
    transform: [{ translateX: -8 }, { translateY: -20 }],
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00FF85',
    borderWidth: 2,
    borderColor: '#050505',
    shadowColor: '#00FF85',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  centerLabel: {
    color: '#00FF85',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(5,5,5,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  noteChip: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(5,5,5,0.85)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  noteText: {
    color: '#A1A1AA',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default function MapScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerTarget, setComposerTarget] = useState<NearbyUser | null>(null);

  const handleDropPlan = (user: NearbyUser) => {
    setComposerTarget(user);
    setComposerVisible(true);
  };

  const handleSendRequest = (_req: Partial<HangoutRequest>) => {
    // API call in real app
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby</Text>
        {/* Segmented control */}
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segBtn, viewMode === 'map' && styles.segBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.segText, viewMode === 'map' && styles.segTextActive]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, viewMode === 'list' && styles.segBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.segText, viewMode === 'list' && styles.segTextActive]}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <MapBackground />
        </View>
      ) : (
        <FlatList
          data={MOCK_NEARBY_USERS}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProfileCard user={item} onDropPlan={() => handleDropPlan(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nobody nearby is free. Tragic.</Text>
            </View>
          }
        />
      )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 20,
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
  mapContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#A1A1AA',
    fontSize: 15,
    textAlign: 'center',
  },
});
