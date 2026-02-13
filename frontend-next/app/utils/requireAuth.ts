import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const requireAuthRedirectToSignup = (router: AppRouterInstance) => {
    if (typeof window === "undefined") return true;

    const token = localStorage.getItem("token");

    if (!token) {
        window.dispatchEvent(
            new CustomEvent("show-toast", {
                detail: {
                    type: "error",
                    message: "⚠️ Please signup to continue shopping",
                },
            })
        );

        // Redirect to SIGNUP instead of login
        router.push(`/signup?redirect=${encodeURIComponent(window.location.pathname)}`);
        return false;
    }

    return true;
};
