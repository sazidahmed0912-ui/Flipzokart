"use client";

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, CreditCard, Banknote, MapPin, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { Order } from '@/app/types';

export const CheckoutPage: React.FC = () => {
  const { cart, user, clearCart, placeOrder } = useApp();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('COD');
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: '',
    city: '',
    zipCode: '',
    phone: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal > 1000 ? subtotal : subtotal + 99;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      items: [...cart],
      total,
      status: paymentMethod === 'Razorpay' ? 'Paid' : 'Pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'Razorpay' ? 'PAID' : 'PENDING',
      createdAt: new Date().toISOString(),
      address: {
        fullName: address.fullName,
        street: address.street,
        city: address.city,
        zipCode: address.zipCode
      }
    };

    placeOrder(newOrder);
    clearCart();

    // Show success message
    const successMessage = paymentMethod === 'Razorpay'
      ? `🎉 Order Placed Successfully!\n\nOrder ID: ${newOrder.id}\nPayment: Paid via Razorpay\nTotal: ₹${total.toLocaleString('en-IN')}\n\nYou will be redirected to your orders page.`
      : `🎉 Order Placed Successfully!\n\nOrder ID: ${newOrder.id}\nPayment: Cash on Delivery\nTotal: ₹${total.toLocaleString('en-IN')}\n\nPlease keep cash ready for payment on delivery.\nYou will be redirected to your orders page.`;

    alert(successMessage);
    router.push('/orders');
  };

  if (cart.length === 0) {
    router.push('/shop');
    return null;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h3 className="text-xl font-bold">Shipping Address</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-lightGray px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary outline-none"
                  value={address.fullName}
                  onChange={e => setAddress({ ...address, fullName: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
                <input
                  required
                  type="text"
                  className="w-full bg-lightGray px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary outline-none"
                  value={address.street}
                  onChange={e => setAddress({ ...address, street: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                <input
                  required
                  type="text"
                  className="w-full bg-lightGray px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary outline-none"
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Zip Code</label>
                <input
                  required
                  type="text"
                  className="w-full bg-lightGray px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary outline-none"
                  value={address.zipCode}
                  onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <h3 className="text-xl font-bold">Payment Method</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'Razorpay' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                    <CreditCard />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Online Payment</p>
                    <p className="text-xs text-gray-500">Razorpay, UPI, Cards</p>
                  </div>
                </div>
                {paymentMethod === 'Razorpay' && <CheckCircle2 className="text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                    <Banknote />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when you receive</p>
                  </div>
                </div>
                {paymentMethod === 'COD' && <CheckCircle2 className="text-primary" />}
              </button>
            </div>
          </section>
        </div>

        {/* Order Sidebar */}
        <aside className="space-y-6">
          <div className="bg-dark text-white p-8 rounded-[2rem] sticky top-32">
            <h3 className="text-xl font-bold mb-6">Your Order</h3>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-4 text-sm">
                  <span className="text-gray-400 line-clamp-1 flex-grow">{item.name} <span className="text-white">x{item.quantity}</span></span>
                  <span className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{subtotal > 1000 ? 'FREE' : '₹99'}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              Place Order
            </button>

            <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-gray-400">
              <ShieldCheck size={14} /> 256-bit SSL Secure Checkout
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};
