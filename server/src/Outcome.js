/**
 * @file Outcome.js
 * @description Data model representing a single logged check-in against a
 * self-promise. This is the "behavior promise" half of the two-promise
 * pattern: where an Assessment is a third party's judgment on a public
 * promise, an Outcome is Priya's own honest report on her private one.
 * @author Promise Protocol Team
 */

const { isValidOutcome, VALID_OUTCOMES } = require("./SelfTrust");

/**
 * Represents one self-reported check-in against a self-promise.
 * @class
 */
class Outcome {
  /**
   * Creates a new Outcome instance.
   * @param {string} promiseId - The ID of the self-promise this check-in is against.
   * @param {string} outcome - One of SelfTrust.VALID_OUTCOMES.
   * @param {string} [note] - Optional free-text note.
   * @param {string} [attachmentRef] - Optional path/filename placeholder (no real upload pipeline in MVP).
   * @throws {Error} If outcome is not a recognized state.
   */
  constructor(promiseId, outcome, note, attachmentRef) {
    this.id = this.generateId();
    this.promiseId = promiseId;
    this.outcome = this.validateOutcome(outcome);
    this.note = note ?? null;
    this.attachmentRef = attachmentRef ?? null;
    this.createdAt = new Date();
  }

  /**
   * Generates a unique identifier for the outcome.
   * Format: out_<timestamp>_<random_string>
   * @returns {string} The generated unique ID.
   */
  generateId() {
    return `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validates the outcome state against SelfTrust.VALID_OUTCOMES.
   * Reuses isValidOutcome rather than redefining the list, so the two
   * modules can never drift out of sync.
   */
  validateOutcome(outcome) {
    if (!isValidOutcome(outcome)) {
      throw new Error(
        `Invalid outcome: must be one of ${VALID_OUTCOMES.join(", ")}`,
      );
    }
    return outcome;
  }
}

module.exports = Outcome;