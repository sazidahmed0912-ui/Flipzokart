import axios from "axios";

/**
 * SAFE access to Vite env
 * This avoids TS "ImportMeta" issues completely
 */
const API_BASE_URL = (import.meta as any).env.VITE_API_URL as string;

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Logging & Auth Handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", JSON.stringify(error.response?.data || error.message, null, 2));

    // Auto-logout on 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("flipzokart_user");
      // Optional: Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// APIs
export const fetchProducts = () => API.get("/api/products");
export const fetchProductById = (id: string) => API.get(`/api/products/${id}`);

// Orders (Base: /api/order)
export const createOrder = (data: any) => API.post("/api/order/create", data);
export const createRazorpayOrder = (data: any) => API.post("/api/order/razorpay", data);
export const verifyPayment = (data: any) => API.post("/api/order/verify-payment", data);

export const calculateShipping = (pincode: string) => API.post("/api/order/calculate-shipping", { pincode });
export const fetchAllOrders = () => API.get("/api/order/admin/all");
export const fetchUserOrders = (userId: string) => API.get(`/api/order/user/${userId}`);
export const fetchOrderById = (id: string) => API.get(`/api/order/${id}`);

export default API;