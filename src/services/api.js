import * as axios from "axios";

export const getPromises = async () => {
	try {
		const res = await axios.get("/api/promises");
		return res.data;
	} catch (error) {
		throw {
			message: "Failed to get promises",
			originalError: error,
			status: error.response?.status,
		};
	}
};

export const createPromise = async (req) => {
	try {
		const res = await axios.post("/api/promises", req);
		return res.data;
	} catch (error) {
		throw error;
	}
};

export const getAssessments = async () => {
	try {
		const res = await axios.get("/api/assessments");
		return res.data;
	} catch (error) {
		throw error;
	}
};

export const submitAssessment = async (req) => {
	try {
		const res = await axios.post("/api/assessments", req);
		return res.data;
	} catch (error) {
		throw error;
	}
};
