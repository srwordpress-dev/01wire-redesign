import axios from "axios";
import { API_BASE_URL } from "utils/apiConfig";
import { DEMO_MODE, DEMO_WRITE_MESSAGE } from "demo/demoMode";

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
    // Demo preview: uploads never leave the browser.
    if (DEMO_MODE) return Promise.reject(new Error(DEMO_WRITE_MESSAGE));
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
