const https = require('http'); // ip-api is http for free tier mostly, or https.

const getLocationFromIp = (ip) => {
    return new Promise((resolve, reject) => {
        // Handle localhost or empty
        if (!ip || ip === '127.0.0.1' || ip === '::1') {
            return resolve(null);
        }

        // ip-api.com Free endpoint (HTTP only mostly)
        const url = `http://ip-api.com/json/${ip}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 'success') {
                        resolve({
                            lat: json.lat,
                            lon: json.lon,
                            city: json.city,
                            country: json.country
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = { getLocationFromIp };
