class PromiseModel {
  static PROMISEE_SCOPE_VALUES = [
    "self",
    "individual",
    "organization",
    "public",
  ];

  constructor(
    promiserId,
    promiseeScope,
    domain,
    objective,
    timeline,
    successCriteria,
    stakeType,
    stakeAmount,
    currency,
  ) {
    this.id = this.generateId();
    this.promiserId = promiserId;
    this.promiseeScope = this.validatePromiseeScope(promiseeScope);
    this.domain = domain;
    this.objective = objective;
    this.timeline = timeline;
    this.successCriteria = this.validateSuccessCriteria(successCriteria);
    this.stake = this.validateAndFormatStake(stakeType, stakeAmount, currency);
    this.createdAt = new Date();
    this.status = "pending";
  }

  generateId() {
    return `prm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateSuccessCriteria(successCriteria) {
    // successCriteria must be a non-empty string.
    // Intentionally no legacy placeholder fallback (e.g. ['Success metric TBD']).
    if (typeof successCriteria !== "string") {
      throw new Error("Invalid successCriteria: must be a string");
    }
    const trimmed = successCriteria.trim();
    if (trimmed.length === 0) {
      throw new Error("Invalid successCriteria: cannot be empty");
    }
    return trimmed;
  }

  validatePromiseeScope(promiseeScope) {
    // promiseeScope must be one of the allowed enum values.
    // Intentionally no legacy wildcard fallback (e.g. ["*"]).
    if (typeof promiseeScope !== "string") {
      throw new Error("Invalid promiseeScope");
    }
    const normalized = promiseeScope.trim().toLowerCase();
    if (!PromiseModel.PROMISEE_SCOPE_VALUES.includes(normalized)) {
      throw new Error("Invalid promiseeScope");
    }
    return normalized;
  }

  /**
   * Validates and formats the incoming stake payload.
   * @param {number|object} input - The raw stake data
   * @returns {object} { type: 'financial' | 'reputational', amount: number | null, currency: USD, status: 'held'}
   * @throws {Error} If the stake type is invalid or data is malformed
   */
  validateAndFormatStake(stakeType, stakeAmount, currency = "USD") {
    // Catch legacy numeric inputs and convert them to the new financial object
    if (typeof stakeType === "number") {
      return {
        type: "financial",
        amount: stakeType,
        currency: currency,
        status: "held",
      };
    }
    if (stakeType === "financial") {
      if (typeof stakeAmount !== "number" || stakeAmount <= 0) {
        throw new Error("Invalid stake amount, number must be positive");
      }
      return {
        type: "financial",
        amount: stakeAmount,
        currency: currency,
        status: "held",
      };
    }
    if (stakeType === "reputational") {
      // TODO: Pending product alignment on Bob's Sponsio formula for reputational stakes.
      // Currently passing a null amount through until the mathematical model covers this explicitly.
      return {
        type: "reputational",
        amount: null,
        status: "held",
      };
    }
    throw new Error("Invalid stake type");
  }
}

module.exports = PromiseModel;
