export interface NormalizedAddress {
    id?: string | number; // Optional as it might not be in raw data but added later
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    addressLine2?: string;
    type?: string;
    isDefault?: boolean;
}

export const getSafeAddress = (source: any): NormalizedAddress => {
    if (!source) return {
        fullName: 'Customer',
        phone: 'N/A',
        street: 'Address not available',
        city: 'Unknown',
        state: '',
        pincode: '',
        country: 'India'
    };

    // Handle legacy double-nested or stringified addresses
    let data = source;
    if (typeof source === 'string') {
        try {
            data = JSON.parse(source);
        } catch (e) {
            // Treat string as street if parsing fails
            return {
                fullName: 'Customer',
                phone: 'N/A',
                street: source,
                city: '',
                state: '',
                pincode: '',
                country: 'India'
            };
        }
    }

    return {
        fullName: data.fullName || data.name || 'Customer',
        phone: data.phone || data.mobile || 'N/A',
        street: data.street || data.address || data.addressLine1 || 'Address details missing',
        addressLine2: data.addressLine2 || data.locality || '',
        city: data.city || data.district || '',
        state: data.state || '',
        pincode: data.pincode || data.zip || data.postalCode || '',
        country: data.country || "India",
        isDefault: data.isDefault || false,
        type: data.type || "Home",
    };
};

export const validateAddress = (address: any): string | null => {
    if (!address) return "No address selected";
    if (!address.fullName?.trim()) return "Enter full name";
    if (!/^\d{10}$/.test(String(address.phone || '').trim())) return "Enter valid 10-digit phone";
    if (!address.street?.trim()) return "Enter street address";
    if (!address.city?.trim()) return "Enter city";
    if (!address.state?.trim()) return "Enter state";
    if (!/^\d{6}$/.test(String(address.pincode || '').trim())) return "Enter valid 6-digit pincode";
    if (!address.country?.trim()) return "Enter country";

    return null;
};
