import axios from "axios";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/errors";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/authToken";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const REFRESH_TOKEN_URL = "/auth/refresh-token";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  timeout: 20000,
});

const setAuthorizationHeader = (headers, token) => {
  headers.Authorization = `Bearer ${token}`;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    setAuthorizationHeader(config.headers, token);
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url === REFRESH_TOKEN_URL;

    if (!originalRequest || isRefreshRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          setAuthorizationHeader(originalRequest.headers, token);
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post(REFRESH_TOKEN_URL);
        const newToken = res?.data?.data?.accessToken;
        if (typeof newToken !== "string" || !newToken.trim()) {
          throw new Error("Missing access token in refresh response.");
        }

        setAccessToken(newToken);
        originalRequest.headers = originalRequest.headers || {};
        setAuthorizationHeader(originalRequest.headers, newToken);

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        toast.error(ERROR_MESSAGES.sessionExpired);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
