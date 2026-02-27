"use client";
import React, { useState, useEffect } from "react";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Banknote,
  ChevronRight,
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
} from '@/app/services/api';
import { useApp } from '@/app/store/Context';
import { toast } from 'react-toastify';
import axios from 'axios';
import './PaymentPage.css';
/* =========================
   Razorpay ENV SAFE ACCESS
========================= */
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string;

/* =========================
   Razorpay Script Loader
========================= */
const useRazorpay = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setLoaded(true);
    script.onerror = () => setLoaded(false);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return loaded;
};

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); const searchParams = useSearchParams();
  const { user, cart, clearCart, selectedAddress, removeProductFromCart } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "RAZORPAY" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const razorpayLoaded = useRazorpay();

  /* =========================
     Auth Guard Removed for Guest Access
  ========================= */
  // useEffect(() => {
  //   if (!user) router.push("/login");
  // }, [user, navigate]);

  /* =========================
     ISOLATED BUY NOW LOGIC
  ========================= */
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('buyNowItem');
    if (stored) {
      try {
        setBuyNowItem(JSON.parse(stored));
      } catch (e) {
        console.error("Invalid buyNowItem", e);
        localStorage.removeItem('buyNowItem');
      }
    }
  }, []);

  /* =========================
     COUPON SYNCHRONIZATION
  ========================= */
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    const storedCoupon = localStorage.getItem('appliedCoupon');
    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
      } catch (e) {
        console.error("Invalid appliedCoupon", e);
        localStorage.removeItem('appliedCoupon');
      }
    }
  }, []);

  // Determine ACTIVE CART for this session
  // If buyNowItem exists, WE IGNORE THE GLOBAL CART
  const activeCart = buyNowItem ? [buyNowItem] : cart;

  /* =========================
     Server-Authoritative Price Summary
     âŒ No local GST / discount / shipping calculation.
     âœ… All values come from /api/cart/summary.
  ========================= */
  const [serverSummary, setServerSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!activeCart || activeCart.length === 0) return;

    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/order/preview`,
          {
            cartItems: activeCart.map(i => ({ productId: i.productId || i.id, quantity: i.quantity })),
            couponCode: appliedCoupon?.code || undefined,
            paymentMethod: paymentMethod || 'COD'
          },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setServerSummary(data);
      } catch (err) {
        console.warn('[PaymentPage] /api/order/preview failed', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [activeCart, appliedCoupon, paymentMethod]);

  // âœ… All display values from server â€” canonical finalPriceEngine output
  const itemsPrice = serverSummary?.subtotal ?? 0;
  const mrp = serverSummary?.mrp ?? itemsPrice;
  const discount = serverSummary?.couponDiscount ?? (appliedCoupon?.discount || 0);
  const deliveryCharges = serverSummary?.deliveryCharge ?? 0;
  const platformFee = serverSummary?.platformFee ?? 3;
  const cgst = serverSummary?.cgst ?? 0;
  const sgst = serverSummary?.sgst ?? 0;
  const totalGST = serverSummary?.totalGST ?? 0;
  const hasGST = totalGST > 0;
  const tax = totalGST;
  const couponDiscount = serverSummary?.couponDiscount ?? (appliedCoupon?.discount || 0);
  const totalPayable = serverSummary?.grandTotal ?? 0;

  // ðŸ›¡ï¸ Payment Availability Logic
  // If ANY item in cart has codAvailable === false, then COD is disabled for entire order.
  const isCodAllowed = activeCart.every(item => item.codAvailable !== false);
  const isPrepaidAllowed = activeCart.every(item => item.prepaidAvailable !== false);

  /* =========================
     ERROR HANDLING HELPER
  ========================= */
  const handlePaymentError = (err: any) => {
    const errorMsg = err.response?.data?.message || "Order failed";
    setError(errorMsg);

    // Auto-Remove Deleted Products
    if (errorMsg.includes("not found (likely deleted)")) {
      const match = errorMsg.match(/ID\s([a-f0-9]+)/i);
      if (match && match[1]) {
        const invalidId = match[1];

        // If in Buy Now mode, just clear it and redirect
        if (buyNowItem && buyNowItem.id === invalidId) {
          localStorage.removeItem('buyNowItem');
          alert(`Item removed: ${errorMsg}`);
          router.push('/shop');
          return;
        }

        const itemToRemove = cart.find(i => i.id === invalidId);
        if (itemToRemove) {
          alert(`Item removed: ${errorMsg}`);
          removeProductFromCart(itemToRemove.id);
        }
      }
    }
  };

  /* =========================
     COD ORDER
  ========================= */
  const placeCODOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedAddress || (!selectedAddress.id && !selectedAddress._id)) {
        toast.error("Delivery address missing. Please select one.");
        return;
      }

      // ðŸ”’ ULTRA LOCK: Send frozen previewData (hash-signed) â€” backend verifies hash, no recalculation
      const { data } = await createOrder({
        previewData: serverSummary, // Hash-signed frozen price summary
        addressId: selectedAddress.id || selectedAddress._id,
        paymentMethod: 'COD',
        couponCode: appliedCoupon?.code,
      });

      // CLEANUP based on MODE
      if (buyNowItem) {
        localStorage.removeItem('buyNowItem');
      } else {
        clearCart();
      }
      localStorage.removeItem('appliedCoupon');

      // Use the returned order ID for the success page
      router.push(`/order-success?orderId=${data.order.id}`);
    } catch (err: any) {
      handlePaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RAZORPAY PAYMENT
  ========================= */
  const payWithRazorpay = async () => {
    if (!razorpayLoaded) {
      setError("Razorpay SDK not loaded");
      return;
    }

    if (!selectedAddress || (!selectedAddress.id && !selectedAddress._id)) {
      toast.error("Delivery address missing. Please select one.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: order } = await createRazorpayOrder({
        amount: totalPayable,
      });

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Fzokart",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response: any) => {
          try {
              // ULTRA LOCK: Send frozen previewData (hash-signed)
              const { data } = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                previewData: serverSummary,
                addressId: selectedAddress?.id || selectedAddress?._id,
                paymentMethod: "RAZORPAY",
                couponCode: appliedCoupon?.code,
              });


            // CLEANUP based on MODE
            if (buyNowItem) {
              localStorage.removeItem('buyNowItem');
            } else {
              clearCart();
            }
            localStorage.removeItem('appliedCoupon');

            router.push(`/order-success?orderId=${data.order.id}`);
          } catch (err) {
            handlePaymentError(err);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#ff9f00" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setError("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SUBMIT HANDLER
  ========================= */
  /* =========================
     SUBMIT HANDLER
  ========================= */
  const handleSubmit = () => {
    // 1ï¸âƒ£ GUEST HANDLING: Redirect to Signup with Pending Order
    if (!user) {
      const orderPayload = {
        products: activeCart.map((i) => ({
          productId: i.id,
          variantId: i.variantId,
          productName: i.productName || i.name,
          color: i.color || i.selectedVariants?.Color || i.selectedVariants?.color || i.selectedVariants?.Colour,
          size: i.size || i.selectedVariants?.Size || i.selectedVariants?.size,
          image: i.image || i.thumbnail || i.images?.[0] || '',
          price: i.price,
          quantity: i.quantity,
          selectedVariants: i.selectedVariants
        })),
        subtotal: itemsPrice,
        itemsPrice,
        deliveryCharges,
        discount,
        platformFee,
        tax,
        mrp,
        total: totalPayable,
        finalAmount: totalPayable,
        addressId: selectedAddress?.id || selectedAddress?._id,
        address: selectedAddress,
        paymentMethod: paymentMethod, // 'COD' or 'RAZORPAY' - logic will be handled after signup
        couponCode: appliedCoupon?.code,
      };

      localStorage.setItem("pendingOrder", JSON.stringify(orderPayload));

      // ðŸŸ¢ STORE CHECKOUT INTENT
      if (paymentMethod) {
        localStorage.setItem("checkout_intent", JSON.stringify({
          fromCheckout: true,
          paymentMethod: paymentMethod // 'COD' or 'RAZORPAY'
        }));
      }

      // ðŸ›‘ STORE BUY NOW ITEM FOR RESTORE
      // If we are in Buy Now Mode, the buyNowItem is already in LS.
      // But we should ensure it stays there. It persists by default.

      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { type: 'info', message: 'âš ï¸ Please signup/login to place your order', persist: true }
      }));
      // Redirect to signup which will handle the intent
      setTimeout(() => router.push('/signup?redirect=checkout'), 1000);
      return;
    }

    if (!paymentMethod) return;
    paymentMethod === "COD" ? placeCODOrder() : payWithRazorpay();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="payment-page-container">
      <header className="payment-header">
        <div className="checkout-steps">
          {buyNowItem ? (
            <span className="text-orange-600 font-bold">âš¡ Buy Now Mode</span>
          ) : (
            <>Cart <ChevronRight size={14} /></>
          )}
          {buyNowItem ? <ChevronRight size={14} /> : null} Address <ChevronRight size={14} />
          <span className="active">Payment</span>
          <ChevronRight size={14} /> Confirmation
        </div>
      </header>

      <main className="payment-main">
        {/* LEFT */}
        <div className="payment-options-section">
          <div>
            <h2>Choose Payment Mode</h2>
            <p className="sub-heading">Select a payment method to complete this order.</p>
          </div>

          {/* COD OPTION */}
          {isCodAllowed ? (
            <div
              className={`payment-option-card ${paymentMethod === "COD" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("COD")}
            >
              <div className="icon-wrapper cod-icon-bg">
                <Banknote size={28} />
              </div>
              <div className="option-content">
                <h3>Cash on Delivery</h3>
                <p className="option-description">Pay in cash when your order arrives</p>
              </div>
              {paymentMethod === "COD" ? <CheckCircle2 className="check-circle" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>}
            </div>
          ) : (
            <div className="payment-option-card disabled opacity-50 cursor-not-allowed bg-gray-50 border-gray-100">
              <div className="icon-wrapper bg-gray-200 text-gray-400">
                <Banknote size={28} />
              </div>
              <div className="option-content">
                <h3 className="text-gray-400">Cash on Delivery Unavailable</h3>
                <p className="option-description text-gray-400 text-xs">Not available for one or more items in your cart.</p>
              </div>
            </div>
          )}

          {/* ONLINE PAYMENT OPTION */}
          {isPrepaidAllowed ? (
            <div
              className={`payment-option-card ${paymentMethod === "RAZORPAY" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("RAZORPAY")}
            >
              <div className="icon-wrapper online-icon-bg">
                <ShieldCheck size={28} />
              </div>
              <div className="option-content">
                <h3>Online Payment</h3>
                <p className="option-description">UPI, Cards, Wallets, NetBanking</p>
                <div className="secure-badge">
                  <Lock size={10} /> 100% Secure Transaction
                </div>
              </div>
              {paymentMethod === "RAZORPAY" ? <CheckCircle2 className="check-circle" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>}
            </div>
          ) : (
            <div className="payment-option-card disabled opacity-50 cursor-not-allowed bg-gray-50 border-gray-100">
              <div className="icon-wrapper bg-gray-200 text-gray-400">
                <ShieldCheck size={28} />
              </div>
              <div className="option-content">
                <h3 className="text-gray-400">Online Payment Unavailable</h3>
                <p className="option-description text-gray-400 text-xs">Not available for one or more items in your cart.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h3>Order Summary</h3>

            <div className="price-item">
              <span>Subtotal</span>
              <span>â‚¹{itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="price-item">
              <span>Delivery</span>
              <span>{deliveryCharges === 0 ? "FREE" : `â‚¹${deliveryCharges.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="price-item">
              <span>Platform Fee</span>
              <span>â‚¹{platformFee.toLocaleString('en-IN')}</span>
            </div>

            {/* ðŸ§¾ GST Invoice Breakdown */}
            {hasGST && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 space-y-1">
                <div className="price-item text-xs text-gray-500">
                  <span>CGST ({((cgst / (itemsPrice || 1)) * 100).toFixed(0)}%)</span>
                  <span>+ â‚¹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="price-item text-xs text-gray-500">
                  <span>SGST ({((sgst / (itemsPrice || 1)) * 100).toFixed(0)}%)</span>
                  <span>+ â‚¹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="price-item text-xs font-bold text-amber-700">
                  <span>Total GST</span>
                  <span>â‚¹{totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {appliedCoupon && (
              <div className="price-item text-green-600 font-bold">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>- â‚¹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="price-total">
              <strong>TOTAL</strong>
              <strong>â‚¹{totalPayable.toLocaleString('en-IN')}</strong>
            </div>

            {error && <p className="error-toast">{error}</p>}

            <button
              className="action-button"
              disabled={(!paymentMethod && !!user) || loading || !selectedAddress} // strict disable
              onClick={handleSubmit}
            >
              {loading ? (
                <Loader2 className="spinner" />
              ) : paymentMethod === "COD" ? (
                "PLACE ORDER"
              ) : (
                `PAY â‚¹${totalPayable} SECURELY`
              )}
            </button>
          </div>
        </div>
      </main>
      {/* Mobile Sticky Footer */}
      <div className="sticky-mobile-footer">
        <div className="mobile-total-info">
          <span className="text-xs text-gray-500 font-medium">Total Payable</span>
          <span className="text-lg font-bold text-[#212121]">â‚¹{totalPayable}</span>
        </div>
        <button
          className="action-button mobile-pay-btn"
          disabled={(!paymentMethod && !!user) || loading || !selectedAddress}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 className="spinner" />
          ) : paymentMethod === "COD" ? (
            "PLACE ORDER"
          ) : (
            `PAY â‚¹${totalPayable}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
