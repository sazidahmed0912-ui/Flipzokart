import { User } from "../types";

const API_BASE_URL = "http://localhost:5000/api/auth";

const authService = {
  // =========================
  // ✅ REGISTER
  // =========================
  async register(data: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }): Promise<User> {
    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Registration failed");
    }

    // 🔐 JWT token save
    if (result.token) {
      localStorage.setItem("token", result.token);
    }

    return result.user;
  },

  // =========================
  // ✅ LOGIN
  // =========================
  async login(credentials: any) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Login failed");
  }

  localStorage.setItem("token", result.token);
  return result.user;
},

  // =========================
  // ✅ LOGOUT
  // =========================
  async logout(): Promise<void> {
    // Remove token from localStorage first
    localStorage.removeItem("token");

    try {
      const response = await fetch(`/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      
      // Even if backend call fails, token is already removed from localStorage
      if (!result.success) {
        console.warn("Backend logout failed, but local token was removed:", result.message);
      }
    } catch (error) {
      console.warn("Backend logout failed, but local token was removed:", error);
    }
  },

  // =========================
  // ✅ GET CURRENT USER
  // =========================
  async getMe(): Promise<User | null> {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      return result.success ? result.user : null;
    } catch {
      return null;
    }
  },

  // =========================
  // ✅ FORGOT PASSWORD
  // =========================
  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to send reset link");
    }
  },

  // =========================
  // ✅ RESET PASSWORD
  // =========================
  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch(`/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Reset failed");
    }
  },
};

export { authService };
export default authService;