import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const FEATURES = [
  'Unlimited public events',
  'RSVP management dashboard',
  'QR check-in for attendees',
  'Event analytics',
  'Featured event credits',
];

export function HostProUpsell() {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Host Pro</Text>
      </View>
      <Text style={styles.headline}>Host something people actually show up to.</Text>
      <Text style={styles.subheadline}>
        Get tools to run events that build real community.
      </Text>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.cta}
        onPress={() => router.push('/paywall')}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>$19/month · Host Pro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(77,163,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#4DA3FF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headline: {
    color: '#F4F4F5',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheadline: {
    color: '#A1A1AA',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  features: {
    gap: 8,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheck: {
    color: '#00FF85',
    fontSize: 14,
    fontWeight: '700',
  },
  featureText: {
    color: '#F4F4F5',
    fontSize: 13,
  },
  cta: {
    backgroundColor: '#4DA3FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
});
