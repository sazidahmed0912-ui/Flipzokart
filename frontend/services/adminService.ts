import axios from "axios";

const API = axios.create({
  baseURL: "/api/admin",
});

export const getDashboardStats = () => API.get("/dashboard-stats");

export default API;
