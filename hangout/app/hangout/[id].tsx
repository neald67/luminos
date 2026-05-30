import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_HANGOUTS, MOCK_SENDER_PROFILES, MOCK_CURRENT_USER } from '@/lib/mock-data';
import { PlanCard } from '@/components/hangout/PlanCard';
import { HangoutStatusCard } from '@/components/hangout/HangoutStatusCard';
import { VerificationChecklist } from '@/components/hangout/VerificationChecklist';
import { QRDisplay } from '@/components/hangout/QRDisplay';
import { QRScannerMock } from '@/components/hangout/QRScannerMock';
import { SafetyBailButton } from '@/components/hangout/SafetyBailButton';
import type { Hangout, HangoutRequest } from '@/lib/types';

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

function mockHangoutToRequest(h: Hangout): HangoutRequest {
  return {
    id: h.request_id,
    sender_id: h.host_id,
    receiver_id: h.participant_ids.find((id) => id !== h.host_id) ?? '',
    crew_id: null,
    event_id: null,
    mode: h.mode,
    activity: h.activity,
    proposed_time: h.proposed_time,
    estimated_duration_minutes: h.estimated_duration_minutes,
    place_name: h.place_name,
    general_location: h.general_location,
    note: '',
    status: 'accepted',
    expires_at: h.proposed_time,
    created_at: h.created_at,
    updated_at: h.updated_at,
  };
}

export default function HangoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const hangout = MOCK_HANGOUTS.find((h) => h.id === id) ?? MOCK_HANGOUTS[0];

  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [qrHandshakeDone, setQrHandshakeDone] = useState(hangout.host_checked_in && hangout.guest_checked_in);
  const [checkedIn, setCheckedIn] = useState(hangout.host_checked_in);
  const [hangoutStatus, setHangoutStatus] = useState(hangout.status);

  const isVerified = hangout.mode === 'verified';

  // Build participant display data
  const participants = hangout.participant_ids.map((pid) => {
    const profile = pid === MOCK_CURRENT_USER.id
      ? MOCK_CURRENT_USER
      : MOCK_SENDER_PROFILES[pid];
    return profile ?? { id: pid, display_name: pid, username: pid };
  });

  const handleScanSuccess = () => {
    setQrHandshakeDone(true);
    setShowScanner(false);
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete hangout?',
      'Mark this hangout as complete.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => setHangoutStatus('completed'),
        },
      ]
    );
  };

  const handleBail = () => {
    setHangoutStatus('bailed');
    router.back();
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel hangout?',
      'This will cancel the plan for both people.',
      [
        { text: 'Never mind', style: 'cancel' },
        {
          text: 'Cancel plan',
          style: 'destructive',
          onPress: () => {
            setHangoutStatus('cancelled');
            router.back();
          },
        },
      ]
    );
  };

  const displayHangout = { ...hangout, status: hangoutStatus };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Nav header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Hangout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status card */}
        <HangoutStatusCard hangout={displayHangout} />

        {/* Plan card */}
        <PlanCard request={mockHangoutToRequest(hangout)} />

        {/* Participants */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Who&apos;s coming</Text>
          <View style={styles.participantsList}>
            {participants.map((p) => {
              const name = 'display_name' in p ? p.display_name : p.id;
              const initial = name.charAt(0).toUpperCase();
              const bg = avatarColor(name);
              const isYou = p.id === MOCK_CURRENT_USER.id;
              return (
                <View key={p.id} style={styles.participantRow}>
                  <View style={[styles.avatar, { backgroundColor: bg }]}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{name}</Text>
                    {isYou && <Text style={styles.youLabel}>You</Text>}
                  </View>
                  {p.id === hangout.host_id && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>Host</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Verification checklist (verified mode only) */}
        {isVerified && (
          <VerificationChecklist
            stakeLocked
            qrHandshake={qrHandshakeDone}
            durationMet={hangoutStatus === 'completed'}
            completed={hangoutStatus === 'completed'}
            pointsStatus={
              hangoutStatus === 'completed'
                ? 'earned'
                : hangoutStatus === 'bailed'
                ? 'forfeited'
                : 'pending'
            }
          />
        )}

        {/* Actions */}
        {hangoutStatus !== 'completed' && hangoutStatus !== 'cancelled' && hangoutStatus !== 'bailed' && (
          <View style={styles.actionsSection}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setShowQR(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>Show my QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setShowScanner(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>Scan QR</Text>
              </TouchableOpacity>
            </View>

            {!checkedIn && (
              <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn}>
                <Text style={styles.checkInText}>I&apos;m here ✓</Text>
              </TouchableOpacity>
            )}
            {checkedIn && (
              <View style={styles.checkedInBanner}>
                <Text style={styles.checkedInText}>✓ Checked in</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleComplete}
            >
              <Text style={styles.completeBtnText}>Complete hangout</Text>
            </TouchableOpacity>

            <SafetyBailButton onBail={handleBail} />

            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel plan</Text>
            </TouchableOpacity>
          </View>
        )}

        {hangoutStatus === 'completed' && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>Touch grass confirmed. 🌿</Text>
            {isVerified && (
              <Text style={styles.completedPoints}>+50 HP earned!</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* QR Display Modal */}
      <Modal visible={showQR} transparent animationType="slide" onRequestClose={() => setShowQR(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.qrModal}>
            <View style={styles.modalHandle} />
            <QRDisplay
              codeToken={hangout.qr_code_token ?? 'hangout-qr-abc'}
              expiresAt={hangout.qr_expires_at ?? new Date(Date.now() + 3600000).toISOString()}
            />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowQR(false)}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} transparent animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.qrModal}>
            <View style={styles.modalHandle} />
            <QRScannerMock onSuccess={handleScanSuccess} />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowScanner(false)}>
              <Text style={styles.closeModalText}>Close</Text>
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
    gap: 12,
    paddingBottom: 60,
  },
  sectionCard: {
    backgroundColor: '#101114',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  sectionTitle: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
  },
  participantsList: {
    gap: 10,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantName: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '500',
  },
  youLabel: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  hostBadge: {
    backgroundColor: '#15171C',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  hostBadgeText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsSection: {
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  actionBtnText: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '500',
  },
  checkInBtn: {
    backgroundColor: 'rgba(0, 255, 133, 0.12)',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.3)',
  },
  checkInText: {
    color: '#00FF85',
    fontSize: 15,
    fontWeight: '600',
  },
  checkedInBanner: {
    backgroundColor: 'rgba(0, 255, 133, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.2)',
  },
  checkedInText: {
    color: '#00FF85',
    fontSize: 14,
    fontWeight: '600',
  },
  completeBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  cancelBtnText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  completedBanner: {
    backgroundColor: 'rgba(0, 255, 133, 0.08)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.2)',
  },
  completedText: {
    color: '#00FF85',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  completedPoints: {
    color: '#00FF85',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  qrModal: {
    backgroundColor: '#101114',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#262A31',
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262A31',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  closeModalBtn: {
    marginHorizontal: 20,
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  closeModalText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
});
