"use client";
import React, { useState } from 'react';

import { useRouter } from 'next/navigation';
import { Lock, Loader } from 'lucide-react';
import API from '@/app/services/api';
import { getSafeAddress, isAddressValid } from '@/app/utils/addressHelper';
import { useApp } from '@/app/store/Context';
import { useToast } from '@/app/components/toast';
import { Address } from '@/app/types';
import AddressCard from './components/AddressCard';
import AddressForm from './components/AddressForm';
import Modal from './components/Modal';
import './CheckoutPage.css';
import { calculateCartTotals } from '@/app/utils/priceHelper';
import { initiateCheckout } from '@/lib/fbPixel';

const CheckoutPage = () => {
    const { cart, selectedAddress: contextAddress, setSelectedAddress: setContextAddress, user } = useApp();
    const { addToast } = useToast();
    const router = useRouter();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(
        contextAddress ? (contextAddress._id || contextAddress.id || null) : null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaceOrderLoading, setIsPlaceOrderLoading] = useState(false);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);


    // Fetch addresses from backend on mount
    React.useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) {
                // Initialize empty addresses for guest
                setAddresses([]);
                setIsLoading(false);
                return;
            }
            try {
                const { data } = await API.get('/api/user/address');
                const userAddresses = data.addresses || [];
                // Map backend addresses to frontend Address type
                // Map backend addresses to frontend Address type using robust normalization
                const formatted: Address[] = userAddresses.map((a: any) => {
                    const safe = getSafeAddress(a);
                    return {
                        ...safe,
                        id: a._id || a.id || Date.now(), // Preserve ID
                        name: safe.fullName, // Legacy compatibility
                        country: 'India' // Required by Address type
                    } as Address;
                });
                setAddresses(formatted);

                if (!selectedAddressId && formatted.length > 0) {
                    const firstId = formatted[0].id;
                    setSelectedAddressId(firstId);
                    setContextAddress(formatted[0]);
                }
            } catch (error) {
                console.error("Failed to fetch addresses", error);
                addToast('error', "Failed to load addresses");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAddresses();
    }, [user]);

    // --- ISOLATED BUY NOW LOGIC ---
    const [buyNowItem, setBuyNowItem] = useState<any>(null);

    React.useEffect(() => {
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

    // --- COUPON SYNCHRONIZATION ---
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    React.useEffect(() => {
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

    // Determine what to show in Checkout
    // IF buyNowItem exists, ignore Cart.
    const checkoutItems = buyNowItem ? [buyNowItem] : cart;

    // Redirect if empty
    React.useEffect(() => {
        if (!isLoading && !buyNowItem && cart.length === 0) {
            // router.push('/shop'); // Optional: Redirect if nothing to checkout
        }
    }, [cart, buyNowItem, isLoading]);

    // Removed legacy calculateShippingCost to prevent price overrides. 
    // Pricing is now strictly handled by Unified Pricing Engine.

    const { subtotal, deliveryCharges: standardDelivery, platformFee, totalAmount } = calculateCartTotals(checkoutItems);

    // Track InitiateCheckout once when cart is loaded and has items
    React.useEffect(() => {
        if (checkoutItems.length > 0) {
            initiateCheckout({
                content_ids: checkoutItems.map((item: any) => item.productId),
                num_items: checkoutItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
                value: subtotal,
                currency: 'INR'
            });
        }
    }, [checkoutItems.length, subtotal]);

    // Use standard delivery as initial state
    const [deliveryCharges, setDeliveryCharges] = useState(standardDelivery);

    // Sync delivery charges when cart updates (e.g. loads from context)
    React.useEffect(() => {
        setDeliveryCharges(standardDelivery);
    }, [standardDelivery]);

    // Calculate free delivery nudge
    const FREE_DELIVERY_THRESHOLD = 499;
    const neededForFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;
    const isFreeDeliveryEligible = subtotal >= FREE_DELIVERY_THRESHOLD;

    // Recalculate total if delivery charges change dynamically
    let totalPayable = subtotal + deliveryCharges + platformFee;
    let couponDiscount = 0;
    if (appliedCoupon) {
        couponDiscount = appliedCoupon.discount || 0;
        totalPayable -= couponDiscount;
    }

    const handleSelectAddress = async (id: string | number) => {
        console.log(`[Checkout] Selecting Address: ${id}`);
        setSelectedAddressId(id);
        const selected = addresses.find(addr => addr.id === id);

        if (selected) {
            console.log(`[Checkout] Address Found: ${selected.pincode}`);
            setContextAddress(selected);
        } else {
            console.warn(`[Checkout] Address ${id} NOT found in local state`);
        }
    };

    const handleDeliverHere = () => {
        if (!selectedAddressId) {
            addToast('warning', 'Please select or add a delivery address first!');
            return;
        }

        const addressToSave = addresses.find(addr => addr.id === selectedAddressId);
        if (addressToSave) {
            setContextAddress(addressToSave);
            addToast('success', 'Address selected!');
        }
    };

    const handleAddNewAddressClick = () => {
        setAddressToEdit(null);
        setIsAddressFormOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        console.log("[Checkout] Edit Clicked for:", address);
        setAddressToEdit(address);
        setIsAddressFormOpen(true);
    };

    const handleDeleteAddress = async (id: string | number) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                // Determine if we are deleting by mongo _id (string) or local timestamp id (number - if any)
                // Backend expects _id string. If it's a number, it might be a guest address not supported yet.
                await API.delete(`/api/user/address/${id}`);
                setAddresses(prev => prev.filter(addr => addr.id !== id));
                addToast('success', "Address deleted");
                if (selectedAddressId === id) {
                    setSelectedAddressId(null);
                    setContextAddress(null);
                }
            } catch (e: any) {
                // If backend delete fails but we have a local ID, try to remove it anyway if it's not a mongo ID
                if (typeof id === 'number') {
                    setAddresses(prev => prev.filter(addr => addr.id !== id));
                    addToast('success', "Address removed");
                    if (selectedAddressId === id) setSelectedAddressId(null);
                } else {
                    console.error("Delete failed", e);
                    addToast('error', "Failed to delete address");
                }
            }
        }
    };

    const handleSaveAddress = async (address: Partial<Address>) => {
        console.log("[Checkout] Saving Address (Payload):", address);
        try {
            // GUEST HANDLING: If no user, handle locally
            if (!user) {
                const newAddress: Address = {
                    ...address,
                    id: Date.now(), // Generate local ID
                    _id: 'guest_' + Date.now(),
                    country: 'India',
                    isDefault: false
                } as Address;

                const safeAddress = getSafeAddress(newAddress);
                const finalAddress = {
                    ...safeAddress,
                    id: newAddress.id,
                    _id: newAddress._id,
                    country: 'India' // Explicitly add country again to satisfy TS if getSafeAddress strips it or returns Partial
                } as Address;

                setAddresses(prev => [...prev, finalAddress]);

                // Auto-select the new guest address
                setContextAddress(finalAddress);
                setSelectedAddressId(finalAddress.id!);

                addToast('success', "Address added (Guest)");
                setIsAddressFormOpen(false);
                setAddressToEdit(null);
                return;
            }

            if (addressToEdit) {
                // UPDATE existing address
                await API.put(`/api/user/address/${addressToEdit.id}`, address);
            } else {
                // CREATE new address
                await API.post('/api/user/address', address);
            }

            // Refresh list
            // Refresh list & Normalize
            const { data } = await API.get('/api/user/address');

            // 🛑 CRITICAL: Normalize data immediately using getSafeAddress
            console.log("[Checkout] Raw Address Data from Backend:", data.addresses);

            // This ensures 'pincode', 'street' etc are always present and not undefined
            const updatedAddresses: Address[] = (data.addresses || []).map((a: any) => {
                const safe = getSafeAddress(a);
                const final = {
                    ...safe,
                    id: a._id || a.id || Date.now(),
                    _id: a._id, // Keep _id for backend ops
                    country: 'India'
                } as Address;
                // Log if safe mapping missed something
                if (!final.pincode) console.warn("[Checkout] Address Normalized but Pincode MISSING:", final);
                return final;
            });
            console.log("[Checkout] Final Normalized Addresses:", updatedAddresses);

            setAddresses(updatedAddresses);
            addToast('success', addressToEdit ? "Address updated" : "Address added");
            setIsAddressFormOpen(false);
            setAddressToEdit(null);

            // STRICT RULE: DO NOT AUTO-SELECT or AUTO-CALC SIPPING
            // User must explicitly select "Deliver Here" or click the radio button
            // This satisfies "Delivery MUST NOT RUN ON: New address creation"
            console.log("[Checkout] Address Saved. Waiting for user selection.");
        } catch (e) {
            console.error(e);
            addToast('error', "Failed to save address");
        }
    };

    const handleCancel = () => {
        setIsAddressFormOpen(false);
        setAddressToEdit(null);
    };

    const handlePlaceOrder = () => {
        // Find the full address object from state
        const selectedAddress = addresses.find(a => a.id === selectedAddressId);

        // 1️⃣ STRICT VALIDATION GUARD
        if (!selectedAddress || !isAddressValid(selectedAddress)) {
            addToast('error', 'Please select delivery address');

            // 📂 Auto-Open Logic
            const addressFormElement = document.getElementById("address-section-container"); // We'll add this ID to wrapper

            // Scroll to section
            addressFormElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            // If no valid addresses exist, open the "Add New" form automatically
            if (addresses.length === 0) {
                setIsAddressFormOpen(true);
                setTimeout(() => {
                    // Try to focus on the first input inside the modal if possible
                    // Note: Modal content might not be ready instantly.
                    const firstInput = document.querySelector('[name="fullName"]') as HTMLElement;
                    firstInput?.focus();
                }, 400);
            }
            return;
        }

        setIsPlaceOrderLoading(true);
        setTimeout(() => {
            setIsPlaceOrderLoading(false);
            // Pass the calculated deliveryCharges to PaymentPage to ensure consistency
            router.push(`/payment?deliveryCharges=${deliveryCharges}`);
        }, 1000);
    };

    const renderPriceSummary = () => (
        <div className="price-summary-card">
            <h3>Price Summary</h3>
            <div className="price-summary-item">
                <span>Items price</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="price-summary-item">
                <span>Delivery charges</span>
                <span className={deliveryCharges === 0 ? "free" : ""}>
                    {isFreeDeliveryEligible ? 'FREE' : <span className="text-[10px] text-gray-500">Free (Prepaid) / ₹50 (COD)</span>}
                </span>
            </div>
            <div className="price-summary-item">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
            </div>
            {appliedCoupon && (
                <div className="price-summary-item text-green-600 font-bold">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
            )}
            <div className="price-summary-total">
                <span>Total payable</span>
                <span>₹{totalPayable.toLocaleString('en-IN')}</span>
            </div>
            <button
                className="place-order-btn desktop-only"
                disabled={isPlaceOrderLoading}
                onClick={handlePlaceOrder}
            >
                {isPlaceOrderLoading ? (
                    <>
                        <Loader size={16} className="loading-spinner" />
                        Processing...
                    </>
                ) : (
                    'CONTINUE'
                )}
            </button>
            <div className="security-badge">
                <Lock size={16} />
                <span>Safe & Secure Payments</span>
            </div>
        </div>
    );

    return (
        <div className="checkout-container space-y-0">
            <header className="checkout-header">
                <div className="logo"></div>
                <div className="checkout-steps">
                    {buyNowItem ? (
                        <span className="text-orange-600 font-bold">⚡ Buy Now Mode</span>
                    ) : (
                        <span>Cart</span>
                    )}
                    → <span className="active">Address</span> → <span>Payment</span> → <span>Confirmation</span>
                </div>
                {!isFreeDeliveryEligible && (
                    <div className="bg-blue-50 text-blue-800 text-xs px-4 py-2 text-center font-medium border-b border-blue-100 w-full absolute top-[60px] left-0 z-20">
                        Add <span className="font-bold">₹{neededForFreeDelivery}</span> more for <span className="font-bold text-[#2874F0]">FREE Delivery</span> on all orders!
                    </div>
                )}
                <div className="secure-checkout">
                    <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>
                    <span>Secure Checkout</span>
                </div>
            </header>
            <main className="checkout-main">
                {/* 
                   SINGLE DOM SOURCE OF TRUTH: 
                   Price Summary is FIRST in DOM order.
                   Mobile: Shows first (Column layout).
                   Desktop: Shows on right (Row-Reverse layout).
                */}
                <div className="summary-section">
                    {renderPriceSummary()}
                </div>

                <div className="address-section" id="address-section-container">
                    <h2>Select Delivery Address</h2>
                    <div className="address-list">
                        {isLoading && <div className="p-4">Loading addresses...</div>}
                        {!isLoading && addresses.map((addr) => (
                            <AddressCard
                                key={addr.id}
                                address={addr}
                                isSelected={selectedAddressId === addr.id}
                                onSelect={() => handleSelectAddress(addr.id)}
                                onDelete={() => handleDeleteAddress(addr.id)}
                                onEdit={() => handleEditAddress(addr)}
                                onDeliverHere={handleDeliverHere}
                                isLoading={isLoading && selectedAddressId === addr.id}
                            />
                        ))}
                    </div>
                    <div className="add-new-address-card">
                        <button className="add-address-btn" onClick={handleAddNewAddressClick}>+ Add a new address</button>
                    </div>

                    <Modal isOpen={isAddressFormOpen} onClose={handleCancel}>
                        <AddressForm
                            addressToEdit={addressToEdit}
                            onSave={handleSaveAddress}
                            onCancel={handleCancel}
                        />
                    </Modal>
                </div>

                <div className="place-order-sticky-mobile">
                    <button
                        className="place-order-btn"
                        disabled={isPlaceOrderLoading}
                        onClick={handlePlaceOrder}
                    >
                        {isPlaceOrderLoading ? (
                            <>
                                <Loader size={16} className="loading-spinner" />
                                Processing...
                            </>
                        ) : (
                            'CONTINUE'
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}

export default CheckoutPage;
