const fs = require("fs");
const path = require("path");
const { saveOutcome, getOutcomes } = require("../src/Storage");
const Outcome = require("../src/Outcome");

const OUTCOMES_FILE = path.join(__dirname, "../data/outcomes.json");

// outcomes.json is a real flat-file "database" (same pattern as promises.json /
// assessments.json), so tests reset it directly rather than mocking fs.
const resetOutcomesFile = () => {
  fs.writeFileSync(OUTCOMES_FILE, JSON.stringify([], null, 2));
};

beforeEach(() => {
  resetOutcomesFile();
});

afterAll(() => {
  resetOutcomesFile();
});

describe("Storage: outcomes", () => {
  test("saveOutcome persists an outcome that getOutcomes can retrieve by promiseId", () => {
    const outcome = new Outcome("prm_aaa", "kept");
    saveOutcome(outcome);

    const results = getOutcomes({ promiseId: "prm_aaa" });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(outcome.id);
    expect(results[0].outcome).toBe("kept");
  });

  test("getOutcomes({ promiseId }) returns only that promise's outcomes", () => {
    saveOutcome(new Outcome("prm_aaa", "kept"));
    saveOutcome(new Outcome("prm_bbb", "forgotten"));
    saveOutcome(new Outcome("prm_aaa", "partially_kept"));

    const resultsA = getOutcomes({ promiseId: "prm_aaa" });
    const resultsB = getOutcomes({ promiseId: "prm_bbb" });

    expect(resultsA).toHaveLength(2);
    expect(resultsA.every((o) => o.promiseId === "prm_aaa")).toBe(true);

    expect(resultsB).toHaveLength(1);
    expect(resultsB[0].promiseId).toBe("prm_bbb");
  });

  test("getOutcomes with no filters returns everything in the store", () => {
    saveOutcome(new Outcome("prm_aaa", "kept"));
    saveOutcome(new Outcome("prm_bbb", "forgotten"));

    expect(getOutcomes()).toHaveLength(2);
  });

  test("getOutcomes returns an empty array for a promiseId with no outcomes", () => {
    saveOutcome(new Outcome("prm_aaa", "kept"));
    expect(getOutcomes({ promiseId: "prm_zzz" })).toEqual([]);
  });

  test("getOutcomes({ promiseId }) returns results oldest-first", () => {
    const first = new Outcome("prm_aaa", "forgotten");
    first.createdAt = new Date("2026-01-01T00:00:00Z");

    const second = new Outcome("prm_aaa", "failed_but_noticed");
    second.createdAt = new Date("2026-01-02T00:00:00Z");

    const third = new Outcome("prm_aaa", "kept");
    third.createdAt = new Date("2026-01-03T00:00:00Z");

    // Save deliberately out of chronological order.
    saveOutcome(third);
    saveOutcome(first);
    saveOutcome(second);

    const results = getOutcomes({ promiseId: "prm_aaa" });
    expect(results.map((o) => o.outcome)).toEqual([
      "forgotten",
      "failed_but_noticed",
      "kept",
    ]);
  });
});