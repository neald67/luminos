import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface QRScannerMockProps {
  onSuccess: (token: string) => void;
}

type ScanState = 'scanning' | 'success' | 'failed';

export function QRScannerMock({ onSuccess }: QRScannerMockProps) {
  const [state, setState] = useState<ScanState>('scanning');
  const scanLineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate scan line
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    scan.start();

    // Simulate successful scan after 2.5 seconds
    const timer = setTimeout(() => {
      scan.stop();
      setState('success');
      onSuccess('mock-qr-abc123');
    }, 2500);

    return () => {
      scan.stop();
      clearTimeout(timer);
    };
  }, [scanLineY, onSuccess]);

  const translateY = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan their QR code</Text>

      {/* Camera view placeholder */}
      <View style={styles.cameraView}>
        {/* Dark camera bg */}
        <View style={styles.cameraBg} />

        {/* Scan frame */}
        <View style={styles.scanFrame}>
          {/* Corner markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Scan line */}
          {state === 'scanning' && (
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY }] }]}
            />
          )}

          {/* Success overlay */}
          {state === 'success' && (
            <View style={styles.successOverlay}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>Scanned!</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.hint}>
        {state === 'scanning'
          ? 'Point at your partner\'s QR code'
          : 'QR code verified — hangout confirmed!'}
      </Text>

      <View style={styles.mockNote}>
        <Text style={styles.mockNoteText}>
          Demo mode: auto-scanning in 2.5s
        </Text>
      </View>
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
  },
  cameraView: {
    width: 240,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0C0E',
  },
  scanFrame: {
    width: 180,
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00FF85',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00FF85',
    shadowColor: '#00FF85',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 133, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 4,
  },
  successIcon: {
    color: '#00FF85',
    fontSize: 40,
    fontWeight: '700',
  },
  successText: {
    color: '#00FF85',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    color: '#A1A1AA',
    fontSize: 13,
    textAlign: 'center',
  },
  mockNote: {
    backgroundColor: '#15171C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  mockNoteText: {
    color: '#A1A1AA',
    fontSize: 11,
  },
});
