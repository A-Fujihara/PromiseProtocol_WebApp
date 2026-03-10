const request = require("supertest");
const app = require("../server");

jest.mock("../src/Storage", () => ({
  savePromise: jest.fn((promise) => promise),
  getPromises: jest.fn(() => []),
  saveAssessment: jest.fn((assessment) => assessment),
  getAssessments: jest.fn(() => []),
  getAssessmentSummary: jest.fn(() => ({ kept: 0, broken: 0, total: 0 })),
}));

describe("POST /api/assessments", () => {
  it("should create an assessment and return 201", async () => {
    const res = await request(app).post("/api/assessments").send({
      promiseId: "prm_001",
      assessorId: "user_002",
      judgment: "KEPT",
      evidenceCid: "Qm123abc",
      stake: 10,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.promiseId).toBe("prm_001");
    expect(res.body.judgment).toBe("KEPT");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/assessments")
      .send({ assessorId: "user_002" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/assessments", () => {
  it("should return 200 with an array", async () => {
    const res = await request(app).get("/api/assessments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
