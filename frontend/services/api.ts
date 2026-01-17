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

// Logging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// APIs
export const fetchProducts = () => API.get("/products");
export const fetchProductById = (id: string) => API.get(`/products/${id}`);

export const createOrder = (data: any) => API.post("/order/create", data);
export const createRazorpayOrder = (data: any) => API.post("/order/razorpay", data);
export const verifyPayment = (data: any) => API.post("/order/verify-payment", data);

export const calculateShipping = (pincode: string) => API.post("/order/calculate-shipping", { pincode });

export default API;