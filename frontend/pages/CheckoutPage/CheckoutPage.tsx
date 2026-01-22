import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader } from 'lucide-react';
import { calculateShipping } from '../../services/api';
import { useApp } from '../../store/Context';
import { useToast } from '../../components/toast';
import { Address } from '../../types';
import AddressCard from './components/AddressCard';
import AddressForm from './components/AddressForm';
import Modal from './components/Modal';
import './components/Modal.css';
import './CheckoutPage.css';

const initialAddresses: Address[] = [];

const CheckoutPage = () => {
    const { cart, selectedAddress: contextAddress, setSelectedAddress: setContextAddress } = useApp();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(contextAddress?.id ?? null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaceOrderLoading, setIsPlaceOrderLoading] = useState(false);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
    const [deliveryCharges, setDeliveryCharges] = useState(0);

    const subtotal = cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    const discount = 0; // Placeholder
    const totalPayable = subtotal + deliveryCharges - discount;

    const handleSelectAddress = async (id: number) => {
        setSelectedAddressId(id);
        const selected = addresses.find(addr => addr.id === id);
        if (selected && selected.pincode) {
            try {
                const { data } = await calculateShipping(selected.pincode);
                setDeliveryCharges(data.shippingCost);
            } catch (error) {
                console.error("Failed to calculate shipping:", error);
                setDeliveryCharges(50); // Set a default/fallback shipping cost
            }
        }
    };

    const handleDeliverHere = () => {
        if (selectedAddressId === null) {
            addToast('warning', 'Please select or add a delivery address first!');
            return;
        }

        setIsLoading(true);

        const addressToSave = addresses.find(addr => addr.id === selectedAddressId);

        if (addressToSave) {
            // Simulate API call
            setTimeout(() => {
                setContextAddress(addressToSave);
                setIsLoading(false);
            }, 1000);
        } else {
            addToast('warning', 'Selected address not found.');
            setIsLoading(false);
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

    const handleDeleteAddress = (id: number) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            // Simulate API Call
            setAddresses(prevAddresses => prevAddresses.filter(address => address.id !== id));
            if (selectedAddressId === id) {
                setSelectedAddressId(null);
                setContextAddress(null);
            }
        }
    };

    const handleSaveAddress = (address: Address) => {
        // Simulate API Call
        if (addressToEdit) {
            setAddresses(prevAddresses => prevAddresses.map(addr => addr.id === address.id ? address : addr));
        } else {
            setAddresses(prevAddresses => [...prevAddresses, { ...address, id: Date.now() }]);
        }
        setIsAddressFormOpen(false);
        setAddressToEdit(null);
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

        // Simulate processing
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
                        {addresses.map((addr) => (
                            <AddressCard
                                key={addr.id}
                                address={addr}
                                isSelected={selectedAddressId === addr.id}
                                onSelect={handleSelectAddress}
                                onDelete={handleDeleteAddress}
                                onEdit={handleEditAddress}
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
