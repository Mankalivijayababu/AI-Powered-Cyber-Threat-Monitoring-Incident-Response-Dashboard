const axios = require("axios");

/**
 * Convert IP → Location
 * Returns: { country, city, lat, lon }
 */

async function getIPLocation(ip) {
  try {
    // local/private IPs skip
    if (
      ip.startsWith("192.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      return {
        country: "Local Network",
        city: "Private",
        lat: 0,
        lon: 0
      };
    }

    const res = await axios.get(`http://ip-api.com/json/${ip}`);

    return {
      country: res.data.country,
      city: res.data.city,
      lat: res.data.lat,
      lon: res.data.lon
    };
  } catch (err) {
    console.error("IP geo error:", err.message);
    return {
      country: "Unknown",
      city: "Unknown",
      lat: 0,
      lon: 0
    };
  }
}

module.exports = getIPLocation;
