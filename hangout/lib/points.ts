// lib/points.ts — Pure computation functions (no side effects, no imports from React/Supabase)

// ─── Constants ────────────────────────────────────────────────────────────────
export const POINTS = {
  INITIAL_BALANCE: 100,
  PROFILE_BONUS: 25,
  SAFETY_ONBOARDING_BONUS: 25,
  STAKE_AMOUNT: 50,
  BASE_BONUS: 25,
  MIN_QUALIFYING_MINUTES: 20,
  MAX_DAILY_BONUS: 150,
  MAX_WEEKLY_BONUS: 600,
  RESPECT_REBATE_LATE_CANCEL: 5,
  RESPECT_REBATE_NO_SHOW: 10,
  RESPECT_REBATE_WEEKLY_CAP: 30,
} as const;

// ─── Duration multiplier ──────────────────────────────────────────────────────
// 0-19 min: 0x, 20-44: 1.0x, 45-89: 1.1x, 90-179: 1.2x, 180+: 1.25x
export function computeDurationMultiplier(minutes: number): number {
  if (minutes < 20) return 0;
  if (minutes < 45) return 1.0;
  if (minutes < 90) return 1.1;
  if (minutes < 180) return 1.2;
  return 1.25;
}

// ─── Group multiplier ─────────────────────────────────────────────────────────
// +0.05 per participant beyond 2, capped at +0.20
export function computeGroupMultiplier(participantCount: number): number {
  const extra = Math.max(0, participantCount - 2);
  return Math.min(extra * 0.05, 0.20);
}

// ─── New connection multiplier ────────────────────────────────────────────────
// +0.15 if first verified hangout between pair, +0.05 if not hung out in 30+ days
export function computeNewConnectionMultiplier(
  firstHangoutBetweenPair: boolean,
  daysSinceLastHangout: number | null,
): number {
  if (firstHangoutBetweenPair) return 0.15;
  if (daysSinceLastHangout !== null && daysSinceLastHangout >= 30) return 0.05;
  return 0;
}

// ─── Public place multiplier ──────────────────────────────────────────────────
// +0.05 if public venue, 0 if private
export function computePublicPlaceMultiplier(isPublicVenue: boolean): number {
  return isPublicVenue ? 0.05 : 0;
}

// ─── Repeat pair penalty ─────────────────────────────────────────────────────
// Same pair in rolling 7 days: 1st=1.0, 2nd=0.5, 3rd=0.1, 4th+=0
export function computeRepeatPairPenalty(hangoutsWithSamePairInLast7Days: number): number {
  if (hangoutsWithSamePairInLast7Days <= 1) return 1.0;
  if (hangoutsWithSamePairInLast7Days === 2) return 0.5;
  if (hangoutsWithSamePairInLast7Days === 3) return 0.1;
  return 0;
}

// ─── Base reward ─────────────────────────────────────────────────────────────
export function computeBaseReward(): number {
  return POINTS.BASE_BONUS;
}

// ─── Final point award ────────────────────────────────────────────────────────
// Returns net bonus (NOT including stake return)
// Formula: BASE_BONUS * durationMultiplier * (1 + groupMult + newConnMult + publicMult) * repeatPairPenalty
// Capped at MAX_DAILY_BONUS / MAX_WEEKLY_BONUS (pass in daily/weekly already earned)
export function computeFinalPointAward(params: {
  durationMinutes: number;
  participantCount: number;
  firstHangoutBetweenPair: boolean;
  daysSinceLastHangout: number | null;
  isPublicVenue: boolean;
  hangoutsWithSamePairInLast7Days: number;
  dailyEarnedSoFar: number;
  weeklyEarnedSoFar: number;
}): { bonus: number; stakeReturn: number; total: number; breakdown: string } {
  const {
    durationMinutes,
    participantCount,
    firstHangoutBetweenPair,
    daysSinceLastHangout,
    isPublicVenue,
    hangoutsWithSamePairInLast7Days,
    dailyEarnedSoFar,
    weeklyEarnedSoFar,
  } = params;

  const durationMult = computeDurationMultiplier(durationMinutes);

  // If duration doesn't qualify, no bonus
  if (durationMult === 0) {
    return {
      bonus: 0,
      stakeReturn: POINTS.STAKE_AMOUNT,
      total: POINTS.STAKE_AMOUNT,
      breakdown: 'Duration < 20 min — no bonus awarded',
    };
  }

  const groupMult = computeGroupMultiplier(participantCount);
  const newConnMult = computeNewConnectionMultiplier(firstHangoutBetweenPair, daysSinceLastHangout);
  const publicMult = computePublicPlaceMultiplier(isPublicVenue);
  const repeatPenalty = computeRepeatPairPenalty(hangoutsWithSamePairInLast7Days);

  const base = POINTS.BASE_BONUS;
  const rawBonus = base * durationMult * (1 + groupMult + newConnMult + publicMult) * repeatPenalty;
  const roundedRawBonus = Math.round(rawBonus);

  // Apply caps
  const dailyRemaining = Math.max(0, POINTS.MAX_DAILY_BONUS - dailyEarnedSoFar);
  const weeklyRemaining = Math.max(0, POINTS.MAX_WEEKLY_BONUS - weeklyEarnedSoFar);
  const bonus = Math.min(roundedRawBonus, dailyRemaining, weeklyRemaining);

  const stakeReturn = POINTS.STAKE_AMOUNT;
  const total = bonus + stakeReturn;

  const breakdown = [
    `Base: ${base}`,
    `Duration mult: x${durationMult}`,
    `Group mult: +${groupMult}`,
    `New conn mult: +${newConnMult}`,
    `Public mult: +${publicMult}`,
    `Repeat penalty: x${repeatPenalty}`,
    `Raw bonus: ${roundedRawBonus}`,
    bonus < roundedRawBonus ? `Capped at: ${bonus}` : '',
    `Stake return: ${stakeReturn}`,
    `Total: ${total}`,
  ]
    .filter(Boolean)
    .join(' | ');

  return { bonus, stakeReturn, total, breakdown };
}

// ─── Can user stake ───────────────────────────────────────────────────────────
export function canUserStake(balance: number): boolean {
  return balance >= POINTS.STAKE_AMOUNT;
}

// ─── Cancellation penalty ────────────────────────────────────────────────────
// Returns { stakeReturned, stakeForfeit, respectRebateForOtherUser }
// >120 min before: return 80%, forfeit 20%, rebate 0
// 0-120 min before: return 50%, forfeit 50%, rebate 5
// ≤0 (no show): return 0%, forfeit 100%, rebate 10
export function computeCancellationPenalty(
  stakeAmount: number,
  minutesBeforeStart: number,
): { stakeReturned: number; stakeForfeit: number; respectRebate: number } {
  if (minutesBeforeStart <= 0) {
    // No show
    return {
      stakeReturned: 0,
      stakeForfeit: stakeAmount,
      respectRebate: POINTS.RESPECT_REBATE_NO_SHOW,
    };
  }
  if (minutesBeforeStart <= 120) {
    // Late cancel
    const returned = Math.round(stakeAmount * 0.5);
    const forfeit = stakeAmount - returned;
    return {
      stakeReturned: returned,
      stakeForfeit: forfeit,
      respectRebate: POINTS.RESPECT_REBATE_LATE_CANCEL,
    };
  }
  // Early cancel (>120 min)
  const returned = Math.round(stakeAmount * 0.8);
  const forfeit = stakeAmount - returned;
  return {
    stakeReturned: returned,
    stakeForfeit: forfeit,
    respectRebate: 0,
  };
}

// ─── Risk score ───────────────────────────────────────────────────────────────
export function computeRiskScore(factors: {
  samePairRepeatedCount: number;
  newAccountAgeDays: number;
  reportCountOnUser: number;
  noShowCountInLast30Days: number;
  cancelCountInLast30Days: number;
  durationBarelyAboveMin: boolean;
  hasQRScanOnly: boolean;
  multipleAccountsSameDevice: boolean;
}): number {
  let score = 0;

  // Same pair repeated too often (each pair beyond 2/week adds risk)
  if (factors.samePairRepeatedCount >= 3) score += 15;
  else if (factors.samePairRepeatedCount === 2) score += 8;

  // New account age
  if (factors.newAccountAgeDays < 3) score += 20;
  else if (factors.newAccountAgeDays < 7) score += 12;
  else if (factors.newAccountAgeDays < 14) score += 6;

  // Reports against user
  score += Math.min(factors.reportCountOnUser * 10, 30);

  // No-show history
  score += Math.min(factors.noShowCountInLast30Days * 8, 24);

  // Cancel history
  score += Math.min(factors.cancelCountInLast30Days * 4, 12);

  // Barely above min duration — suspicious
  if (factors.durationBarelyAboveMin) score += 10;

  // Only QR scan with no duration pings — suspicious
  if (factors.hasQRScanOnly) score += 8;

  // Multiple accounts same device — very suspicious
  if (factors.multipleAccountsSameDevice) score += 25;

  return Math.min(score, 100);
}

// ─── Should hold for review ───────────────────────────────────────────────────
export function shouldHoldForReview(riskScore: number): boolean {
  return riskScore >= 40;
}

// ─── Leaderboard social score ─────────────────────────────────────────────────
export function computeSocialScore(
  approvedWeeklyBonus: number,
  verifiedHangoutCount: number,
  reliabilityScore: number,
  flakePenalty: number,
): number {
  const base = approvedWeeklyBonus + verifiedHangoutCount * 5 + reliabilityScore * 2;
  return Math.max(0, base - flakePenalty);
}
