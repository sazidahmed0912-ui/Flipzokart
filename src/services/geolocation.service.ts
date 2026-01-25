import axios from 'axios';

interface GeolocationData {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    countryCode: string;
}

/**
 * Geolocation Service
 * Provides IP-based geolocation using free API services
 */
class GeolocationService {
    /**
     * Get geolocation data from IP address using ipapi.co (free tier: 1000 requests/day)
     * @param ipAddress - The IP address to lookup
     * @returns Geolocation data or null if lookup fails
     */
    async getLocationFromIP(ipAddress: string): Promise<GeolocationData | null> {
        try {
            // Skip localhost/private IPs
            if (this.isPrivateIP(ipAddress)) {
                return this.getDefaultLocation();
            }

            // Try ipapi.co first (free tier, no API key needed)
            try {
                const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, {
                    timeout: 5000,
                });

                if (response.data && response.data.latitude && response.data.longitude) {
                    return {
                        latitude: response.data.latitude,
                        longitude: response.data.longitude,
                        city: response.data.city || 'Unknown',
                        country: response.data.country_name || 'Unknown',
                        countryCode: response.data.country_code || 'XX',
                    };
                }
            } catch (error) {
                console.warn('ipapi.co lookup failed, trying fallback...');
            }

            // Fallback to ip-api.com (free tier, no API key needed)
            try {
                const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
                    timeout: 5000,
                });

                if (response.data && response.data.status === 'success') {
                    return {
                        latitude: response.data.lat,
                        longitude: response.data.lon,
                        city: response.data.city || 'Unknown',
                        country: response.data.country || 'Unknown',
                        countryCode: response.data.countryCode || 'XX',
                    };
                }
            } catch (error) {
                console.warn('ip-api.com lookup failed');
            }

            // If all APIs fail, return default location
            return this.getDefaultLocation();
        } catch (error) {
            console.error('Geolocation lookup error:', error);
            return this.getDefaultLocation();
        }
    }

    /**
     * Check if IP is private/localhost
     */
    private isPrivateIP(ip: string): boolean {
        if (!ip) return true;

        // Check for localhost
        if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
            return true;
        }

        // Check for private IP ranges
        const privateRanges = [
            /^10\./,
            /^192\.168\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        ];

        return privateRanges.some(range => range.test(ip));
    }

    /**
     * Get default location (used for localhost/private IPs or when lookup fails)
     * Returns New York coordinates as default
     */
    private getDefaultLocation(): GeolocationData {
        return {
            latitude: 40.7128,
            longitude: -74.0060,
            city: 'New York',
            country: 'United States',
            countryCode: 'US',
        };
    }

    /**
     * Extract client IP from request
     * Handles various proxy headers
     */
    getClientIP(req: any): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }

        return (
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            '127.0.0.1'
        );
    }
}

export default new GeolocationService();
