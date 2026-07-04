class PromiseModel {
  static PROMISEE_SCOPE_VALUES = [
    "self",
    "individual",
    "organization",
    "public",
  ];

  static KIND_VALUES = ["self", "assessed"];

  static VISIBILITY_VALUES = ["private", "group", "public"];

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
    kind,
    visibility,
  ) {
    this.id = this.generateId();
    this.promiserId = promiserId;
    this.promiseeScope = this.validatePromiseeScope(promiseeScope);
    this.domain = domain;
    this.objective = objective;
    this.timeline = timeline;
    this.successCriteria = this.validateSuccessCriteria(successCriteria);
    // kind must be resolved before stake/visibility, since both depend on it
    // (self-promises may omit a stake, and default visibility differs by kind).
    this.kind = this.validateKind(kind);
    this.visibility = this.validateVisibility(visibility, this.kind);
    this.stake = this.validateAndFormatStake(
      stakeType,
      stakeAmount,
      currency,
      this.kind,
    );
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
   * Validates the promise's kind: "self" (no assessor/financial stake required)
   * or "assessed" (existing default behavior).
   * Intentionally no legacy fallback, matching validatePromiseeScope's pattern -
   * but kind is a new field, so omitting it entirely defaults to "assessed"
   * to keep all existing (pre-self-promise) callers unaffected.
   */
  validateKind(kind) {
    if (kind === undefined || kind === null) {
      return "assessed";
    }
    if (typeof kind !== "string") {
      throw new Error("Invalid kind");
    }
    const normalized = kind.trim().toLowerCase();
    if (!PromiseModel.KIND_VALUES.includes(normalized)) {
      throw new Error("Invalid kind");
    }
    return normalized;
  }

  /**
   * Validates the promise's visibility: "private", "group", or "public".
   * Self-promises are ALWAYS private - not just by default. A self-promise
   * may omit visibility (defaults to "private") or pass "private" explicitly,
   * but any other value throws. This is a deliberate invariant, not a UX
   * default: self-promises are things like "I promise I'll quit smoking" -
   * inherently private commitments that should never leak to group/public
   * visibility, even by caller mistake.
   */
  validateVisibility(visibility, kind) {
    if (visibility === undefined || visibility === null) {
      return kind === "self" ? "private" : "public";
    }
    if (typeof visibility !== "string") {
      throw new Error("Invalid visibility");
    }
    const normalized = visibility.trim().toLowerCase();
    if (!PromiseModel.VISIBILITY_VALUES.includes(normalized)) {
      throw new Error("Invalid visibility");
    }
    if (kind === "self" && normalized !== "private") {
      throw new Error("Invalid visibility: self-promises must be private");
    }
    return normalized;
  }

  /**
   * Validates and formats the incoming stake payload.
   * @param {number|string} stakeType - The raw stake type, or a legacy numeric amount
   * @param {number} stakeAmount - The stake amount (for "financial" stakeType)
   * @param {string} currency - Currency code, defaults to USD
   * @param {string} kind - "self" or "assessed"; self-promises may omit a stake entirely
   * @returns {object|null} { type: 'financial' | 'reputational', amount: number | null, currency: USD, status: 'held'} or null for a stake-less self-promise
   * @throws {Error} If the stake type is invalid or data is malformed
   */
  validateAndFormatStake(stakeType, stakeAmount, currency = "USD", kind = "assessed") {
    // Self-promises don't require a stake at all. Only short-circuit when no
    // stake was supplied - a self-promise that DOES supply one still goes
    // through the normal validation paths below, untouched.
    if (kind === "self" && stakeType === undefined) {
      return null;
    }
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