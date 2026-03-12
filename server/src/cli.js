const Promise = require("../models/Promise");
const Assessment = require("./Assessment");
const {
  savePromise,
  getPromises,
  saveAssessment,
  getAssessments,
  updatePromise,
  getAssessmentSummary,
} = require("./Storage");

const createPromise = (promiserId, domain, objective, days, stakeType, stakeAmount) => {
  const promise = new Promise(
    promiserId,
    ["*"],
    domain,
    objective,
    days,
    ["Success metric TBD"],
    {type: stakeType, amount: stakeAmount}
  );
  savePromise(promise);
  console.log(`✓ Promise created: ${promise.id}`);
  return promise;
};

const listPromises = (filters = {}) => {
  const promises = getPromises(filters);
  console.log("\n=== Promises ===");
  if (promises.length === 0) {
    console.log("No promises found.");
    return;
  }
  promises.forEach((p) => {
    const summary = getAssessmentSummary(p.id);
    console.log(
      `Promise ${p.id} | ${summary.kept} KEPT, ${summary.broken} BROKEN`,
    );
  });
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

  // Save assessment to storage
  saveAssessment(assessment);

  // Update merit
  meritEngine.recordAssessment(
    assessorId,
    "/assessments/quality",
    judgment,
    stake,
  );

  // Handle credit flow
  if (judgment === "KEPT") {
    creditLedger.reward(assessorId, stake * 2); // reward for honest assessment
    console.log(
      `✓ Assessment: Promise ${promiseId} was KEPT. Assessor rewarded.`,
    );
  } else {
    creditLedger.slashStake(assessorId, stake); // penalty for breaking promise
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
    return;
  }

  assessments.forEach((a) => {
    // Handle missing fields gracefully
    const assessorId = a.assessorId || "Unknown";
    const stake = a.stake !== undefined ? a.stake : "N/A";
    const date = a.createdAt
      ? new Date(a.createdAt).toLocaleDateString()
      : "N/A";

    console.log(
      `${a.id} | PromiseID: ${a.promiseId} | Assessor: ${assessorId} | Verdict: ${a.judgment} | Stake: ${stake} | Date: ${date}`,
    );
  });
};

module.exports = {
  createPromise,
  listPromises,
  submitAssessment,
  listAssessments,
};
