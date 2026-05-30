import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';

interface SafetyBailButtonProps {
  onBail: () => void;
}

export function SafetyBailButton({ onBail }: SafetyBailButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    setShowConfirm(false);
    onBail();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.bailBtn}
        onPress={() => setShowConfirm(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.bailIcon}>🚪</Text>
        <Text style={styles.bailText}>Bail safely</Text>
      </TouchableOpacity>

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowConfirm(false)} />
        <View style={styles.modalWrapper}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>🚪</Text>
            <Text style={styles.modalTitle}>Bail safely?</Text>
            <Text style={styles.modalDesc}>
              Your availability will be hidden immediately.{'\n\n'}
              No penalty — your safety is never punished.{'\n\n'}
              Bail anytime, no questions asked.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmText}>Bail safely</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 74, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.25)',
    alignSelf: 'center',
  },
  bailIcon: {
    fontSize: 16,
  },
  bailText: {
    color: '#FF6B4A',
    fontSize: 14,
    fontWeight: '600',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: '#101114',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#262A31',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 340,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    color: '#F4F4F5',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  cancelText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#FF6B4A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '700',
  },
});
