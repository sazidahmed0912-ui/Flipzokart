import API from "./api";

export const getDashboardStats = () => API.get("/admin/dashboard-stats");
export const fetchAllUsers = () => API.get("/admin/users");

export const createProduct = (data: any) => API.post("/api/products/add", data);
export const updateProduct = (id: string, data: any) => API.put(`/api/products/${id}`, data);
export const deleteProduct = (id: string) => API.delete(`/api/products/${id}`);

export default API;
