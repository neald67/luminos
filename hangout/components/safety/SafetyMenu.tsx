import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BlockButton } from './BlockButton';
import { ReportButton } from './ReportButton';
import { SafetyBailButton } from '../hangout/SafetyBailButton';

interface SafetyMenuProps {
  visible: boolean;
  onClose: () => void;
  targetUsername: string;
  onBlock: () => void;
  onReport: (category: string) => void;
  onBail: () => void;
  showBail?: boolean;
}

export function SafetyMenu({
  visible,
  onClose,
  targetUsername,
  onBlock,
  onReport,
  onBail,
  showBail = true,
}: SafetyMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Safety options</Text>

        <View style={styles.options}>
          {showBail && (
            <View style={styles.optionRow}>
              <SafetyBailButton onBail={() => { onBail(); onClose(); }} />
            </View>
          )}

          <View style={styles.optionRow}>
            <ReportButton
              username={targetUsername}
              onReport={(cat) => { onReport(cat); onClose(); }}
            />
          </View>

          <View style={styles.optionRow}>
            <BlockButton
              username={targetUsername}
              onBlock={() => { onBlock(); onClose(); }}
            />
          </View>
        </View>

        <View style={styles.safetyNote}>
          <Text style={styles.safetyNoteText}>
            🛡️ Your safety is the priority. Bail anytime, no penalty.
          </Text>
        </View>

        <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101114',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#262A31',
    padding: 20,
    paddingBottom: 36,
    gap: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262A31',
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  options: {
    gap: 10,
  },
  optionRow: {
    alignSelf: 'stretch',
  },
  safetyNote: {
    backgroundColor: '#15171C',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  safetyNoteText: {
    color: '#A1A1AA',
    fontSize: 12,
    textAlign: 'center',
  },
  dismissBtn: {
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  dismissText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
});
