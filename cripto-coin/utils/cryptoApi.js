/**
 * Crypto API utility functions
 */

import { normalizeAssetId } from "@/utils/cryptoMarket.js";

const APP_API_BASE_URL = "/api/crypto";

async function fetchAppApiJson(path) {
  const response = await fetch(`${APP_API_BASE_URL}${path}`);

  if (!response.ok) {
    let statusMessage = `API error: ${response.status} ${response.statusText}`;

    try {
      const errorPayload = await response.json();
      if (errorPayload?.statusMessage) {
        statusMessage = errorPayload.statusMessage;
      }
    } catch {
      // Ignore invalid JSON responses.
    }

    if (response.status === 429) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }

    throw new Error(statusMessage);
  }

  return response.json();
}

/**
 * Fetch all available cryptocurrencies
 * @returns {Promise<Array>} Array of cryptocurrency assets
 */
export async function fetchAllCryptos() {
  const data = await fetchAppApiJson("/assets");

  if (!Array.isArray(data)) {
    throw new Error("Invalid API response format");
  }

  return data;
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

function hasValidPrice(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function getQuoteTimestamp(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
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

  const matches = allCryptos.filter((crypto) => {
    if (!crypto || typeof crypto !== "object") {
      return false;
    }

    const normalizedName = normalizeText(crypto.name);
    const normalizedSymbol = normalizeText(crypto.asset_id);
    return normalizedName === normalizedQuery || normalizedSymbol === normalizedQuery;
  });

  if (!matches.length) {
    return null;
  }

  matches.sort((left, right) => {
    const leftIsCrypto = Number(left.type_is_crypto) === 1 ? 1 : 0;
    const rightIsCrypto = Number(right.type_is_crypto) === 1 ? 1 : 0;
    if (leftIsCrypto !== rightIsCrypto) {
      return rightIsCrypto - leftIsCrypto;
    }

    const leftHasPrice = hasValidPrice(left.price_usd) ? 1 : 0;
    const rightHasPrice = hasValidPrice(right.price_usd) ? 1 : 0;
    if (leftHasPrice !== rightHasPrice) {
      return rightHasPrice - leftHasPrice;
    }

    const leftQuote = getQuoteTimestamp(left.data_quote_end);
    const rightQuote = getQuoteTimestamp(right.data_quote_end);
    if (leftQuote !== rightQuote) {
      return rightQuote - leftQuote;
    }

    const leftName = normalizeText(left.name || left.asset_id || "");
    const rightName = normalizeText(right.name || right.asset_id || "");
    return leftName.localeCompare(rightName);
  });

  return matches[0];
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

  const selectedAssetIds = new Set(
    selectedCryptos
      .filter((crypto) => crypto && typeof crypto === "object")
      .map((crypto) => normalizeAssetId(crypto.asset_id))
      .filter(Boolean)
  );

  const rankedMatches = allCryptos
    .filter((crypto) => {
      if (!crypto || typeof crypto !== "object") {
        return false;
      }

      if (Number(crypto.type_is_crypto) !== 1) {
        return false;
      }

      const normalizedName = normalizeText(crypto.name);
      const normalizedSymbol = normalizeText(crypto.asset_id);

      if (!normalizedName && !normalizedSymbol) {
        return false;
      }

      if (selectedAssetIds.has(normalizedSymbol)) {
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

      const leftHasPrice = hasValidPrice(left.crypto?.price_usd) ? 1 : 0;
      const rightHasPrice = hasValidPrice(right.crypto?.price_usd) ? 1 : 0;
      if (leftHasPrice !== rightHasPrice) {
        return rightHasPrice - leftHasPrice;
      }

      const leftQuote = getQuoteTimestamp(left.crypto?.data_quote_end);
      const rightQuote = getQuoteTimestamp(right.crypto?.data_quote_end);
      if (leftQuote !== rightQuote) {
        return rightQuote - leftQuote;
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
 * @returns {Promise<number|null>} Price in USD or null if fetch fails
 */
export async function fetchCryptoPrice(assetId) {
  if (!assetId) {
    return null;
  }

  try {
    const data = await fetchAppApiJson(`/asset?assetId=${encodeURIComponent(assetId)}`);
    if (Array.isArray(data)) {
      const normalizedAssetKey = normalizeAssetId(assetId);
      const asset = data.find((item) => normalizeAssetId(item?.asset_id) === normalizedAssetKey) || data[0];
      return hasValidPrice(asset?.price_usd) ? Number(asset.price_usd) : null;
    }

    return hasValidPrice(data?.price_usd) ? Number(data.price_usd) : null;
  } catch (error) {
    console.warn(`Failed to fetch asset price for ${assetId}:`, error);
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
 * @param {string} cryptoName - Asset id to check
 * @returns {boolean} True if already exists
 */
export function isDuplicateCrypto(cryptoList, cryptoName) {
  const normalizedAssetKey = normalizeAssetId(cryptoName);
  return cryptoList.some((crypto) => normalizeAssetId(crypto?.asset_id) === normalizedAssetKey);
}
