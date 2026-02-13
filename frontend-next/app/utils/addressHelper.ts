export interface NormalizedAddress {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    addressLine2?: string;
    type?: string;
}

export const getSafeAddress = (source: any): NormalizedAddress => {
    if (!source) return {
        fullName: 'Customer',
        phone: 'N/A',
        street: 'Address not available',
        city: 'Unknown',
        state: '',
        pincode: ''
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
                pincode: ''
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
        type: data.type || 'Home'
    };
};
