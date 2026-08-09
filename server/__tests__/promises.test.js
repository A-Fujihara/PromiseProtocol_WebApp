const request = require("supertest");
const app = require("../server");
const Storage = require("../src/Storage");

jest.mock("../src/Storage", () => ({
  savePromise: jest.fn((promise) => promise),
  getPromises: jest.fn(() => []),
  saveAssessment: jest.fn((assessment) => assessment),
  getAssessments: jest.fn(() => []),
  getAssessmentSummary: jest.fn(() => ({ kept: 0, broken: 0, total: 0 })),
  saveOutcome: jest.fn((outcome) => outcome),
  getOutcomes: jest.fn(() => []),
}));

describe("POST /api/promises", () => {
  it("should create a promise and return 201", async () => {
    const res = await request(app)
      .post("/api/promises")
      .send({
        promiserId: "user_001",
        promiseeScope: "public",
        domain: "health",
        objective: "run every day",
        days: 30,
        successCriteria: "Complete 30 runs in 30 days",
        stake: { type: "financial", amount: 10 },
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.promiserId).toBe("user_001");
  });

  it("should return 400 for invalid promiseeScope", async () => {
    const res = await request(app)
      .post("/api/promises")
      .send({
        promiserId: "user_001",
        promiseeScope: "anyone",
        domain: "health",
        objective: "run every day",
        days: 30,
        successCriteria: "Complete 30 runs in 30 days",
        stake: { type: "financial", amount: 10 },
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Invalid promiseeScope");
  });

  it("should return 400 if successCriteria is missing", async () => {
    const res = await request(app)
      .post("/api/promises")
      .send({
        promiserId: "user_001",
        promiseeScope: "public",
        domain: "health",
        objective: "run every day",
        days: 30,
        stake: { type: "financial", amount: 10 },
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if successCriteria is empty", async () => {
    const res = await request(app)
      .post("/api/promises")
      .send({
        promiserId: "user_001",
        promiseeScope: "public",
        domain: "health",
        objective: "run every day",
        days: 30,
        successCriteria: "",
        stake: { type: "financial", amount: 10 },
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/promises")
      .send({ promiserId: "user_001" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  describe("Self-Promise Support (PP-A7)", () => {
    it("should create a self-promise with no stake and return 201 with private visibility", async () => {
      const res = await request(app)
        .post("/api/promises")
        .send({
          promiserId: "priya_001",
          promiseeScope: "self",
          domain: "wellness",
          objective: "Meditate for 10 minutes every morning",
          days: 14,
          successCriteria: "Logged a session on at least 12 of 14 days",
          kind: "self",
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.kind).toBe("self");
      expect(res.body.visibility).toBe("private");
      expect(res.body.stake).toBeNull();
    });

    it("should return 400 for a missing stake when kind is 'assessed' or omitted (regression)", async () => {
      const res = await request(app)
        .post("/api/promises")
        .send({
          promiserId: "user_001",
          promiseeScope: "public",
          domain: "health",
          objective: "run every day",
          days: 30,
          successCriteria: "Complete 30 runs in 30 days",
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 when a self-promise sets an explicit non-private visibility", async () => {
      const res = await request(app)
        .post("/api/promises")
        .send({
          promiserId: "priya_001",
          promiseeScope: "self",
          domain: "wellness",
          objective: "Meditate for 10 minutes every morning",
          days: 14,
          successCriteria: "Logged a session on at least 12 of 14 days",
          kind: "self",
          visibility: "group",
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Invalid visibility: self-promises must be private",
      );
    });
  });
});

describe("GET /api/promises", () => {
  it("should return 200 and an array", async () => {
    const res = await request(app).get("/api/promises");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /api/promises/:id/self-trust (PP-A4)", () => {
  afterEach(() => {
    Storage.getPromises.mockReset().mockReturnValue([]);
    Storage.getOutcomes.mockReset().mockReturnValue([]);
  });

  it("should return { score: 50, count: 0 } for a self-promise with no outcomes", async () => {
    Storage.getPromises.mockReturnValue([
      { id: "prm_self_001", promiserId: "priya_001", kind: "self" },
    ]);
    Storage.getOutcomes.mockReturnValue([]);

    const res = await request(app).get(
      "/api/promises/prm_self_001/self-trust",
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ score: 50, count: 0 });
  });

  it("should score a forgotten outcome far lower than a failed_but_noticed outcome", async () => {
    Storage.getPromises.mockReturnValue([
      { id: "prm_self_001", promiserId: "priya_001", kind: "self" },
      { id: "prm_self_002", promiserId: "priya_001", kind: "self" },
    ]);

    Storage.getOutcomes.mockReturnValueOnce([
      { promiseId: "prm_self_001", outcome: "forgotten" },
    ]);
    const forgottenRes = await request(app).get(
      "/api/promises/prm_self_001/self-trust",
    );

    Storage.getOutcomes.mockReturnValueOnce([
      { promiseId: "prm_self_002", outcome: "failed_but_noticed" },
    ]);
    const noticedRes = await request(app).get(
      "/api/promises/prm_self_002/self-trust",
    );

    expect(forgottenRes.body.score).toBeLessThan(noticedRes.body.score);
  });

  it("should return a score matching a hand-computation from logged outcomes", async () => {
    Storage.getPromises.mockReturnValue([
      { id: "prm_self_001", promiserId: "priya_001", kind: "self" },
    ]);
    // kept (1.0), partially_kept (0.7) -> average 0.85 -> 85
    Storage.getOutcomes.mockReturnValue([
      { promiseId: "prm_self_001", outcome: "kept" },
      { promiseId: "prm_self_001", outcome: "partially_kept" },
    ]);

    const res = await request(app).get(
      "/api/promises/prm_self_001/self-trust",
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ score: 85, count: 2 });
  });

  it("should return 404 for a non-existent promise", async () => {
    Storage.getPromises.mockReturnValue([]);

    const res = await request(app).get(
      "/api/promises/prm_does_not_exist/self-trust",
    );
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 when the promise is not a self-promise", async () => {
    Storage.getPromises.mockReturnValue([
      { id: "prm_assessed_001", promiserId: "user_001", kind: "assessed" },
    ]);

    const res = await request(app).get(
      "/api/promises/prm_assessed_001/self-trust",
    );
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});