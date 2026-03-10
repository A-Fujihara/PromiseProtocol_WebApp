const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const savePromise = (promise) => {
  const file = path.join(DATA_DIR, "promises.json");
  let promises = [];
  if (fs.existsSync(file)) {
    promises = JSON.parse(fs.readFileSync(file));
  }
  promises.push(promise);
  fs.writeFileSync(file, JSON.stringify(promises, null, 2));
  return promise;
};

const getPromises = (filters = {}) => {
  const file = path.join(DATA_DIR, "promises.json");
  if (!fs.existsSync(file)) return [];

  let promises = JSON.parse(fs.readFileSync(file));

  // Apply filters if provided
  if (Object.keys(filters).length > 0) {
    promises = promises.filter((promise) => {
      // Filter by promiserId
      if (filters.promiserId && promise.promiserId !== filters.promiserId) {
        return false;
      }

      // Filter by domain
      if (filters.domain && promise.domain !== filters.domain) {
        return false;
      }

      // Filter by promiseeScope (exact match or contains)
      if (filters.promiseeScope) {
        if (Array.isArray(promise.promiseeScope)) {
          if (!promise.promiseeScope.includes(filters.promiseeScope)) {
            return false;
          }
        } else if (promise.promiseeScope !== filters.promiseeScope) {
          return false;
        }
      }

      return true;
    });
  }

  return promises;
};

const saveAssessment = (assessment) => {
  const file = path.join(DATA_DIR, "assessments.json");
  let assessments = [];
  if (fs.existsSync(file)) {
    assessments = JSON.parse(fs.readFileSync(file));
  }
  assessments.push(assessment);
  fs.writeFileSync(file, JSON.stringify(assessments, null, 2));
  return assessment;
};

const getAssessments = (filters = {}) => {
  const file = path.join(DATA_DIR, "assessments.json");
  if (!fs.existsSync(file)) return [];

  let assessments = JSON.parse(fs.readFileSync(file));

  // Apply filters if provided
  if (Object.keys(filters).length > 0) {
    assessments = assessments.filter((assessment) => {
      // Filter by promiseId
      if (filters.promiseId && assessment.promiseId !== filters.promiseId) {
        return false;
      }

      // Filter by assessorId
      if (filters.assessorId && assessment.assessorId !== filters.assessorId) {
        return false;
      }

      // Filter by judgment
      if (filters.judgment && assessment.judgment !== filters.judgment) {
        return false;
      }

      return true;
    });
  }

  return assessments;
};

/**
 * Calculates the aggregate truth of a promise based on all assessments.
 * @param {string} promiseId
 * @returns {object} Summary counts of judgments
 */
const getAssessmentSummary = (promiseId) => {
  // 1. Fetch all assessments tied to this specific promise
  const assessments = getAssessments({ promiseId });

  // 2. Tally the objective data
  const kept = assessments.filter((a) => a.judgment === "KEPT").length;
  const broken = assessments.filter((a) => a.judgment === "BROKEN").length;

  // 3. Return a clean data object
  return { kept, broken, total: assessments.length };
};

module.exports = {
  savePromise,
  getPromises,
  saveAssessment,
  getAssessments,
  getAssessmentSummary,
};
