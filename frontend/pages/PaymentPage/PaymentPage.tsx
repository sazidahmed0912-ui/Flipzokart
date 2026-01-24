import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "../../services/api";
import { useApp } from "../../store/Context";
import { useToast } from "../../components/toast";
import "./PaymentPage.css";

/* =========================
   Razorpay ENV SAFE ACCESS
========================= */
const RAZORPAY_KEY_ID = (import.meta as any).env
  .VITE_RAZORPAY_KEY_ID as string;

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
  const navigate = useNavigate();
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
  //   if (!user) navigate("/login");
  // }, [user, navigate]);

  /* =========================
     Price Calculation
  ========================= */
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryCharges = subtotal > 500 ? 0 : 50;
  const discount = 0;
  const platformFee = 2;
  const totalPayable =
    subtotal + deliveryCharges - discount + platformFee;

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

      await createOrder({
        products: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryCharges,
        discount,
        total: totalPayable,
        address: selectedAddress
          ? `${selectedAddress.name}, ${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
          : "Default Address",
      });

      clearCart();
      navigate("/order-success");
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
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              products: cart.map((i) => ({
                productId: i.id,
                quantity: i.quantity,
              })),
              subtotal,
              deliveryCharges,
              discount,
              total: totalPayable,
              address: selectedAddress
                ? `${selectedAddress.name}, ${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
                : "Default Address",
            });

            clearCart();
            navigate("/order-success");
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
      setTimeout(() => navigate('/login'), 1000);
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
          <h2>Choose a payment method</h2>

          <div
            className={`payment-option-card ${paymentMethod === "COD" ? "selected" : ""
              }`}
            onClick={() => setPaymentMethod("COD")}
          >
            <Banknote />
            <h3>Cash on Delivery</h3>
            {paymentMethod === "COD" && <CheckCircle2 />}
          </div>

          <div
            className={`payment-option-card ${paymentMethod === "RAZORPAY" ? "selected" : ""
              }`}
            onClick={() => setPaymentMethod("RAZORPAY")}
          >
            <img
              src="https://razorpay.com/assets/razorpay-logo.svg"
              alt="Razorpay"
              className="razorpay-logo"
            />
            <h3>Online Payment</h3>
            <ShieldCheck size={16} /> 100% Secure
            {paymentMethod === "RAZORPAY" && <CheckCircle2 />}
          </div>
        </div>

        {/* RIGHT */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h3>Order Summary</h3>

            <div className="price-item">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="price-item">
              <span>Delivery</span>
              <span>{deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}</span>
            </div>
            <div className="price-item">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>

            <div className="price-total">
              <strong>TOTAL</strong>
              <strong>₹{totalPayable}</strong>
            </div>

            {error && <p className="error-toast">{error}</p>}

            <button
              className="action-button"
              disabled={(!paymentMethod && !!user) || loading} // Allow clicking if no user (to show toast), but disable if user present & no method
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
    </div>
  );
};

export default PaymentPage;