const PromiseModel = require("../models/PromiseModel");
const Assessment = require("./Assessment");
const Outcome = require("./Outcome");
const {
  savePromise,
  getPromises,
  saveAssessment,
  getAssessments,
  updatePromise,
  getAssessmentSummary,
  saveOutcome,
  getOutcomes,
} = require("./Storage");

// TODO (Tech Debt): Refactor assessment, merit, and ledger logic.
// 'stake' is now an object { type, amount, currency, status }.
// Passing this object into recordAssessment, slashStake, or doing math (stake * 2) will cause NaN/type errors.
const createPromise = (
  promiserId,
  promiseeScope = null,
  domain,
  objective,
  days,
  successCriteria,
  stakeType,
  stakeAmount,
  currency,
  kind,
  visibility,
) => {
  const promise = new PromiseModel(
    promiserId,
    promiseeScope,
    domain,
    objective,
    days,
    successCriteria,
    stakeType,
    stakeAmount,
    currency,
    kind,
    visibility,
  );
  savePromise(promise);
  console.log(`✓ Promise created: ${promise.id}`);
  return promise;
};

/**
 * Looks up a single promise by id.
 * @param {string} promiseId
 * @returns {object|null} The matching promise, or null if not found.
 */
const getPromiseById = (promiseId) => {
  const promises = getPromises();
  return promises.find((p) => p.id === promiseId) || null;
};

const listPromises = (filters = {}) => {
  const promises = getPromises(filters);
  console.log("\n=== Promises ===");
  if (promises.length === 0) {
    console.log("No promises found.");
    return [];
  }
  promises.forEach((p) => {
    const summary = getAssessmentSummary(p.id);
    console.log(
      `Promise ${p.id} | ${summary.kept} KEPT, ${summary.broken} BROKEN`,
    );
  });
  return promises;
};

const submitAssessment = (
  promiseId,
  assessorId,
  judgment,
  evidenceCid,
  stake,
  meritEngine,
  creditLedger,
) => {
  const assessment = new Assessment(
    promiseId,
    assessorId,
    judgment,
    evidenceCid,
    stake,
  );
  saveAssessment(assessment);
  meritEngine.recordAssessment(
    assessorId,
    "/assessments/quality",
    judgment,
    stake,
  );
  // TODO (Tech Debt): Refactor ledger math. 'stake' is now an object { type, amount, currency, status }, not a primitive number.
  // Attempting to multiply the object (e.g., stake * 2) will result in NaN. Must update to use stake.amount and handle 'reputational' nulls.
  if (judgment === "KEPT") {
    creditLedger.reward(assessorId, stake * 2);
    console.log(
      `✓ Assessment: Promise ${promiseId} was KEPT. Assessor rewarded.`,
    );
  } else {
    creditLedger.slashStake(assessorId, stake);
    console.log(
      `✓ Assessment: Promise ${promiseId} was BROKEN. Credits slashed.`,
    );
  }
  return assessment;
};

const listAssessments = (filters = {}) => {
  const assessments = getAssessments(filters);
  console.log("\n=== Assessments ===");
  if (assessments.length === 0) {
    console.log("No assessments found.");
    return [];
  }
  assessments.forEach((a) => {
    const assessorId = a.assessorId || "Unknown";
    const stake = a.stake !== undefined ? a.stake : "N/A";
    const date = a.createdAt
      ? new Date(a.createdAt).toLocaleDateString()
      : "N/A";
    console.log(
      `${a.id} | PromiseID: ${a.promiseId} | Assessor: ${assessorId} | Verdict: ${a.judgment} | Stake: ${stake} | Date: ${date}`,
    );
  });
  return assessments;
};

/**
 * Logs a self-reported outcome check-in against a self-promise.
 * The Outcome model itself validates that `outcome` is a recognized state
 * (see SelfTrust.VALID_OUTCOMES); this function does not re-validate it.
 * @param {string} promiseId
 * @param {string} outcome - One of SelfTrust.VALID_OUTCOMES.
 * @param {string} [note]
 * @param {string} [attachmentRef]
 * @returns {Outcome} The created outcome record.
 */
const logOutcome = (promiseId, outcome, note, attachmentRef) => {
  const outcomeRecord = new Outcome(promiseId, outcome, note, attachmentRef);
  saveOutcome(outcomeRecord);
  console.log(`✓ Outcome logged: ${outcomeRecord.id}`);
  return outcomeRecord;
};

const listOutcomes = (filters = {}) => {
  return getOutcomes(filters);
};

module.exports = {
  createPromise,
  listPromises,
  getPromiseById,
  submitAssessment,
  listAssessments,
  logOutcome,
  listOutcomes,
};