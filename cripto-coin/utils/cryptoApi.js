/**
 * Crypto API utility functions
 */

const API_BASE_URL = "https://rest.coinapi.io/v1";
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch all available cryptocurrencies
 * @param {string} apiKey - CoinAPI API key
 * @returns {Promise<Array>} Array of cryptocurrency assets
 */
export async function fetchAllCryptos(apiKey) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/assets`, {
      headers: {
        "X-CoinAPI-Key": apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid API response format");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Please check your connection and try again.");
    }
    throw error;
  }
}

/**
 * Search for a specific cryptocurrency by name
 * @param {string} cryptoName - Name to search for
 * @param {Array} allCryptos - Array of all available cryptocurrencies
 * @returns {Object|null} Cryptocurrency object or null if not found
 */
export function searchCrypto(cryptoName, allCryptos) {
  if (!cryptoName || !Array.isArray(allCryptos)) {
    return null;
  }

  return (
    allCryptos.find((crypto) => crypto.name.toLowerCase() === cryptoName.toLowerCase()) || null
  );
}

/**
 * Format price with 2 decimal places
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
  return Number(price).toFixed(2);
}

/**
 * Check if crypto is already in the list
 * @param {Array} cryptoList - Current crypto list
 * @param {string} cryptoName - Name to check
 * @returns {boolean} True if already exists
 */
export function isDuplicateCrypto(cryptoList, cryptoName) {
  return cryptoList.some((crypto) => crypto.name.toLowerCase() === cryptoName.toLowerCase());
}
