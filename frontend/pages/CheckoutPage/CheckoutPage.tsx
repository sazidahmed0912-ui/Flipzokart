import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader } from 'lucide-react';
import API, { calculateShipping } from '../../services/api';
import { getSafeAddress } from '../../utils/addressHelper';
import { useApp } from '../../store/Context';
import { useToast } from '../../components/toast';
import { Address } from '../../types';
import AddressCard from './components/AddressCard';
import AddressForm from './components/AddressForm';
import Modal from './components/Modal';
import './components/Modal.css';
import './CheckoutPage.css';
import { calculateCartTotals } from '../../utils/priceHelper';

const CheckoutPage = () => {
    const { cart, selectedAddress: contextAddress, setSelectedAddress: setContextAddress, user } = useApp();
    const { addToast } = useToast();
    const navigate = useNavigate();

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

                // If no selected address but we have addresses, select the first one
                if (!selectedAddressId && formatted.length > 0) {
                    const firstId = formatted[0].id;
                    setSelectedAddressId(firstId);
                    // We need to call handleSelectAddress but it depends on state. 
                    // Let's set context directly here or effectively select it.
                    setContextAddress(formatted[0]);

                    if (formatted[0].pincode) {
                        calculateShippingCost(formatted[0].pincode);
                    }
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

    const calculateShippingCost = async (pincode: string) => {
        if (!pincode || pincode.length < 6) return; // Guard against bad pincodes

        try {
            const { data } = await calculateShipping(pincode);
            setDeliveryCharges(data.shippingCost);
        } catch (error) {
            console.error("Failed to calculate shipping:", error);
            // Do NOT overwrite with default 50 if previous value exists, unless it's a hard error
            // keeping it 50 as safe fallback is okay, but prevents 'random' jumps 
            // setDeliveryCharges(50); 
        }
    }

    const { subtotal, deliveryCharges: standardDelivery, platformFee, totalAmount } = calculateCartTotals(cart);

    // Use standard delivery as initial state
    const [deliveryCharges, setDeliveryCharges] = useState(standardDelivery);

    // Recalculate total if delivery charges change dynamically
    const totalPayable = subtotal + deliveryCharges + platformFee;

    const handleSelectAddress = async (id: string | number) => {
        setSelectedAddressId(id);
        const selected = addresses.find(addr => addr.id === id);

        if (selected) {
            setContextAddress(selected);
            if (selected.pincode) {
                calculateShippingCost(selected.pincode);
            }
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
        try {
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
            // This ensures 'pincode', 'street' etc are always present and not undefined
            const updatedAddresses: Address[] = (data.addresses || []).map((a: any) => {
                const safe = getSafeAddress(a);
                return {
                    ...safe,
                    id: a._id || a.id || Date.now(),
                    _id: a._id, // Keep _id for backend ops
                    country: 'India'
                } as Address;
            });

            setAddresses(updatedAddresses);
            addToast('success', addressToEdit ? "Address updated" : "Address added");
            setIsAddressFormOpen(false);
            setAddressToEdit(null);

            // Smart Selection Logic
            // 1. Identify which address we just touched
            let targetId = addressToEdit?.id; // If editing

            // If adding new, try to find the one we just added (usually last one, or match by fields)
            if (!targetId && updatedAddresses.length > 0) {
                targetId = updatedAddresses[updatedAddresses.length - 1].id;
            }

            if (targetId) {
                const newAddr = updatedAddresses.find(a => a.id === targetId) || updatedAddresses[0];

                if (newAddr) {
                    // 🛡️ Delivery Charge Guard
                    // Only calculate if pincode CHANGED or we are selecting for first time
                    // We check against the *currently selected* address pincode
                    const oldPincode = contextAddress?.pincode;
                    const newPincode = newAddr.pincode;

                    setSelectedAddressId(newAddr.id);
                    setContextAddress(newAddr);

                    // Only recalculate if meaningful change
                    if (newPincode && newPincode !== oldPincode) {
                        console.log(`Pincode changed (${oldPincode} -> ${newPincode}), recalculating shipping...`);
                        calculateShippingCost(newPincode);
                    } else {
                        console.log("Pincode unchanged, skipping shipping recalculation.");
                    }
                }
            }
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
        if (!selectedAddressId) {
            addToast('warning', 'Please select or add a delivery address first!');
            return;
        }
        setIsPlaceOrderLoading(true);
        setTimeout(() => {
            setIsPlaceOrderLoading(false);
            navigate('/payment');
        }, 1000);
    };

    return (
        <div className="checkout-container">
            <header className="checkout-header">
                <div className="logo"></div>
                <div className="checkout-steps">
                    <span>Cart</span> → <span className="active">Address</span> → <span>Payment</span> → <span>Confirmation</span>
                </div>
                <div className="secure-checkout">
                    <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>
                    <span>Secure Checkout</span>
                </div>
            </header>
            <main className="checkout-main">
                <div className="address-section">
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

                <div className="summary-section">
                    <div className="price-summary-card">
                        <h3>Price Summary</h3>
                        <div className="price-summary-item">
                            <span>Items price</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="price-summary-item">
                            <span>Delivery charges</span>
                            <span className={deliveryCharges === 0 ? "free" : ""}>{deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges.toLocaleString('en-IN')}`}</span>
                        </div>
                        <div className="price-summary-item">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                        </div>
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
                </div>
            </main>
        </div>
    );
}

export default CheckoutPage;
