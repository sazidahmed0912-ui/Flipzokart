import API from "./api";

export const getDashboardStats = () => API.get("/admin/dashboard-stats");

export default API;
