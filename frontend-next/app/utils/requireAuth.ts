import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const requireAuth = (router: AppRouterInstance) => {
    if (typeof window === "undefined") return true;

    const token = localStorage.getItem("token");

    if (!token) {
        window.dispatchEvent(
            new CustomEvent("show-toast", {
                detail: {
                    type: "error",
                    message: "Please login or create an account to continue",
                },
            })
        );

        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return false;
    }

    return true;
};
