const CRYPTO_HISTORY_STORAGE_KEY = "crypto-converter.selected-assets-history";

const isClient = () => typeof window !== "undefined";

const hasValidPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

const normalizeHistoryItem = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const assetId = String(item.asset_id || "").trim();
  const name = String(item.name || "").trim() || assetId;

  if (!assetId) {
    return null;
  }

  return {
    asset_id: assetId,
    name,
    price_usd: hasValidPrice(item.price_usd) ? Number(item.price_usd) : null,
    previous_price_usd: hasValidPrice(item.previous_price_usd) ? Number(item.previous_price_usd) : null,
    price_change_percentage_24h: Number.isFinite(Number(item.price_change_percentage_24h))
      ? Number(item.price_change_percentage_24h)
      : null,
    price_trend: ["up", "down", "neutral"].includes(item.price_trend) ? item.price_trend : "neutral",
  };
};

// Local storage mapping for selected assets history.
const CryptoHistoryStorage = {
  key: CRYPTO_HISTORY_STORAGE_KEY,
  read() {
    if (!isClient()) {
      return [];
    }

    try {
      const rawValue = window.localStorage.getItem(this.key);
      if (!rawValue) {
        return [];
      }

      const parsedValue = JSON.parse(rawValue);
      if (!Array.isArray(parsedValue)) {
        return [];
      }

      return parsedValue.map(normalizeHistoryItem).filter(Boolean);
    } catch {
      return [];
    }
  },
  write(cryptoList = []) {
    if (!isClient()) {
      return;
    }

    try {
      const normalizedList = (Array.isArray(cryptoList) ? cryptoList : [])
        .map(normalizeHistoryItem)
        .filter(Boolean);

      window.localStorage.setItem(this.key, JSON.stringify(normalizedList));
    } catch {
      // Ignore write issues in private mode/quota exceeded cases.
    }
  },
  clear() {
    if (!isClient()) {
      return;
    }

    try {
      window.localStorage.removeItem(this.key);
    } catch {
      // Ignore remove issues.
    }
  },
};

export function useCryptoHistoryStorage() {
  return {
    historyStorage: CryptoHistoryStorage,
  };
}