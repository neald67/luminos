import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QRDisplayProps {
  codeToken: string;
  expiresAt: string;
}

function MockQRPattern({ code }: { code: string }) {
  // Generate a deterministic grid pattern from the code string
  const cells = 9;
  const pattern: boolean[] = [];
  for (let i = 0; i < cells * cells; i++) {
    const charCode = code.charCodeAt(i % code.length);
    pattern.push((charCode + i * 7 + Math.floor(i / cells) * 3) % 3 !== 0);
  }

  return (
    <View style={qrStyles.qr}>
      {Array.from({ length: cells }).map((_, row) => (
        <View key={row} style={qrStyles.qrRow}>
          {Array.from({ length: cells }).map((__, col) => (
            <View
              key={col}
              style={[
                qrStyles.qrCell,
                pattern[row * cells + col] && qrStyles.qrCellFilled,
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const qrStyles = StyleSheet.create({
  qr: {
    gap: 2,
    padding: 12,
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
  },
  qrRow: {
    flexDirection: 'row',
    gap: 2,
  },
  qrCell: {
    width: 18,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#F4F4F5',
  },
  qrCellFilled: {
    backgroundColor: '#050505',
  },
});

function secondsUntil(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

export function QRDisplay({ codeToken, expiresAt }: QRDisplayProps) {
  const [seconds, setSeconds] = useState(() => secondsUntil(expiresAt));

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(secondsUntil(expiresAt));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const expired = seconds === 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Show to your hangout partner</Text>

      <View style={styles.qrWrapper}>
        {expired ? (
          <View style={styles.expiredOverlay}>
            <Text style={styles.expiredText}>QR Expired</Text>
          </View>
        ) : (
          <MockQRPattern code={codeToken} />
        )}
      </View>

      <Text style={styles.codeText}>{codeToken.toUpperCase()}</Text>

      <View style={[styles.timerRow, expired && styles.timerRowExpired]}>
        <Text style={[styles.timerLabel, expired && styles.timerLabelExpired]}>
          {expired ? 'Expired' : `Expires in ${mm}:${ss}`}
        </Text>
      </View>

      <Text style={styles.hint}>
        Both scan each other&apos;s QR to verify the meetup
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrWrapper: {
    position: 'relative',
  },
  expiredOverlay: {
    width: 182,
    height: 182,
    backgroundColor: '#15171C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  expiredText: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '600',
  },
  codeText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  timerRow: {
    backgroundColor: 'rgba(0, 255, 133, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 133, 0.25)',
  },
  timerRowExpired: {
    backgroundColor: 'rgba(255, 107, 74, 0.08)',
    borderColor: 'rgba(255, 107, 74, 0.25)',
  },
  timerLabel: {
    color: '#00FF85',
    fontSize: 13,
    fontWeight: '600',
  },
  timerLabelExpired: {
    color: '#FF6B4A',
  },
  hint: {
    color: '#A1A1AA',
    fontSize: 12,
    textAlign: 'center',
  },
});
