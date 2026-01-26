const https = require('https');
const http = require('http');

/**
 * Robust Geolocation Service
 * Uses multiple providers for redundancy and accuracy.
 * Primary: ipapi.co (HTTPS, City-level accuracy)
 * Secondary: ip-api.com (HTTP, Fast fallback)
 */

// Helper to check for private/local IPs
const isPrivateIP = (ip) => {
    if (!ip) return true;
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;

    // Private ranges
    const privateRanges = [
        /^10\./,
        /^192\.168\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./
    ];
    return privateRanges.some(range => range.test(ip));
};

// Helper for native HTTPS/HTTP requests
const fetchJson = (url, protocol = https) => {
    return new Promise((resolve, reject) => {
        const req = protocol.get(url, { headers: { 'User-Agent': 'NodeJS/GeoService' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', err => reject(err));

        // Timeout handling
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
};

const getLocationFromIp = async (ip) => {
    // 1. Handle Private/Local IPs immediately
    if (isPrivateIP(ip)) {
        // Return null or default/server location if needed for dev
        // For now returning null so the controller handles the fallback to address/defaults
        return null;
    }

    // 2. Try Primary Provider (ipapi.co)
    try {
        const data = await fetchJson(`https://ipapi.co/${ip}/json/`, https);
        if (data && data.latitude && data.longitude) {
            return {
                lat: data.latitude,
                lon: data.longitude,
                city: data.city || 'Unknown',
                country: data.country_name || 'Unknown',
                countryCode: data.country_code || 'XX',
                provider: 'ipapi.co'
            };
        }
    } catch (error) {
        // Warning only, proceed to fallback
        // console.warn(`Primary GeoIP lookup failed for ${ip}: ${error.message}`);
    }

    // 3. Try Fallback Provider (ip-api.com)
    try {
        const data = await fetchJson(`http://ip-api.com/json/${ip}`, http);
        if (data && data.status === 'success') {
            return {
                lat: data.lat,
                lon: data.lon,
                city: data.city || 'Unknown',
                country: data.country || 'Unknown',
                countryCode: data.countryCode || 'XX',
                provider: 'ip-api.com'
            };
        }
    } catch (error) {
        console.error(`Fallback GeoIP lookup failed for ${ip}: ${error.message}`);
    }

    return null;
};

module.exports = { getLocationFromIp };
