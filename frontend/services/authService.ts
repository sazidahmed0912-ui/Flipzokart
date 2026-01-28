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

  // =========================
  // ✅ UPDATE PROFILE
  // =========================
  async updateProfile(data: { name?: string; phone?: string }): Promise<User> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Profile update failed");
    }
    return result.user;
  },

  // =========================
  // ✅ CHANGE PASSWORD
  // =========================
  async changePassword(data: any): Promise<void> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/user/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Password update failed");
    }
  },

  // =========================
  // ✅ GET ACTIVITIES
  // =========================
  async getActivities(): Promise<any[]> {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return result.success ? result.activities : [];
    } catch {
      return [];
    }
  },

  // =========================
  // ✅ GET DEVICE HISTORY
  // =========================
  async getDeviceHistory(): Promise<any[]> {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return result.success ? result.devices : [];
    } catch {
      return [];
    }
  },
  // =========================
  // ✅ SEND EMAIL OTP
  // =========================
  async sendEmailOtp(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-email-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to send OTP");
  },

  // =========================
  // ✅ VERIFY EMAIL OTP
  // =========================
  async verifyEmailOtp(email: string, otp: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Invalid OTP");

    if (result.token) localStorage.setItem("token", result.token);
    return result.user;
  },
};

export default authService;