import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const fetchProducts = () => API.get("/products");
export const fetchProductById = (id: string) => API.get(`/products/${id}`);

// Order API functions
export const createOrder = (orderData: any) => API.post("/order/create", orderData);
export const createRazorpayOrder = (orderData: any) => API.post("/order/razorpay", orderData);
export const verifyPayment = (verifyData: any) => API.post("/order/verify-payment", verifyData);
export const calculateShipping = (pincode: string) => API.post("/order/calculate-shipping", { pincode });

// Notification API functions
export const fetchUserNotifications = () => API.get("/notifications");
export const markNotificationAsRead = (id: string) => API.put(`/notifications/${id}/read`);
export const deleteNotification = (id: string) => API.delete(`/notifications/${id}`);

export default API;
