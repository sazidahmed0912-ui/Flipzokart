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
import { createOrder, createRazorpayOrder, verifyPayment } from "../../services/api";
import { useApp } from "../../store/Context";
import "./PaymentPage.css";

// This is a placeholder for the actual Razorpay SDK script loading
const useRazorpay = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
            setIsLoaded(true);
        };
        script.onerror = () => {
            setIsLoaded(false);
            console.error("Razorpay SDK could not be loaded.");
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return isLoaded;
};


const PaymentPage: React.FC = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, cart, clearCart } = useApp();
  const isRazorpayLoaded = useRazorpay();

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);


  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharges = subtotal > 500 ? 0 : 50;
  const discount = 0; // Placeholder
  const platformFee = 2;
  const totalPayable = subtotal + deliveryCharges - discount + platformFee;


  const handlePlaceOrderCOD = async () => {
    if (!user) {
      setError("Please login to place an order.");
      navigate('/login');
      return;
    }
    
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const deliveryCharges = 0; // Calculate or get from context
      const discount = 0; // Calculate or get from context
      const total = subtotal + deliveryCharges - discount;
      
      console.log('Placing order with data:', {
        products: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        subtotal,
        deliveryCharges,
        discount,
        total,
        address: "123 E-commerce Lane, E-commerce City",
        user: user.id
      });
      
      const orderData = {
        products: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        subtotal,
        deliveryCharges,
        discount,
        total,
        address: "123 E-commerce Lane, E-commerce City", // This should come from selected address
      };
      await createOrder(orderData);
      clearCart();
      navigate("/order-success");
    } catch (err: any) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentRazorpay = async () => {
    if (!user) {
      setNotification("Redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!isRazorpayLoaded) {
      setError("Could not initiate payment. Please check your connection or try again.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
        const { data: razorpayOrder } = await createRazorpayOrder({ amount: totalPayable });

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variable
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "E-commerce Platform",
            description: "Order Payment",
            order_id: razorpayOrder.id,
            handler: async (response: any) => {
                try {
                    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    const deliveryCharges = 0; // Calculate or get from context
                    const discount = 0; // Calculate or get from context
                    const total = subtotal + deliveryCharges - discount;
                    
                    const verificationData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        products: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
                        subtotal,
                        deliveryCharges,
                        discount,
                        total,
                        address: "123 E-commerce Lane, E-commerce City", // This should come from selected address
                    };
                    await verifyPayment(verificationData);
                    clearCart();
                    navigate("/order-success");
                } catch (verifyError) {
                    setError("Payment verification failed. Please contact support.");
                    console.error(verifyError);
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: "9999999999" // Placeholder
            },
            theme: {
                color: "#ff9f00"
            }
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.open();

    } catch (err) {
        setError("Failed to create Razorpay order. Please try again.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === "COD") {
      handlePlaceOrderCOD();
    } else if (paymentMethod === "RAZORPAY") {
      handlePaymentRazorpay();
    }
  };


  return (
    <div className="payment-page-container">
      {notification && <div className="notification-popup">{notification}</div>}
      <header className="payment-header">
        <div className="header-top">
          <div className="logo"></div>
          <div className="secure-checkout-badge">
            <Lock size={16} />
            <span>Secure Checkout</span>
          </div>
        </div>
        <div className="checkout-steps">
          <span>Cart</span> <ChevronRight size={16} />
          <span>Address</span> <ChevronRight size={16} />
          <span className="active">Payment</span> <ChevronRight size={16} />
          <span>Confirmation</span>
        </div>
      </header>

      <main className="payment-main">
        <div className="payment-options-section">
          <h2>Choose a payment method</h2>

          {/* COD Option */}
          <div
            className={`payment-option-card ${paymentMethod === "COD" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("COD")}
          >
            <div className="payment-option-title">
              <Banknote size={24} />
              <h3>Cash on Delivery (COD)</h3>
              {paymentMethod === 'COD' && <CheckCircle2 className="check-icon" />}
            </div>
            <p>Pay when your order is delivered.</p>
            <small>Available for selected PIN codes</small>
          </div>

          {/* Razorpay Option */}
          <div
            className={`payment-option-card ${paymentMethod === "RAZORPAY" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("RAZORPAY")}
          >
             <div className="payment-option-title">
                <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="razorpay-logo" />
                <h3>Online Payment</h3>
                {paymentMethod === 'RAZORPAY' && <CheckCircle2 className="check-icon" />}
            </div>
            <ul>
              <li>UPI (Google Pay, PhonePe, Paytm)</li>
              <li>Debit & Credit Cards</li>
              <li>Net Banking</li>
            </ul>
            <div className="secure-badge">
              <ShieldCheck size={16} />
              <span>100% Secure Payments</span>
            </div>
          </div>
        </div>

        <div className="order-summary-section">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="product-list">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div className="product-item" key={item.id}>
                    <img src={item.image} alt={item.name} className="product-thumbnail" />
                    <div className="product-details">
                      <p className="product-name">{item.name}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <p className="product-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))
              ) : (
                <p>Your cart is empty.</p>
              )}
            </div>

            <div className="price-breakup">
              <h4>Price Details</h4>
              <div className="price-item"><span>Subtotal</span> <span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="price-item"><span>Delivery Charges</span> <span>{deliveryCharges > 0 ? `₹${deliveryCharges}` : <span className="free">FREE</span>}</span></div>
              <div className="price-item"><span>Discount</span> <span>- ₹{discount.toLocaleString('en-IN')}</span></div>
              <div className="price-item"><span>Platform Fee</span> <span>₹{platformFee.toLocaleString('en-IN')}</span></div>
              <div className="price-total">
                <span>TOTAL PAYABLE</span>
                <span>₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {error && <p className="error-toast">{error}</p>}

            <button
              className="action-button desktop-only" /* Add desktop-only class */
              onClick={handleSubmit}
              disabled={!paymentMethod || isLoading}
            >
              {isLoading ? (
                <Loader2 className="spinner" />
              ) : paymentMethod === "COD" ? (
                "PLACE ORDER"
              ) : (
                `PAY ₹${totalPayable.toLocaleString('en-IN')} SECURELY`
              )}
               {paymentMethod === 'RAZORPAY' && <Lock size={16} style={{ marginLeft: '8px' }} />}
            </button>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Footer for Action Button */}
      <div className="sticky-mobile-footer">
        {error && <p className="error-toast">{error}</p>} {/* Error can appear here too */}
        <button
          className="action-button"
          onClick={handleSubmit}
          disabled={!paymentMethod || isLoading}
        >
          {isLoading ? (
            <Loader2 className="spinner" />
          ) : paymentMethod === "COD" ? (
            "PLACE ORDER"
          ) : (
            `PAY ₹${totalPayable.toLocaleString('en-IN')} SECURELY`
          )}
          {paymentMethod === 'RAZORPAY' && <Lock size={16} style={{ marginLeft: '8px' }} />}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;