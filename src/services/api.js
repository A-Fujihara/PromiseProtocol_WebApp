import httpService from "./httpService";

export const getPromises = async () => {
	try {
		const res = await httpService.get("/api/promises");
		return res.data;
	} catch (error) {
		throw {
			message: "Failed to GET /api/promises",
			originalError: error,
			status: error.status,
		};
	}
};

export const createPromise = async (req) => {
	try {
		const res = await httpService.post("/api/promises", req);
		return res.data;
	} catch (error) {
		throw {
			message: "Failed to POST /api/promises",
			originalError: error,
			status: error.status,
		};
	}
};

export const getAssessments = async () => {
	try {
		const res = await httpService.get("/api/assessments");
		return res.data;
	} catch (error) {
		throw {
			message: "Failed to GET /api/assessments",
			originalError: error,
			status: error.status,
		};
	}
};

export const submitAssessment = async (req) => {
	try {
		const res = await httpService.post("/api/assessments", req);
		return res.data;
	} catch (error) {
		throw {
			message: "Failed to POST /api/assessments",
			originalError: error,
			status: error.status,
		};
	}
};
