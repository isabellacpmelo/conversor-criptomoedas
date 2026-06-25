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
 * Normalize text for case-insensitive and accent-insensitive comparisons
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

  const normalizedQuery = normalizeText(cryptoName);

  return (
    allCryptos.find((crypto) => {
      const normalizedName = normalizeText(crypto.name);
      const normalizedSymbol = normalizeText(crypto.asset_id);

      return normalizedName === normalizedQuery || normalizedSymbol === normalizedQuery;
    }) || null
  );
}

/**
 * Return local autocomplete suggestions without hitting the API
 * @param {string} query - Search text
 * @param {Array} allCryptos - Available cryptocurrencies
 * @param {Array} selectedCryptos - Currently selected cryptocurrencies
 * @param {number} limit - Max number of suggestions
 * @returns {Array}
 */
export function getCryptoSuggestions(query, allCryptos, selectedCryptos = [], limit = 8) {
  if (!query || !Array.isArray(allCryptos)) {
    return [];
  }

  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [];
  }

  const selectedNames = new Set(
    selectedCryptos
      .filter((crypto) => crypto && typeof crypto === "object")
      .map((crypto) => normalizeText(crypto.name))
      .filter(Boolean)
  );

  const rankedMatches = allCryptos
    .filter((crypto) => {
      if (!crypto || typeof crypto !== "object") {
        return false;
      }

      const normalizedName = normalizeText(crypto.name);
      const normalizedSymbol = normalizeText(crypto.asset_id);

      if (!normalizedName && !normalizedSymbol) {
        return false;
      }

      if (selectedNames.has(normalizedName)) {
        return false;
      }

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedSymbol.includes(normalizedQuery)
      );
    })
    .map((crypto) => {
      const normalizedName = normalizeText(crypto.name);
      const normalizedSymbol = normalizeText(crypto.asset_id);

      let score = 3;
      if (normalizedSymbol === normalizedQuery) {
        score = 0;
      } else if (normalizedName === normalizedQuery) {
        score = 1;
      } else if (
        normalizedName.startsWith(normalizedQuery) ||
        normalizedSymbol.startsWith(normalizedQuery)
      ) {
        score = 2;
      }

      return { crypto, score };
    })
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      const leftName = normalizeText(left.crypto?.name || left.crypto?.asset_id || "");
      const rightName = normalizeText(right.crypto?.name || right.crypto?.asset_id || "");
      return leftName.localeCompare(rightName);
    })
    .slice(0, limit)
    .map(({ crypto }) => crypto);

  return rankedMatches;
}

/**
 * Fetch the latest price for a cryptocurrency
 * @param {string} assetId - Asset ID (e.g., 'BTC')
 * @param {string} apiKey - CoinAPI API key
 * @returns {Promise<number|null>} Price in USD or null if fetch fails
 */
export async function fetchCryptoPrice(assetId, apiKey) {
  if (!assetId || !apiKey) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(
      `${API_BASE_URL}/exchangerate/${assetId}/USD`,
      {
        headers: {
          "X-CoinAPI-Key": apiKey,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.rate || null;
  } catch (error) {
    console.warn(`Failed to fetch price for ${assetId}:`, error);
    return null;
  }
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
