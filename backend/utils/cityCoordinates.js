/**
 * Static coordinate mapping for India States and Major Cities
 * Used for placing markers on the Admin Map when precise user location is missing.
 */

const indiaCoordinates = {
    // States (Center points)
    "Andaman and Nicobar Islands": { lat: 11.7401, lng: 92.6586 },
    "Andhra Pradesh": { lat: 15.9129, lng: 79.7400 },
    "Arunachal Pradesh": { lat: 28.2180, lng: 94.7278 },
    "Assam": { lat: 26.2006, lng: 92.9376 },
    "Bihar": { lat: 25.0961, lng: 85.3131 },
    "Chandigarh": { lat: 30.7333, lng: 76.7794 },
    "Chhattisgarh": { lat: 21.2787, lng: 81.8661 },
    "Dadra and Nagar Haveli and Daman and Diu": { lat: 20.4283, lng: 72.8397 },
    "Delhi": { lat: 28.7041, lng: 77.1025 },
    "Goa": { lat: 15.2993, lng: 74.1240 },
    "Gujarat": { lat: 22.2587, lng: 71.1924 },
    "Haryana": { lat: 29.0588, lng: 76.0856 },
    "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
    "Jammu and Kashmir": { lat: 33.7782, lng: 76.5762 },
    "Jharkhand": { lat: 23.6102, lng: 85.2799 },
    "Karnataka": { lat: 15.3173, lng: 75.7139 },
    "Kerala": { lat: 10.8505, lng: 76.2711 },
    "Ladakh": { lat: 34.1526, lng: 77.5770 },
    "Lakshadweep": { lat: 10.5667, lng: 72.6417 },
    "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
    "Maharashtra": { lat: 19.7515, lng: 75.7139 },
    "Manipur": { lat: 24.6637, lng: 93.9063 },
    "Meghalaya": { lat: 25.4670, lng: 91.3662 },
    "Mizoram": { lat: 23.1645, lng: 92.9376 },
    "Nagaland": { lat: 26.1584, lng: 94.5624 },
    "Odisha": { lat: 20.9517, lng: 85.0985 },
    "Puducherry": { lat: 11.9416, lng: 79.8083 },
    "Punjab": { lat: 31.1471, lng: 75.3412 },
    "Rajasthan": { lat: 27.0238, lng: 74.2179 },
    "Sikkim": { lat: 27.5330, lng: 88.5122 },
    "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
    "Telangana": { lat: 18.1124, lng: 79.0193 },
    "Tripura": { lat: 23.9408, lng: 91.9882 },
    "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
    "Uttarakhand": { lat: 30.0668, lng: 79.0193 },
    "West Bengal": { lat: 22.9868, lng: 87.8550 },

    // Major Cities (Overrides State center if City matches)
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Pune": { lat: 18.5204, lng: 73.8567 },
    "Nagpur": { lat: 21.1458, lng: 79.0882 },
    "Bangalore": { lat: 12.9716, lng: 77.5946 },
    "Bengaluru Urban": { lat: 12.9716, lng: 77.5946 },
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Hyderabad": { lat: 17.3850, lng: 78.4867 },
    "Kolkata": { lat: 22.5726, lng: 88.3639 },
    "New Delhi": { lat: 28.6139, lng: 77.2090 },
    "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
    "Surat": { lat: 21.1702, lng: 72.8311 },
    "Jaipur": { lat: 26.9124, lng: 75.7873 },
    "Lucknow": { lat: 26.8467, lng: 80.9462 },
    "Kanpur": { lat: 26.4499, lng: 80.3319 },
    "Bhopal": { lat: 23.2599, lng: 77.4126 },
    "Indore": { lat: 22.7196, lng: 75.8577 },
    "Patna": { lat: 25.5941, lng: 85.1376 },
    "Chandigarh": { lat: 30.7333, lng: 76.7794 },
    "Ludhiana": { lat: 30.9010, lng: 75.8573 },
    "Agra": { lat: 27.1767, lng: 78.0081 },
    "Nashik": { lat: 19.9975, lng: 73.7898 },
    "Vadodara": { lat: 22.3072, lng: 73.1812 },
    "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
    "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
    "Kochi": { lat: 9.9312, lng: 76.2673 },
    "Coimbatore": { lat: 11.0168, lng: 76.9558 },
    "Madurai": { lat: 9.9252, lng: 78.1198 },
    "Mysuru": { lat: 12.2958, lng: 76.6394 },
    "Gurugram": { lat: 28.4595, lng: 77.0266 },
    "Noida": { lat: 28.5355, lng: 77.3910 },
    "Dehradun": { lat: 30.3165, lng: 78.0322 },
    "Ranchi": { lat: 23.3441, lng: 85.3096 },
    "Raipur": { lat: 21.2514, lng: 81.6296 },
    "Bhubaneswar": { lat: 20.2961, lng: 85.8245 },
    "Guwahati": { lat: 26.1445, lng: 91.7364 }
};

/**
 * Get coordinates for a given location
 * @param {string} state - The state name
 * @param {string} city - The city name
 * @returns {Object} - { lat: number, lng: number } or default to India center
 */
const getCoordinates = (state, city) => {
    // 1. Try exact City match
    if (city && indiaCoordinates[city]) {
        return indiaCoordinates[city];
    }

    // 2. Try State match
    if (state && indiaCoordinates[state]) {
        // Add small random noise to prevent exact stacking if multiple users in same state
        const noise = () => (Math.random() - 0.5) * 0.05;
        return {
            lat: indiaCoordinates[state].lat + noise(),
            lng: indiaCoordinates[state].lng + noise()
        };
    }

    // 3. Fallback to India Center
    return { lat: 20.5937, lng: 78.9629 };
};

module.exports = { getCoordinates };
