import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  Modal,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';

interface BlockButtonProps {
  username: string;
  onBlock: () => void;
}

export function BlockButton({ username, onBlock }: BlockButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => setShowConfirm(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.btnText}>Block user</Text>
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
            <Text style={styles.title}>Block @{username}?</Text>
            <Text style={styles.desc}>
              They won&apos;t be able to see your profile or send you requests. You can unblock them in settings.
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setShowConfirm(false);
                  onBlock();
                }}
              >
                <Text style={styles.confirmText}>Block</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.25)',
    backgroundColor: 'transparent',
  },
  btnText: {
    color: '#FF6B4A',
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262A31',
    gap: 12,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 17,
    fontWeight: '700',
  },
  desc: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#15171C',
    borderRadius: 10,
    paddingVertical: 11,
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
    backgroundColor: 'rgba(255, 107, 74, 0.15)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.35)',
  },
  confirmText: {
    color: '#FF6B4A',
    fontSize: 14,
    fontWeight: '700',
  },
});
