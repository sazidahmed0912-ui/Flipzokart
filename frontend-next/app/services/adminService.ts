import API from "./api";

export const getDashboardStats = () => API.get("/api/admin/dashboard-stats");
export const fetchAllUsers = () => API.get("/api/admin/users");
export const createSeller = (data: any) => API.post("/api/admin/users", { ...data, role: 'seller' });
export const updateUserStatus = (id: string, status: string, days?: number, reason?: string, suspensionEnd?: string) => API.put(`/api/admin/users/${id}/status`, { status, days, reason, suspensionEnd });
export const sendUserNotice = (id: string, message: string, type: string = 'adminNotice') => API.post(`/api/admin/users/${id}/notice`, { message, type });

// Product Management
export const fetchProducts = (params?: any) => API.get("/api/products", { params });
export const fetchProductById = (id: string) => API.get(`/api/products/${id}`);
export const createProduct = (data: any) => API.post("/api/products", data);
export const updateProduct = (id: string, data: any) => API.put(`/api/products/${id}`, data);
export const deleteProduct = (id: string) => API.delete(`/api/products/${id}`);

// Order Management
export const fetchAllOrders = () => API.get("/api/order/admin/all");
export const fetchOrderById = (id: string) => API.get(`/api/order/${id}`);
export const updateOrderAdminStatus = (id: string, status: string) => API.put(`/api/order/${id}/status`, { status });

export default API;

// Review Management
export const fetchAllReviews = () => API.get("/api/reviews/admin/all");
export const deleteReview = (id: string) => API.delete(`/api/reviews/${id}`);
