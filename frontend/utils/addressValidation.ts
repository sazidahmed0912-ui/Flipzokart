import { indiaAddressData } from '../data/IndiaAddressData';
import { AddressFormData } from '../components/AddressFormFields';

export const validateAddressForm = (formData: AddressFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Name Validation
    if (!formData.name.trim()) {
        errors.name = "Name is required";
    }

    // Phone Validation (10 digits, numeric)
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone) {
        errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
        errors.phone = "Enter a valid 10-digit mobile number";
    }

    // Address (Street) Validation
    if (!formData.street.trim()) {
        errors.street = "Address line is required";
    }

    // State Validation
    if (!formData.state) {
        errors.state = "State is required";
    }

    // City Validation
    if (!formData.city) {
        errors.city = "City is required";
    } else if (formData.state && indiaAddressData[formData.state]) {
        // Optional: Ensure city belongs to state (though UI restricts this)
        if (!indiaAddressData[formData.state].includes(formData.city)) {
            errors.city = "Invalid city for selected state";
        }
    }

    // Pincode Validation (6 digits)
    const zipRegex = /^[0-9]{6}$/;
    if (!formData.zip) {
        errors.zip = "Pincode is required";
    } else if (!zipRegex.test(formData.zip)) {
        errors.zip = "Enter a valid 6-digit Pincode";
    }

    return errors;
};
