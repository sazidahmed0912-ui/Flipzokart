// ✅ SELLER AUTH SERVICE — Completely separate from user authService
// Uses: /api/seller/auth/* (different route namespace)
// Stores: seller_token + seller_user in localStorage (NEVER "token" or "flipzokart_user")

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const SELLER_TOKEN_KEY = 'seller_token';
export const SELLER_USER_KEY = 'seller_user';

const sellerAuthService = {
    // =====================================================================
    // ✅ SEND OTP — calls /api/seller/auth/send-otp
    // =====================================================================
    async sendSellerOtp(email: string): Promise<void> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${API_BASE_URL}/api/seller/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to send OTP');
            }
        } catch (error: any) {
            if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
            throw error;
        }
    },

    // =====================================================================
    // ✅ VERIFY OTP — calls /api/seller/auth/verify-otp
    //    Returns seller data and stores seller_token (NEVER overwrites "token")
    // =====================================================================
    async verifySellerOtp(email: string, otp: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/api/seller/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Invalid OTP');
        }

        // ✅ Store ONLY in seller-specific keys — main website "token" is NEVER touched
        if (result.seller_token) {
            localStorage.setItem(SELLER_TOKEN_KEY, result.seller_token);
        }
        if (result.seller) {
            localStorage.setItem(SELLER_USER_KEY, JSON.stringify(result.seller));
        }

        return result.seller;
    },

    // =====================================================================
    // ✅ LOGOUT — ONLY clears seller_token and seller_user
    //    Main website token/session is completely untouched
    // =====================================================================
    sellerLogout(): void {
        localStorage.removeItem(SELLER_TOKEN_KEY);
        localStorage.removeItem(SELLER_USER_KEY);
    },

    // =====================================================================
    // ✅ GET SELLER TOKEN — reads seller_token (never touches "token")
    // =====================================================================
    getSellerToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(SELLER_TOKEN_KEY);
    },

    // =====================================================================
    // ✅ GET SELLER USER — reads seller_user
    // =====================================================================
    getSellerUser(): any | null {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem(SELLER_USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    // =====================================================================
    // ✅ IS SELLER LOGGED IN
    // =====================================================================
    isSellerLoggedIn(): boolean {
        return !!this.getSellerToken();
    },
};

export default sellerAuthService;
