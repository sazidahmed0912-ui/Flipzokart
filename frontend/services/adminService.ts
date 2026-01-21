import API from "./api";

export const getDashboardStats = () => API.get("/admin/dashboard-stats");

export const createProduct = (data: any) => API.post("/api/v1/products", data);
export const updateProduct = (id: string, data: any) => API.put(`/api/v1/products/${id}`, data);
export const deleteProduct = (id: string) => API.delete(`/api/v1/products/${id}`);

export default API;
