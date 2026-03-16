import axios from "axios";
import {
  getToken,
  getRefreshToken,
  setAccessToken,
  removeTokens,
  getEcommerceToken,
  getEcommerceRefreshToken,
  setEcommerceAccessToken,
  removeEcommerceTokens
} from "../authentication/auth";
import { isEcommerceRoute } from "../ecommerce-pages/ecommerceRoutes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    // Determine active route
    const currentPath = window.location.pathname;
    const isEcommerce = isEcommerceRoute(currentPath);
    
    // Select the appropriate token
    const token = isEcommerce ? getEcommerceToken() : getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
        
        const refresh = isEcommerce ? getEcommerceRefreshToken() : getRefreshToken();
        
        if (!refresh) throw new Error("Missing refresh token");
        const res = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh,
        });
        const newAccess = res.data.access;
        
        if (isEcommerce) {
          setEcommerceAccessToken(newAccess);
        } else {
          setAccessToken(newAccess);
        }
        
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        const currentPath = window.location.pathname;
        if (isEcommerceRoute(currentPath)) {
          removeEcommerceTokens();
        } else {
          removeTokens();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
