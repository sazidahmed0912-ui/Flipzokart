const indiaAddressData = require('./indiaAddressData');

/**
 * Validates if the given state and city combination is valid
 * @param {string} state - The state name
 * @param {string} city - The city/district name
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
const validateAddress = (state, city) => {
    // 1. Check if state exists
    if (!indiaAddressData[state]) {
        return {
            isValid: false,
            error: `Invalid state provided: ${state}. Please select a valid state from the list.`
        };
    }

    // 2. Check if city belongs to the state
    const validCities = indiaAddressData[state];
    if (!validCities.includes(city)) {
        return {
            isValid: false,
            error: `Invalid city provided: ${city}. This city does not belong to ${state}.`
        };
    }

    return { isValid: true, error: null };
};

module.exports = { validateAddress };
