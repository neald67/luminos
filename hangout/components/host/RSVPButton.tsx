import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface RSVPButtonProps {
  isRSVPd: boolean;
  onPress: () => void;
}

export function RSVPButton({ isRSVPd, onPress }: RSVPButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, isRSVPd && styles.btnDone]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.btnText, isRSVPd && styles.btnTextDone]}>
        {isRSVPd ? 'RSVPd ✓' : 'RSVP'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#00FF85',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDone: {
    backgroundColor: 'rgba(0,255,133,0.12)',
    borderWidth: 1,
    borderColor: '#00FF85',
  },
  btnText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextDone: {
    color: '#00FF85',
  },
});
