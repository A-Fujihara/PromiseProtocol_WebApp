/**
 * @file Assessment.js
 * @description Data model representing a formal judgment made on a Promise.
 * Captures the assessor's decision, the evidence used, and the stake they risked.
 * @author Promise Protocol Team
 */

/**
 * Represents a verification event where an Assessor judges a Promise outcome.
 * @class
 */
class Assessment {
  /**
   * Creates a new Assessment instance.
   * @param {string} promiseId - The ID of the Promise being judged.
   * @param {string} assessorId - The DID of the Assessor making the judgment.
   * @param {string} judgment - The verdict: must be "KEPT" or "BROKEN".
   * @param {string} evidenceCid - IPFS Content ID for the proof or reasoning used.
   * @param {number} stake - The amount of credits staked on this judgment.
   */
  constructor(promiseId, assessorId, judgment, evidenceCid, stake) {
    this.id = this.generateId();
    this.promiseId = promiseId;
    this.assessorId = assessorId;
    this.judgment = judgment; // KEPT or BROKEN
    this.evidenceCid = evidenceCid;
    this.stake = stake;
    this.createdAt = new Date();
  }

  /**
   * Generates a unique identifier for the assessment.
   * Format: asm_<timestamp>_<random_string>
   * @returns {string} The generated unique ID.
   */
  generateId() {
    return `asm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = Assessment;
