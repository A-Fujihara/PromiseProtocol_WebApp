const { computeSelfTrust, isValidOutcome, OUTCOME_WEIGHTS, VALID_OUTCOMES } = require('../src/SelfTrust');

describe('SelfTrust', () => {
  describe('isValidOutcome', () => {
    test('returns true for each recognized outcome state', () => {
      VALID_OUTCOMES.forEach((outcome) => {
        expect(isValidOutcome(outcome)).toBe(true);
      });
    });

    test('returns false for an unrecognized outcome string', () => {
      expect(isValidOutcome('lied')).toBe(false);
      expect(isValidOutcome('')).toBe(false);
      expect(isValidOutcome(undefined)).toBe(false);
    });
  });

  describe('computeSelfTrust', () => {
    test('returns a neutral score of 50 with count 0 when there is no history', () => {
      expect(computeSelfTrust([])).toEqual({ score: 50, count: 0 });
    });

    test('returns a neutral score of 50 when outcomes is not an array', () => {
      expect(computeSelfTrust(null)).toEqual({ score: 50, count: 0 });
      expect(computeSelfTrust(undefined)).toEqual({ score: 50, count: 0 });
    });

    test('scores a single kept outcome at 100', () => {
      expect(computeSelfTrust([{ outcome: 'kept' }])).toEqual({ score: 100, count: 1 });
    });

    test('scores a single forgotten outcome at 10', () => {
      expect(computeSelfTrust([{ outcome: 'forgotten' }])).toEqual({ score: 10, count: 1 });
    });

    test('core thesis: an honest miss scores higher than a silent lapse', () => {
      const honestMiss = computeSelfTrust([{ outcome: 'failed_but_noticed' }]);
      const silentLapse = computeSelfTrust([{ outcome: 'forgotten' }]);
      expect(honestMiss.score).toBeGreaterThan(silentLapse.score);
    });

    test('averages multiple outcomes rather than summing them', () => {
      // kept (1.0) + forgotten (0.1) -> average 0.55 -> 55
      const result = computeSelfTrust([{ outcome: 'kept' }, { outcome: 'forgotten' }]);
      expect(result).toEqual({ score: 55, count: 2 });
    });

    test('honesty pulls a bad record upward: forgotten then kept beats forgotten alone', () => {
      const justForgotten = computeSelfTrust([{ outcome: 'forgotten' }]);
      const forgottenThenKept = computeSelfTrust([{ outcome: 'forgotten' }, { outcome: 'kept' }]);
      expect(forgottenThenKept.score).toBeGreaterThan(justForgotten.score);
    });

    test('ignores unrecognized outcome values defensively rather than throwing', () => {
      const result = computeSelfTrust([{ outcome: 'kept' }, { outcome: 'nonsense' }]);
      expect(result).toEqual({ score: 100, count: 1 });
    });

    test('skips null or undefined elements in the outcomes array without throwing', () => {
      const result = computeSelfTrust([{ outcome: 'kept' }, null, undefined]);
      expect(result).toEqual({ score: 100, count: 1 });
    });

    test('returns neutral score when every outcome in the list is unrecognized', () => {
      const result = computeSelfTrust([{ outcome: 'nonsense' }, { outcome: 'also-nonsense' }]);
      expect(result).toEqual({ score: 50, count: 0 });
    });

    test('score always matches a hand-computed average from OUTCOME_WEIGHTS', () => {
      const outcomes = [
        { outcome: 'kept' },
        { outcome: 'kept' },
        { outcome: 'partially_kept' },
        { outcome: 'failed_but_noticed' },
        { outcome: 'kept' },
      ];
      const expectedAverage =
        outcomes.reduce((sum, o) => sum + OUTCOME_WEIGHTS[o.outcome], 0) / outcomes.length;
      const expectedScore = Math.round(expectedAverage * 100);
      expect(computeSelfTrust(outcomes).score).toBe(expectedScore);
    });
  });
});