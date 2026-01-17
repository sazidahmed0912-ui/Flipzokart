import { User } from "../types";

// ✅ ONLY BACKEND BASE URL
const API_BASE_URL = (import.meta as any).env.VITE_API_URL as string;

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
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Registration failed");
    }

    if (result.token) {
      localStorage.setItem("token", result.token);
    }

    return result.user;
  },

  

  // =========================
  // ✅ LOGIN
  // =========================
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    localStorage.removeItem("token");

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
    } catch {
      // backend logout failure ignore
    }
  },

  // =========================
  // ✅ GET CURRENT USER
  // =========================
  async getMe(): Promise<User | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
    const response = await fetch(
      `${API_BASE_URL}/api/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to send reset link");
    }
  },

  // =========================
  // ✅ RESET PASSWORD
  // =========================
  async resetPassword(
    token: string,
    password: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/reset-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Reset failed");
    }
  },
};

export default authService;