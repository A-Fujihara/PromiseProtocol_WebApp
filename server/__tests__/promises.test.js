const request = require("supertest");
const app = require("../server");

jest.mock("../src/Storage", () => ({
  savePromise: jest.fn((promise) => promise),
  getPromises: jest.fn(() => []),
  saveAssessment: jest.fn((assessment) => assessment),
  getAssessments: jest.fn(() => []),
  getAssessmentSummary: jest.fn(() => ({ kept: 0, broken: 0, total: 0 })),
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
});

describe("GET /api/promises", () => {
  it("should return 200 and an array", async () => {
    const res = await request(app).get("/api/promises");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
