import axios from "axios";
import { toast } from "react-toastify";
import {
  getToken,
  getRefreshToken,
  setAccessToken,
  removeTokens,
  getAdminToken,
  getAdminRefreshToken,
  setAdminAccessToken,
  removeAdminTokens,
  getEcommerceToken,
  getEcommerceRefreshToken,
  setEcommerceAccessToken,
  removeEcommerceTokens,
} from "../authentication/auth";
import { isEcommerceRoute, isAdminRoute } from "../ecommerce-pages/ecommerceRoutes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const currentPath = window.location.pathname;

    let token: string | undefined;
    if (isEcommerceRoute(currentPath)) {
      token = getEcommerceToken();
    } else if (isAdminRoute(currentPath) || (currentPath === "/dashboard" && getAdminToken())) {
      // Prioritize admin token for explicitly admin routes or shared dashboard as admin
      token = getAdminToken();
    } else {
      token = getToken();
    }

    // Fallback if specific token missing (useful during transitions like login)
    if (!token) {
      token = getToken() || getAdminToken() || getEcommerceToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 by trying refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const currentPath = window.location.pathname;
        const isEcommerce = isEcommerceRoute(currentPath);
        const isAdmin = isAdminRoute(currentPath) || (currentPath === "/dashboard" && getAdminToken());

        let refresh: string | undefined;
        if (isEcommerce) {
          refresh = getEcommerceRefreshToken();
        } else if (isAdmin) {
          refresh = getAdminRefreshToken();
        } else {
          refresh = getRefreshToken();
        }
        
        // Fallback for refresh token
        if (!refresh) {
          refresh = getRefreshToken() || getAdminRefreshToken() || getEcommerceRefreshToken();
        }

        if (!refresh) throw new Error("Missing refresh token");
        const res = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh,
        });
        const newAccess = res.data.access;

        // Store new access token in the correct context
        if (isEcommerce && getEcommerceRefreshToken()) {
          setEcommerceAccessToken(newAccess);
        } else if (isAdmin && getAdminRefreshToken()) {
          setAdminAccessToken(newAccess);
        } else {
          setAccessToken(newAccess);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Token refresh failed", err);
        toast.error("Session expired. Please login again.");
        const currentPath = window.location.pathname;
        if (isEcommerceRoute(currentPath)) {
          removeEcommerceTokens();
        } else if (isAdminRoute(currentPath) || (currentPath === "/dashboard" && getAdminToken())) {
          removeAdminTokens();
        } else {
          removeTokens();
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
