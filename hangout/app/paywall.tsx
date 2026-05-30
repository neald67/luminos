import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { setMockEntitlement, resetMockEntitlements } from '@/lib/entitlements';
import type { Entitlements } from '@/lib/types';

const MOCK_PREMIUM = process.env.EXPO_PUBLIC_MOCK_PREMIUM === 'true';

interface PlanFeature {
  text: string;
}

interface Plan {
  id: keyof Entitlements;
  name: string;
  price: string;
  priceNote?: string;
  tagline: string;
  features: PlanFeature[];
  ctaLabel: string;
  accentColor: string;
}

const PLANS: Plan[] = [
  {
    id: 'hasHangoutPlus',
    name: 'Hangout+',
    price: '$4.99',
    priceNote: '/mo',
    tagline: 'Elevate your social profile.',
    features: [
      { text: 'Custom map pin' },
      { text: 'Animated availability ring' },
      { text: 'Smart schedule integration' },
      { text: 'Unlimited AI plans' },
      { text: 'Advanced filters' },
      { text: 'Profile aura' },
    ],
    ctaLabel: 'Get Hangout+',
    accentColor: '#00FF85',
  },
  {
    id: 'hasCrewPlus',
    name: 'Crew+',
    price: '$7.99',
    priceNote: '/mo per crew',
    tagline: 'Make group plans actually work.',
    features: [
      { text: 'Group availability board' },
      { text: 'AI group planner' },
      { text: 'Time & budget polls' },
      { text: 'Recurring hangouts' },
      { text: 'Shared crew memories' },
    ],
    ctaLabel: 'Get Crew+',
    accentColor: '#4DA3FF',
  },
  {
    id: 'hasHostPro',
    name: 'Host Pro',
    price: '$19',
    priceNote: '/mo',
    tagline: 'Host events people actually show up to.',
    features: [
      { text: 'Unlimited public events' },
      { text: 'RSVP management' },
      { text: 'QR check-in for attendees' },
      { text: 'Event analytics' },
      { text: 'Featured event credits' },
      { text: 'Host verification badge' },
    ],
    ctaLabel: 'Get Host Pro',
    accentColor: '#F59E0B',
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <View style={[styles.planCard, { borderColor: `${plan.accentColor}33` }]}>
      <View style={styles.planHeader}>
        <View>
          <View style={[styles.planBadge, { backgroundColor: `${plan.accentColor}18` }]}>
            <Text style={[styles.planBadgeText, { color: plan.accentColor }]}>
              {plan.name}
            </Text>
          </View>
          <Text style={styles.planTagline}>{plan.tagline}</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={[styles.planPrice, { color: plan.accentColor }]}>{plan.price}</Text>
          <Text style={styles.planPriceNote}>{plan.priceNote}</Text>
        </View>
      </View>

      <View style={styles.featureList}>
        {plan.features.map((f) => (
          <View key={f.text} style={styles.featureRow}>
            <Text style={[styles.featureCheck, { color: plan.accentColor }]}>✓</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.planCta, { backgroundColor: plan.accentColor }]}
        activeOpacity={0.85}
        onPress={() => {/* App Store / Play Store purchase flow */}}
      >
        <Text style={styles.planCtaText}>{plan.ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function DevToggleRow({
  label,
  planKey,
}: {
  label: string;
  planKey: keyof Entitlements;
}) {
  const [value, setValue] = useState(false);

  function handleToggle(v: boolean) {
    setValue(v);
    setMockEntitlement(planKey, v);
  }

  return (
    <View style={styles.devRow}>
      <Text style={styles.devLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: '#262A31', true: '#00FF8550' }}
        thumbColor={value ? '#00FF85' : '#A1A1AA'}
      />
    </View>
  );
}

export default function PaywallScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upgrade</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Choose a plan that fits how you hang out.
        </Text>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            Subscriptions managed via App Store / Google Play.
          </Text>
          <Text style={styles.footerNote}>
            Hangout Points are earned-only. They cannot be purchased.
          </Text>
        </View>

        {MOCK_PREMIUM && (
          <View style={styles.devSection}>
            <Text style={styles.devSectionTitle}>DEV: Mock Entitlements</Text>
            <TouchableOpacity
              style={styles.devResetBtn}
              onPress={() => resetMockEntitlements()}
            >
              <Text style={styles.devResetText}>Reset all</Text>
            </TouchableOpacity>
            <DevToggleRow label="Hangout+" planKey="hasHangoutPlus" />
            <DevToggleRow label="Crew+" planKey="hasCrewPlus" />
            <DevToggleRow label="Host Pro" planKey="hasHostPro" />
            <DevToggleRow label="Create host event" planKey="canCreateHostEvent" />
            <DevToggleRow label="AI plans unlimited" planKey="canUseAIPlanUnlimited" />
            <DevToggleRow label="Advanced filters" planKey="canAccessAdvancedFilters" />
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#15171C',
    borderWidth: 1,
    borderColor: '#262A31',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  plans: {
    paddingHorizontal: 16,
    gap: 14,
  },
  planCard: {
    backgroundColor: '#101114',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planTagline: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 180,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  planPriceNote: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  featureList: {
    gap: 8,
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheck: {
    fontSize: 13,
    fontWeight: '700',
  },
  featureText: {
    color: '#F4F4F5',
    fontSize: 14,
  },
  planCta: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  planCtaText: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 6,
  },
  footerNote: {
    color: '#4B4E57',
    fontSize: 12,
    textAlign: 'center',
  },
  devSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#0F1117',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF6B4A33',
    padding: 16,
  },
  devSectionTitle: {
    color: '#FF6B4A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  devRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#262A31',
  },
  devLabel: {
    color: '#F4F4F5',
    fontSize: 14,
  },
  devResetBtn: {
    backgroundColor: '#FF6B4A18',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  devResetText: {
    color: '#FF6B4A',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 48,
  },
});
