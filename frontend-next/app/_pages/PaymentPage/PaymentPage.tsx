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
import { useToast } from '@/app/components/toast';
import { calculateCartTotals } from '@/app/utils/priceHelper';
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
  const { addToast } = useToast();

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
     Price Calculation
  ========================= */
  // Use delivery charges passed from checkout if available
  const deliveryParam = searchParams.get('deliveryCharges');
  const passedDeliveryCharges = deliveryParam ? parseInt(deliveryParam, 10) : undefined;

  const {
    subtotal: itemsPrice, // Alias subtotal to itemsPrice from helper
    originalPrice: mrp,
    deliveryCharges,
    discount,
    platformFee,
    tax,
    totalAmount: totalPayable
  } = calculateCartTotals(cart, passedDeliveryCharges);

  /* =========================
     ERROR HANDLING HELPER
  ========================= */
  const handlePaymentError = (err: any) => {
    const errorMsg = err.response?.data?.message || "Order failed";
    setError(errorMsg);

    // Auto-Remove Deleted Products
    if (errorMsg.includes("not found (likely deleted)")) {
      // Extract ID from message: "Product with ID <id> ..."
      const match = errorMsg.match(/ID\s([a-f0-9]+)/i);
      if (match && match[1]) {
        const invalidId = match[1];
        // Find the item in cart to get getCartItemKey if needed, or just try removing by ID
        // The context's removeFromCart expects cartItemKey. 
        // Since we don't have the variant string here easily, we might need to find the item first.
        const itemToRemove = cart.find(i => i.id === invalidId);
        if (itemToRemove) {
          // We need to reconstruct the key or if simple ID works
          // Context uses keys. Let's try to remove all variants of this product ID to be safe
          // OR just alert user. But auto-removal is better.
          // For now, let's just use the ID if no variants, or filter cart ourselves.
          // Actually, clearCart might be too aggressive.
          // Let's trust the error message is clear enough, but adding a specific Toast would be nice.
          alert(`Item removed: ${errorMsg}`);
          // Let's rely on the user reading the message for now, OR try to filter:
          removeProductFromCart(itemToRemove.id); // Try ID directly (if getCartItemKey handles it or if it matches)
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
        addToast('error', "Delivery address missing. Please select one.");
        return;
      }

      const { data } = await createOrder({
        products: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          selectedVariants: i.selectedVariants
        })),
        subtotal: itemsPrice, // Use itemsPrice as subtotal for backend compatibility if needed, or send both
        itemsPrice,
        deliveryCharges,
        discount,
        platformFee,
        tax,
        mrp,
        total: totalPayable,
        finalAmount: totalPayable,
        addressId: selectedAddress.id || selectedAddress._id,
      });

      clearCart();
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
      addToast('error', "Delivery address missing. Please select one.");
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
            const { data } = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              products: cart.map((i) => ({
                productId: i.id,
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
            });

            clearCart();
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
  const handleSubmit = () => {
    if (!user) {
      addToast('warning', '⚠️ Redirecting to Login page...');
      setTimeout(() => router.push('/login'), 1000);
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
          Cart <ChevronRight size={14} />
          Address <ChevronRight size={14} />
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
        </div>

        {/* RIGHT */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h3>Order Summary</h3>

            <div className="price-item">
              <span>Subtotal</span>
              <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="price-item">
              <span>Delivery</span>
              <span>{deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="price-item">
              <span>Platform Fee</span>
              <span>₹{platformFee.toLocaleString('en-IN')}</span>
            </div>

            <div className="price-total">
              <strong>TOTAL</strong>
              <strong>₹{totalPayable.toLocaleString('en-IN')}</strong>
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
                `PAY ₹${totalPayable} SECURELY`
              )}
            </button>
          </div>
        </div>
      </main>
      {/* Mobile Sticky Footer */}
      <div className="sticky-mobile-footer">
        <div className="mobile-total-info">
          <span className="text-xs text-gray-500 font-medium">Total Payable</span>
          <span className="text-lg font-bold text-[#212121]">₹{totalPayable}</span>
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
            `PAY ₹${totalPayable}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;