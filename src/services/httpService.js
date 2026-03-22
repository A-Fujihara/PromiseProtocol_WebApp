import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default {
	get: axiosInstance.get,
	post: axiosInstance.post,
	put: axiosInstance.put,
	delete: axiosInstance.delete,
};
