const Outcome = require("../src/Outcome");
const { VALID_OUTCOMES } = require("../src/SelfTrust");

describe("Outcome", () => {
  test("constructs a valid outcome for each recognized state", () => {
    VALID_OUTCOMES.forEach((state) => {
      const outcome = new Outcome("prm_123", state);
      expect(outcome.outcome).toBe(state);
      expect(outcome.promiseId).toBe("prm_123");
    });
  });

  test("generates an id with the out_ prefix", () => {
    const outcome = new Outcome("prm_123", "kept");
    expect(outcome.id).toMatch(/^out_/);
  });

  test("generates a unique id per instance", () => {
    const a = new Outcome("prm_123", "kept");
    const b = new Outcome("prm_123", "kept");
    expect(a.id).not.toBe(b.id);
  });

  test("defaults note and attachmentRef to null when omitted", () => {
    const outcome = new Outcome("prm_123", "kept");
    expect(outcome.note).toBeNull();
    expect(outcome.attachmentRef).toBeNull();
  });

  test("stores optional note and attachmentRef when provided", () => {
    const outcome = new Outcome(
      "prm_123",
      "partially_kept",
      "Only did half the workout",
      "photos/proof.jpg",
    );
    expect(outcome.note).toBe("Only did half the workout");
    expect(outcome.attachmentRef).toBe("photos/proof.jpg");
  });

  test("sets createdAt to a Date at construction time", () => {
    const before = Date.now();
    const outcome = new Outcome("prm_123", "kept");
    const after = Date.now();
    expect(outcome.createdAt).toBeInstanceOf(Date);
    expect(outcome.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(outcome.createdAt.getTime()).toBeLessThanOrEqual(after);
  });

  test("rejects an unrecognized outcome state with a clear error", () => {
    expect(() => new Outcome("prm_123", "lied")).toThrow(
      `Invalid outcome: must be one of ${VALID_OUTCOMES.join(", ")}`,
    );
  });

  test("rejects a missing outcome state", () => {
    expect(() => new Outcome("prm_123", undefined)).toThrow(/Invalid outcome/);
  });

  test("rejects an empty string outcome state", () => {
    expect(() => new Outcome("prm_123", "")).toThrow(/Invalid outcome/);
  });
});