const request = require("supertest");
const app = require("../server");

jest.mock("../src/Storage", () => ({
  savePromise: jest.fn((promise) => promise),
  getPromises: jest.fn(() => [
    {
      id: "prm_self_001",
      promiserId: "user_001",
      kind: "self",
      visibility: "private",
    },
    {
      id: "prm_assessed_001",
      promiserId: "user_001",
      kind: "assessed",
      visibility: "public",
    },
  ]),
  saveAssessment: jest.fn((assessment) => assessment),
  getAssessments: jest.fn(() => []),
  getAssessmentSummary: jest.fn(() => ({ kept: 0, broken: 0, total: 0 })),
  saveOutcome: jest.fn((outcome) => outcome),
  getOutcomes: jest.fn(() => [
    {
      id: "out_existing_001",
      promiseId: "prm_self_001",
      outcome: "kept",
      note: null,
      attachmentRef: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
}));

describe("POST /api/outcomes", () => {
  it("should log an outcome against a self-promise and return 201", async () => {
    const res = await request(app).post("/api/outcomes").send({
      promiseId: "prm_self_001",
      outcome: "kept",
      note: "Went for a run this morning.",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.promiseId).toBe("prm_self_001");
    expect(res.body.outcome).toBe("kept");
  });

  it("should return 400 if promiseId is missing", async () => {
    const res = await request(app).post("/api/outcomes").send({
      outcome: "kept",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if outcome is missing", async () => {
    const res = await request(app).post("/api/outcomes").send({
      promiseId: "prm_self_001",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 404 for a non-existent promise", async () => {
    const res = await request(app).post("/api/outcomes").send({
      promiseId: "prm_does_not_exist",
      outcome: "kept",
    });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 when logging against a non-self promise", async () => {
    const res = await request(app).post("/api/outcomes").send({
      promiseId: "prm_assessed_001",
      outcome: "kept",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 for an invalid outcome value", async () => {
    const res = await request(app).post("/api/outcomes").send({
      promiseId: "prm_self_001",
      outcome: "not_a_real_outcome",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/outcomes", () => {
  it("should return outcomes for a given promiseId", async () => {
    const res = await request(app)
      .get("/api/outcomes")
      .query({ promiseId: "prm_self_001" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("promiseId", "prm_self_001");
  });
});