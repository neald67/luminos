import type { Entitlements } from '@/lib/types';

const MOCK_PREMIUM = process.env.EXPO_PUBLIC_MOCK_PREMIUM === 'true';

// In-memory mock state for dev toggle
let mockState: Partial<Record<keyof Entitlements, boolean>> = {};

export function getEntitlements(mockOverrides?: Partial<Entitlements>): Entitlements {
  if (MOCK_PREMIUM) {
    return {
      hasHangoutPlus: mockState.hasHangoutPlus ?? false,
      hasCrewPlus: mockState.hasCrewPlus ?? false,
      hasHostPro: mockState.hasHostPro ?? false,
      canUsePremiumTheme: mockState.hasHangoutPlus ?? false,
      canUseAIPlanUnlimited: mockState.hasHangoutPlus ?? false,
      canCreateHostEvent: mockState.hasHostPro ?? false,
      canAccessAdvancedFilters: mockState.hasHangoutPlus ?? false,
      ...mockOverrides,
    };
  }
  // Real mode: would check Supabase subscriptions table
  return {
    hasHangoutPlus: false,
    hasCrewPlus: false,
    hasHostPro: false,
    canUsePremiumTheme: false,
    canUseAIPlanUnlimited: false,
    canCreateHostEvent: false,
    canAccessAdvancedFilters: false,
  };
}

export function setMockEntitlement(key: keyof Entitlements, value: boolean): void {
  mockState[key] = value;
}

export function resetMockEntitlements(): void {
  mockState = {};
}
