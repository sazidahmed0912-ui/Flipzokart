import API from "./api";

// Simple, new route integration for STEP 2/3 compatibility
// Calls /api/apply-coupon with { code, cartTotal }
export const applyCouponSimple = async (code: string, cartTotal: number) => {
  const payload = {
    code,
    cartTotal,
  };
  const res = await API.post("/api/apply-coupon", payload);
  return res.data;
};

export default { applyCouponSimple };
