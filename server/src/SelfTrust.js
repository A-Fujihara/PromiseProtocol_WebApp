/**
 * @file SelfTrust.js
 * @description Computes a Priya-persona self-trust score from logged behavior outcomes.
 *
 * DESIGN PRINCIPLE: self-trust measures HONESTY, not success.
 * A self-reported outcome can be a lie, so the score is built to reward the act
 * of honest self-assessment. Keeping a promise is best; honestly admitting a
 * miss still earns credit; the only thing that does not earn credit is a
 * total silent lapse (forgotten with no engagement).
 *
 * The score is COMPUTED ON READ from the full outcome history. There is no
 * stored self_trust field that could drift out of sync — the outcomes are the
 * single source of truth, and the score is always derived from them.
 *
 * NOTE: This is an intentionally simple, transparent model for the MVP demo.
 * It is designed to be legible (you can predict the number by hand) and to be
 * swapped for a more sophisticated curve later at a single seam: replace
 * OUTCOME_WEIGHTS and computeSelfTrust, leave the rest.
 */

// Each behavior outcome contributes a weight in [0, 1].
// Weight reflects honesty + follow-through, NOT raw success.
const OUTCOME_WEIGHTS = {
  kept: 1.0, // did the thing
  partially_kept: 0.7, // did some of it, reported honestly
  failed_but_noticed: 0.5, // failed the behavior, but caught and logged it honestly
  renegotiated: 0.5, // consciously changed the commitment rather than ghosting it
  forgotten: 0.1, // lapsed; minimal credit, but logging it at all beats silence
};

const VALID_OUTCOMES = Object.keys(OUTCOME_WEIGHTS);

/**
 * Whether a string is a recognized behavior outcome.
 * @param {string} outcome
 * @returns {boolean}
 */
function isValidOutcome(outcome) {
  return VALID_OUTCOMES.includes(outcome);
}

/**
 * Computes a self-trust score (0–100) from a list of logged outcomes.
 *
 * The score is the average outcome weight, scaled to 0–100. Averaging (rather
 * than summing) means the score reflects a person's pattern of honesty over
 * time, not just their volume of activity — 10 honest misses should not
 * out-score 3 kept promises.
 *
 * @param {Array<{outcome: string}>} outcomes - logged outcome records, oldest to newest
 * @returns {{ score: number, count: number }} score in [0,100], and how many outcomes fed it
 */
function computeSelfTrust(outcomes) {
  if (!Array.isArray(outcomes) || outcomes.length === 0) {
    // No history yet. Neutral starting point so a brand-new promise
    // does not read as either trustworthy or untrustworthy.
    return { score: 50, count: 0 };
  }

  const weights = outcomes
    .map((o) => OUTCOME_WEIGHTS[o.outcome])
    .filter((w) => typeof w === "number"); // ignore unrecognized outcomes defensively

  if (weights.length === 0) {
    return { score: 50, count: 0 };
  }

  const average = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const score = Math.round(average * 100);

  return { score, count: weights.length };
}

module.exports = {
  OUTCOME_WEIGHTS,
  VALID_OUTCOMES,
  isValidOutcome,
  computeSelfTrust,
};