import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CrewCard, Crew } from '@/components/crews/CrewCard';

const MOCK_CREWS: Array<{ crew: Crew; memberCount: number; onlineCount: number }> = [
  {
    crew: { id: '1', name: 'Core Crew', avatarColor: '#4DA3FF' },
    memberCount: 4,
    onlineCount: 2,
  },
  {
    crew: { id: '2', name: 'Campus Homies', avatarColor: '#00FF85' },
    memberCount: 7,
    onlineCount: 0,
  },
];

export default function CrewsTab() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [localCrews, setLocalCrews] = useState(MOCK_CREWS);

  function handleCreateCrew() {
    if (!crewName.trim()) return;
    const newCrew = {
      crew: {
        id: String(Date.now()),
        name: crewName.trim(),
        avatarColor: '#A1A1AA',
      },
      memberCount: 1,
      onlineCount: 0,
    };
    setLocalCrews((prev) => [...prev, newCrew]);
    setCrewName('');
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Crews</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createBtnText}>+ Create crew</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Crews</Text>

          {localCrews.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No crews yet. Create one or ask a friend to add you.
              </Text>
            </View>
          ) : (
            localCrews.map((item) => (
              <CrewCard
                key={item.crew.id}
                crew={item.crew}
                memberCount={item.memberCount}
                onlineCount={item.onlineCount}
                onPress={() => router.push(`/crew/${item.crew.id}`)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover</Text>
          <View style={styles.discoverCard}>
            <Text style={styles.discoverIcon}>🌐</Text>
            <Text style={styles.discoverText}>
              Coming soon: find crews from your campus
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Create a Crew</Text>
            <Text style={styles.modalHint}>Up to 10 members on free plan.</Text>

            <TextInput
              style={styles.input}
              placeholder="Crew name..."
              placeholderTextColor="#4B4E57"
              value={crewName}
              onChangeText={setCrewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateCrew}
            />

            <TouchableOpacity
              style={[styles.modalCreateBtn, !crewName.trim() && styles.modalCreateBtnDisabled]}
              onPress={handleCreateCrew}
              disabled={!crewName.trim()}
            >
              <Text style={styles.modalCreateBtnText}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => {
                setModalVisible(false);
                setCrewName('');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  createBtnText: {
    color: '#050505',
    fontSize: 13,
    fontWeight: '700',
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
  emptyState: {
    marginHorizontal: 16,
    backgroundColor: '#101114',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  discoverCard: {
    marginHorizontal: 16,
    backgroundColor: '#101114',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discoverIcon: {
    fontSize: 24,
  },
  discoverText: {
    color: '#A1A1AA',
    fontSize: 14,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0A0A0B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderColor: '#262A31',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#262A31',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#F4F4F5',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalHint: {
    color: '#A1A1AA',
    fontSize: 13,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#101114',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262A31',
    color: '#F4F4F5',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  modalCreateBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCreateBtnDisabled: {
    opacity: 0.4,
  },
  modalCreateBtnText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#A1A1AA',
    fontSize: 15,
  },
});
