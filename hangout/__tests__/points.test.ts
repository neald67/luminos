import {
  computeDurationMultiplier,
  computeGroupMultiplier,
  computeNewConnectionMultiplier,
  computePublicPlaceMultiplier,
  computeRepeatPairPenalty,
  computeBaseReward,
  computeFinalPointAward,
  canUserStake,
  computeCancellationPenalty,
  computeRiskScore,
  shouldHoldForReview,
  computeSocialScore,
  POINTS,
} from '../lib/points';

// ─── computeDurationMultiplier ────────────────────────────────────────────────
describe('computeDurationMultiplier', () => {
  it('returns 0 for 0 minutes', () => {
    expect(computeDurationMultiplier(0)).toBe(0);
  });

  it('returns 0 for durations under 20 minutes', () => {
    expect(computeDurationMultiplier(19)).toBe(0);
    expect(computeDurationMultiplier(1)).toBe(0);
    expect(computeDurationMultiplier(15)).toBe(0);
  });

  it('returns 1.0 for exactly 20 minutes', () => {
    expect(computeDurationMultiplier(20)).toBe(1.0);
  });

  it('returns 1.0 for 20-44 minutes', () => {
    expect(computeDurationMultiplier(20)).toBe(1.0);
    expect(computeDurationMultiplier(30)).toBe(1.0);
    expect(computeDurationMultiplier(44)).toBe(1.0);
  });

  it('returns 1.1 for exactly 45 minutes', () => {
    expect(computeDurationMultiplier(45)).toBe(1.1);
  });

  it('returns 1.1 for 45-89 minutes', () => {
    expect(computeDurationMultiplier(45)).toBe(1.1);
    expect(computeDurationMultiplier(60)).toBe(1.1);
    expect(computeDurationMultiplier(89)).toBe(1.1);
  });

  it('returns 1.2 for exactly 90 minutes', () => {
    expect(computeDurationMultiplier(90)).toBe(1.2);
  });

  it('returns 1.2 for 90-179 minutes', () => {
    expect(computeDurationMultiplier(90)).toBe(1.2);
    expect(computeDurationMultiplier(120)).toBe(1.2);
    expect(computeDurationMultiplier(179)).toBe(1.2);
  });

  it('returns 1.25 for exactly 180 minutes', () => {
    expect(computeDurationMultiplier(180)).toBe(1.25);
  });

  it('returns 1.25 for 180+ minutes', () => {
    expect(computeDurationMultiplier(180)).toBe(1.25);
    expect(computeDurationMultiplier(240)).toBe(1.25);
  });

  it('caps at 1.25 for very long hangouts', () => {
    expect(computeDurationMultiplier(600)).toBe(1.25);
    expect(computeDurationMultiplier(10000)).toBe(1.25);
  });
});

// ─── computeGroupMultiplier ───────────────────────────────────────────────────
describe('computeGroupMultiplier', () => {
  it('returns 0 for 1 participant', () => {
    expect(computeGroupMultiplier(1)).toBe(0);
  });

  it('returns 0 for 2 participants (baseline)', () => {
    expect(computeGroupMultiplier(2)).toBe(0);
  });

  it('returns 0.05 for 3 participants', () => {
    expect(computeGroupMultiplier(3)).toBe(0.05);
  });

  it('returns 0.10 for 4 participants', () => {
    expect(computeGroupMultiplier(4)).toBe(0.10);
  });

  it('returns 0.15 for 5 participants', () => {
    expect(computeGroupMultiplier(5)).toBe(0.15);
  });

  it('returns 0.20 for 6 participants', () => {
    expect(computeGroupMultiplier(6)).toBe(0.20);
  });

  it('caps at 0.20 for 6+ participants', () => {
    expect(computeGroupMultiplier(6)).toBe(0.20);
    expect(computeGroupMultiplier(10)).toBe(0.20);
    expect(computeGroupMultiplier(20)).toBe(0.20);
  });
});

// ─── computeNewConnectionMultiplier ──────────────────────────────────────────
describe('computeNewConnectionMultiplier', () => {
  it('returns 0.15 for first hangout between pair', () => {
    expect(computeNewConnectionMultiplier(true, null)).toBe(0.15);
    expect(computeNewConnectionMultiplier(true, 100)).toBe(0.15);
  });

  it('returns 0.05 if not hung out in 30+ days', () => {
    expect(computeNewConnectionMultiplier(false, 30)).toBe(0.05);
    expect(computeNewConnectionMultiplier(false, 31)).toBe(0.05);
    expect(computeNewConnectionMultiplier(false, 90)).toBe(0.05);
  });

  it('returns 0 if hung out recently (< 30 days)', () => {
    expect(computeNewConnectionMultiplier(false, 29)).toBe(0);
    expect(computeNewConnectionMultiplier(false, 0)).toBe(0);
    expect(computeNewConnectionMultiplier(false, 10)).toBe(0);
  });

  it('returns 0 if daysSinceLastHangout is null and not first hangout', () => {
    expect(computeNewConnectionMultiplier(false, null)).toBe(0);
  });
});

// ─── computePublicPlaceMultiplier ─────────────────────────────────────────────
describe('computePublicPlaceMultiplier', () => {
  it('returns 0.05 for public venue', () => {
    expect(computePublicPlaceMultiplier(true)).toBe(0.05);
  });

  it('returns 0 for private venue', () => {
    expect(computePublicPlaceMultiplier(false)).toBe(0);
  });
});

// ─── computeRepeatPairPenalty ─────────────────────────────────────────────────
describe('computeRepeatPairPenalty', () => {
  it('returns 1.0 for first hangout with this pair this week (count = 1)', () => {
    expect(computeRepeatPairPenalty(1)).toBe(1.0);
  });

  it('returns 1.0 for 0 hangouts with this pair this week', () => {
    expect(computeRepeatPairPenalty(0)).toBe(1.0);
  });

  it('returns 0.5 for second hangout with same pair', () => {
    expect(computeRepeatPairPenalty(2)).toBe(0.5);
  });

  it('returns 0.1 for third hangout with same pair', () => {
    expect(computeRepeatPairPenalty(3)).toBe(0.1);
  });

  it('returns 0 for fourth or more with same pair', () => {
    expect(computeRepeatPairPenalty(4)).toBe(0);
    expect(computeRepeatPairPenalty(5)).toBe(0);
    expect(computeRepeatPairPenalty(10)).toBe(0);
  });
});

// ─── computeBaseReward ───────────────────────────────────────────────────────
describe('computeBaseReward', () => {
  it('returns POINTS.BASE_BONUS (25)', () => {
    expect(computeBaseReward()).toBe(POINTS.BASE_BONUS);
    expect(computeBaseReward()).toBe(25);
  });
});

// ─── computeFinalPointAward ───────────────────────────────────────────────────
describe('computeFinalPointAward', () => {
  const baseParams = {
    durationMinutes: 45,
    participantCount: 2,
    firstHangoutBetweenPair: false,
    daysSinceLastHangout: 10,
    isPublicVenue: false,
    hangoutsWithSamePairInLast7Days: 1,
    dailyEarnedSoFar: 0,
    weeklyEarnedSoFar: 0,
  };

  it('returns 0 bonus for < 20 min hangout', () => {
    const result = computeFinalPointAward({ ...baseParams, durationMinutes: 15 });
    expect(result.bonus).toBe(0);
  });

  it('returns stakeReturn even for < 20 min hangout', () => {
    const result = computeFinalPointAward({ ...baseParams, durationMinutes: 15 });
    expect(result.stakeReturn).toBe(POINTS.STAKE_AMOUNT);
    expect(result.total).toBe(POINTS.STAKE_AMOUNT);
  });

  it('awards 25 HP base bonus for a basic qualifying hangout (20 min)', () => {
    const result = computeFinalPointAward({ ...baseParams, durationMinutes: 20 });
    // 25 * 1.0 * (1 + 0 + 0 + 0) * 1.0 = 25
    expect(result.bonus).toBe(25);
  });

  it('applies duration multiplier correctly for 45 min hangout', () => {
    const result = computeFinalPointAward({ ...baseParams, durationMinutes: 45 });
    // 25 * 1.1 * 1.0 * 1.0 = 27.5 -> rounds to 28
    expect(result.bonus).toBe(28);
  });

  it('applies group multiplier correctly', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 20,
      participantCount: 4,
    });
    // 25 * 1.0 * (1 + 0.10 + 0 + 0) * 1.0 = 25 * 1.1 = 27.5 -> 28
    expect(result.bonus).toBe(28);
  });

  it('applies new connection multiplier correctly', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 20,
      firstHangoutBetweenPair: true,
    });
    // 25 * 1.0 * (1 + 0 + 0.15 + 0) * 1.0 = 25 * 1.15 = 28.75 -> 29
    expect(result.bonus).toBe(29);
  });

  it('applies public place multiplier correctly', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 20,
      isPublicVenue: true,
    });
    // 25 * 1.0 * (1 + 0 + 0 + 0.05) * 1.0 = 25 * 1.05 = 26.25 -> 26
    expect(result.bonus).toBe(26);
  });

  it('applies repeat pair penalty correctly (2nd hangout = 0.5)', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 20,
      hangoutsWithSamePairInLast7Days: 2,
    });
    // 25 * 1.0 * 1.0 * 0.5 = 12.5 -> 13
    expect(result.bonus).toBe(13);
  });

  it('returns 0 bonus with repeat penalty 4th hangout', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 20,
      hangoutsWithSamePairInLast7Days: 4,
    });
    expect(result.bonus).toBe(0);
  });

  it('respects daily cap of 150 HP', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 45,
      dailyEarnedSoFar: 140,
    });
    expect(result.bonus).toBeLessThanOrEqual(10);
  });

  it('returns 0 bonus when daily cap already reached', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 45,
      dailyEarnedSoFar: POINTS.MAX_DAILY_BONUS,
    });
    expect(result.bonus).toBe(0);
  });

  it('respects weekly cap of 600 HP', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 45,
      weeklyEarnedSoFar: 598,
    });
    expect(result.bonus).toBeLessThanOrEqual(2);
  });

  it('returns 0 bonus when weekly cap already reached', () => {
    const result = computeFinalPointAward({
      ...baseParams,
      durationMinutes: 45,
      weeklyEarnedSoFar: POINTS.MAX_WEEKLY_BONUS,
    });
    expect(result.bonus).toBe(0);
  });

  it('total = bonus + stakeReturn', () => {
    const result = computeFinalPointAward({ ...baseParams, durationMinutes: 45 });
    expect(result.total).toBe(result.bonus + result.stakeReturn);
  });

  it('stakeReturn is always POINTS.STAKE_AMOUNT (50)', () => {
    const result = computeFinalPointAward({ ...baseParams, durationMinutes: 45 });
    expect(result.stakeReturn).toBe(POINTS.STAKE_AMOUNT);
  });

  it('includes breakdown string', () => {
    const result = computeFinalPointAward({ ...baseParams, durationMinutes: 45 });
    expect(typeof result.breakdown).toBe('string');
    expect(result.breakdown.length).toBeGreaterThan(0);
  });
});

// ─── canUserStake ─────────────────────────────────────────────────────────────
describe('canUserStake', () => {
  it('returns true if balance >= 50', () => {
    expect(canUserStake(50)).toBe(true);
    expect(canUserStake(100)).toBe(true);
    expect(canUserStake(1000)).toBe(true);
  });

  it('returns false if balance < 50', () => {
    expect(canUserStake(0)).toBe(false);
    expect(canUserStake(25)).toBe(false);
    expect(canUserStake(49)).toBe(false);
  });

  it('returns false if balance is exactly 49', () => {
    expect(canUserStake(49)).toBe(false);
  });

  it('returns true if balance is exactly 50', () => {
    expect(canUserStake(50)).toBe(true);
  });
});

// ─── computeCancellationPenalty ───────────────────────────────────────────────
describe('computeCancellationPenalty', () => {
  const stake = 50;

  it('returns 80% stake for canceling > 120 min before', () => {
    const result = computeCancellationPenalty(stake, 121);
    expect(result.stakeReturned).toBe(40); // 80% of 50
  });

  it('returns 20% forfeit for canceling > 120 min before', () => {
    const result = computeCancellationPenalty(stake, 180);
    expect(result.stakeForfeit).toBe(10); // 20% of 50
  });

  it('returns 0 respect rebate for canceling > 120 min before', () => {
    const result = computeCancellationPenalty(stake, 200);
    expect(result.respectRebate).toBe(0);
  });

  it('returns 50% stake for canceling exactly 120 min before', () => {
    const result = computeCancellationPenalty(stake, 120);
    expect(result.stakeReturned).toBe(25); // 50% of 50
  });

  it('returns 50% stake for canceling < 120 min before', () => {
    const result = computeCancellationPenalty(stake, 60);
    expect(result.stakeReturned).toBe(25); // 50% of 50
  });

  it('returns 50% forfeit for canceling < 120 min before', () => {
    const result = computeCancellationPenalty(stake, 30);
    expect(result.stakeForfeit).toBe(25);
  });

  it('gives respect rebate of 5 for < 120 min cancel', () => {
    const result = computeCancellationPenalty(stake, 60);
    expect(result.respectRebate).toBe(POINTS.RESPECT_REBATE_LATE_CANCEL);
    expect(result.respectRebate).toBe(5);
  });

  it('returns 0% stake for no-show (0 minutes)', () => {
    const result = computeCancellationPenalty(stake, 0);
    expect(result.stakeReturned).toBe(0);
  });

  it('returns 100% forfeit for no-show', () => {
    const result = computeCancellationPenalty(stake, 0);
    expect(result.stakeForfeit).toBe(stake);
  });

  it('gives respect rebate of 10 for no-show', () => {
    const result = computeCancellationPenalty(stake, 0);
    expect(result.respectRebate).toBe(POINTS.RESPECT_REBATE_NO_SHOW);
    expect(result.respectRebate).toBe(10);
  });

  it('returns 0% stake for negative minutesBeforeStart (past no-show)', () => {
    const result = computeCancellationPenalty(stake, -30);
    expect(result.stakeReturned).toBe(0);
    expect(result.stakeForfeit).toBe(stake);
    expect(result.respectRebate).toBe(10);
  });

  it('stakeReturned + stakeForfeit = stakeAmount for early cancel', () => {
    const result = computeCancellationPenalty(stake, 300);
    expect(result.stakeReturned + result.stakeForfeit).toBe(stake);
  });

  it('stakeReturned + stakeForfeit = stakeAmount for late cancel', () => {
    const result = computeCancellationPenalty(stake, 60);
    expect(result.stakeReturned + result.stakeForfeit).toBe(stake);
  });

  it('stakeReturned + stakeForfeit = stakeAmount for no-show', () => {
    const result = computeCancellationPenalty(stake, 0);
    expect(result.stakeReturned + result.stakeForfeit).toBe(stake);
  });
});

// ─── computeRiskScore ────────────────────────────────────────────────────────
describe('computeRiskScore', () => {
  const baseFactors = {
    samePairRepeatedCount: 0,
    newAccountAgeDays: 30,
    reportCountOnUser: 0,
    noShowCountInLast30Days: 0,
    cancelCountInLast30Days: 0,
    durationBarelyAboveMin: false,
    hasQRScanOnly: false,
    multipleAccountsSameDevice: false,
  };

  it('returns low score (0) for completely normal activity', () => {
    expect(computeRiskScore(baseFactors)).toBe(0);
  });

  it('returns low score for modest cancel history', () => {
    const score = computeRiskScore({ ...baseFactors, cancelCountInLast30Days: 1 });
    expect(score).toBeLessThan(40);
  });

  it('increases score for repeated same pair (3+ times)', () => {
    const normal = computeRiskScore(baseFactors);
    const repeated = computeRiskScore({ ...baseFactors, samePairRepeatedCount: 3 });
    expect(repeated).toBeGreaterThan(normal);
  });

  it('increases score for new account (< 3 days)', () => {
    const normal = computeRiskScore(baseFactors);
    const newAccount = computeRiskScore({ ...baseFactors, newAccountAgeDays: 1 });
    expect(newAccount).toBeGreaterThan(normal);
  });

  it('increases score for very new account (< 7 days)', () => {
    const score3Days = computeRiskScore({ ...baseFactors, newAccountAgeDays: 3 });
    const score1Day = computeRiskScore({ ...baseFactors, newAccountAgeDays: 1 });
    expect(score1Day).toBeGreaterThanOrEqual(score3Days);
  });

  it('increases score for user reports', () => {
    const normal = computeRiskScore(baseFactors);
    const reported = computeRiskScore({ ...baseFactors, reportCountOnUser: 2 });
    expect(reported).toBeGreaterThan(normal);
  });

  it('increases score for no-show history', () => {
    const normal = computeRiskScore(baseFactors);
    const noShow = computeRiskScore({ ...baseFactors, noShowCountInLast30Days: 2 });
    expect(noShow).toBeGreaterThan(normal);
  });

  it('increases score for barely-above-minimum duration', () => {
    const normal = computeRiskScore(baseFactors);
    const barely = computeRiskScore({ ...baseFactors, durationBarelyAboveMin: true });
    expect(barely).toBeGreaterThan(normal);
  });

  it('increases score for QR scan only', () => {
    const normal = computeRiskScore(baseFactors);
    const qrOnly = computeRiskScore({ ...baseFactors, hasQRScanOnly: true });
    expect(qrOnly).toBeGreaterThan(normal);
  });

  it('increases score significantly for multiple accounts on same device', () => {
    const normal = computeRiskScore(baseFactors);
    const multiAcct = computeRiskScore({ ...baseFactors, multipleAccountsSameDevice: true });
    expect(multiAcct).toBeGreaterThan(normal);
  });

  it('caps at 100 for extreme risk profile', () => {
    const extremeFactors = {
      samePairRepeatedCount: 10,
      newAccountAgeDays: 0,
      reportCountOnUser: 10,
      noShowCountInLast30Days: 10,
      cancelCountInLast30Days: 10,
      durationBarelyAboveMin: true,
      hasQRScanOnly: true,
      multipleAccountsSameDevice: true,
    };
    expect(computeRiskScore(extremeFactors)).toBe(100);
  });

  it('score is always between 0 and 100', () => {
    const score = computeRiskScore(baseFactors);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── shouldHoldForReview ─────────────────────────────────────────────────────
describe('shouldHoldForReview', () => {
  it('returns false for risk score of 0', () => {
    expect(shouldHoldForReview(0)).toBe(false);
  });

  it('returns false for risk < 40', () => {
    expect(shouldHoldForReview(0)).toBe(false);
    expect(shouldHoldForReview(20)).toBe(false);
    expect(shouldHoldForReview(39)).toBe(false);
  });

  it('returns true for risk exactly 40', () => {
    expect(shouldHoldForReview(40)).toBe(true);
  });

  it('returns true for risk >= 40', () => {
    expect(shouldHoldForReview(40)).toBe(true);
    expect(shouldHoldForReview(50)).toBe(true);
    expect(shouldHoldForReview(75)).toBe(true);
    expect(shouldHoldForReview(100)).toBe(true);
  });
});

// ─── computeSocialScore ──────────────────────────────────────────────────────
describe('computeSocialScore', () => {
  it('computes social score correctly', () => {
    // approvedWeeklyBonus=100, verifiedHangoutCount=10, reliabilityScore=5, flakePenalty=0
    // = 100 + 10*5 + 5*2 - 0 = 100 + 50 + 10 = 160
    expect(computeSocialScore(100, 10, 5, 0)).toBe(160);
  });

  it('applies flake penalty', () => {
    // 100 + 50 + 10 - 20 = 140
    expect(computeSocialScore(100, 10, 5, 20)).toBe(140);
  });

  it('does not go below 0', () => {
    expect(computeSocialScore(0, 0, 0, 100)).toBe(0);
  });

  it('returns 0 for all-zero inputs', () => {
    expect(computeSocialScore(0, 0, 0, 0)).toBe(0);
  });

  it('scales with verified hangout count', () => {
    const score1 = computeSocialScore(0, 1, 0, 0);
    const score10 = computeSocialScore(0, 10, 0, 0);
    expect(score10).toBeGreaterThan(score1);
  });

  it('scales with reliability score', () => {
    const score1 = computeSocialScore(0, 0, 1, 0);
    const score10 = computeSocialScore(0, 0, 10, 0);
    expect(score10).toBeGreaterThan(score1);
  });
});
