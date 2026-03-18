import axios from "axios";
import {
	getPromises,
	createPromise,
	getAssessments,
	submitAssessment,
} from "./api";

jest.mock("axios");
const mockedAxios = axios;

describe("API Functions", () => {
	test("GET /api/promises", async () => {
		const mockResData = [
			{
				id: "prm_1234567890_abc123",
				promiserId: "user_123",
				promiseeScope: ["user_456", "user_789"],
				domain: "health",
				objective: "Run 3 times a week for 30 days",
				timeline: 30,
				successCriteria: ["Completed 12 runs in 30 days"],
				stake: 50,
				status: "pending",
				createdAt: "2026-03-17T00:00:00.000Z",
			},
		];
		mockedAxios.get.mockResolvedValue({ data: mockResData });

		getPromises().then((res) => {
			expect(res).toEqual(mockResData);
		});
	});

	test("POST /api/promises", async () => {
		const mockReq = {
			promiserId: "user_123",
			promiseeScope: ["user_456", "user_789"],
			domain: "health",
			objective: "Run 3 times a week for 30 days",
			timeline: 30,
			successCriteria: ["Completed 12 runs in 30 days"],
			stake: 50,
		};
		const mockRes = { data: mockReq, status: 201 };
		mockedAxios.post.mockResolvedValue(mockRes);

		createPromise(mockReq).then((res) => {
			expect(res).toEqual(mockRes.data);
		});
	});

	test("GET /api/assessments", async () => {
		const mockResData = [
			{
				id: "asm_1234567890_xyz456",
				promiseId: "prm_1234567890_abc123",
				assessorId: "user_456",
				judgment: "KEPT",
				evidenceCid: "QmXyz...",
				stake: 25,
				createdAt: "2026-03-17T00:00:00.000Z",
			},
		];
		mockedAxios.get.mockResolvedValue({ data: mockResData });

		getAssessments().then((res) => {
			expect(res).toEqual(mockResData);
		});
	});

	test("POST /api/assessments", async () => {
		const mockReq = {
			promiseId: "prm_1234567890_abc123",
			assessorId: "user_456",
			judgment: "KEPT",
			evidenceCid: "QmXyz...",
			stake: 25,
		};
		const mockRes = { data: mockReq, status: 201 };
		mockedAxios.post.mockResolvedValue(mockRes);

		submitAssessment(mockReq).then((res) => {
			expect(res).toEqual(mockRes.data);
		});
	});
});

describe("Error handling", () => {
	test("GET /api/promises", async () => {
		const mockRes = { status: 500 };
		mockedAxios.get.mockRejectedValue(mockRes);

		try {
			await getAssessments();
			throw new Error("Did not throw error");
		} catch (error) {
			expect(error.status).toBe(500);
		}
	});

	test("POST /api/promises", async () => {
		const mockReq = {};
		const mockRes = { status: 400 };
		mockedAxios.post.mockRejectedValue(mockRes);

		try {
			await createPromise(mockReq);
			throw new Error("Did not throw error");
		} catch (error) {
			expect(error.status).toBe(400);
		}
	});

	test("GET /api/assessments", async () => {
		const mockRes = { status: 500 };
		mockedAxios.get.mockRejectedValue(mockRes);

		try {
			await getAssessments();
			throw new Error("Did not throw error");
		} catch (error) {
			expect(error.status).toBe(500);
		}
	});

	test("POST /api/assessments", async () => {
		const mockReq = {};
		const mockRes = { status: 400 };
		mockedAxios.post.mockRejectedValue(mockRes);

		try {
			await submitAssessment(mockReq);
			throw new Error("Did not throw error");
		} catch (error) {
			expect(error.status).toBe(400);
		}
	});
});
