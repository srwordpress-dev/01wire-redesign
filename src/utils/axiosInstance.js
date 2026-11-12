import axios from "axios";
import { API_BASE_URL } from "utils/apiConfig";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Add other common headers if needed
  },
});

// Add an interceptor to include authorization token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Assuming you store the token in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
