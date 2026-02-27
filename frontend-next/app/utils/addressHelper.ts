export interface NormalizedAddress {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    addressLine2?: string;
    type?: string;
}

export const getSafeAddress = (source: any): NormalizedAddress => {
    if (!source) return {
        fullName: 'Customer',
        email: 'N/A',
        phone: 'N/A',
        street: 'Address not available',
        city: 'Unknown',
        state: '',
        pincode: '',
        country: ''
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
                email: 'N/A',
                phone: 'N/A',
                street: source,
                city: '',
                state: '',
                pincode: '',
                country: ''
            };
        }
    }

    return {
        fullName: data.fullName || data.name || 'Customer',
        email: data.email || 'N/A',
        phone: data.phone || data.mobile || 'N/A',
        street: data.street || data.address || data.line1 || data.addressLine1 || 'Address details missing',
        addressLine2: data.addressLine2 || data.line2 || data.locality || '',
        city: data.city || data.district || '',
        state: data.state || '',
        pincode: data.pincode || data.zip || data.postalCode || '',
        country: data.country || '',
        type: data.type || 'Home'
    };
};
// Strict Address Validator
export const isAddressValid = (address: any) => {
    if (!address) return false;

    return (
        (address.fullName?.trim() || address.name?.trim()) &&
        /^\d{10}$/.test(address.phone || "") &&
        address.street?.trim() &&
        address.city?.trim() &&
        address.state?.trim() &&
        /^\d{6}$/.test(address.pincode || "") &&
        address.country?.trim()
    );
};
