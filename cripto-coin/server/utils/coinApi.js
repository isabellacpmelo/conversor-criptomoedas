const COIN_API_BASE_URL = "https://rest.coinapi.io/v1";
const COIN_API_TIMEOUT = 10000;

const buildHeaders = (apiKey) => ({
  "X-CoinAPI-Key": apiKey,
});

const createCoinApiError = (statusCode, statusMessage) => {
  const error = new Error(statusMessage);
  error.statusCode = statusCode;
  return error;
};

async function fetchCoinApiJson(path, apiKey) {
  if (!apiKey) {
    throw createCoinApiError(500, "CoinAPI key is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), COIN_API_TIMEOUT);

  try {
    const response = await fetch(`${COIN_API_BASE_URL}${path}`, {
      headers: buildHeaders(apiKey),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw createCoinApiError(429, "CoinAPI rate limit exceeded");
      }

      throw createCoinApiError(response.status, `CoinAPI request failed with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw createCoinApiError(504, "CoinAPI request timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchCoinApiAssets(apiKey) {
  const data = await fetchCoinApiJson("/assets", apiKey);

  if (!Array.isArray(data)) {
    throw createCoinApiError(502, "Invalid CoinAPI assets response");
  }

  return data;
}

export async function fetchCoinApiAssetById(assetId, apiKey) {
  const data = await fetchCoinApiJson(`/assets/${encodeURIComponent(assetId)}`, apiKey);

  if (Array.isArray(data)) {
    return data;
  }

  return [data];
}