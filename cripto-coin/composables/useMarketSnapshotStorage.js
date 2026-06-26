const MARKET_SNAPSHOT_STORAGE_KEY = "crypto-converter.market-snapshot";

const isClient = () => typeof window !== "undefined";

const hasValidPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

const normalizeSnapshotEntry = (asset) => {
  if (!asset || typeof asset !== "object") {
    return null;
  }

  const assetId = String(asset.asset_id || "").trim();
  if (!assetId) {
    return null;
  }

  return {
    asset_id: assetId,
    price_usd: hasValidPrice(asset.price_usd) ? Number(asset.price_usd) : null,
  };
};

// Local storage mapping for full-market snapshot (loaded assets list).
const MarketSnapshotStorage = {
  key: MARKET_SNAPSHOT_STORAGE_KEY,
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

      return parsedValue.map(normalizeSnapshotEntry).filter(Boolean);
    } catch {
      return [];
    }
  },
  write(assets = []) {
    if (!isClient()) {
      return;
    }

    try {
      const normalizedAssets = (Array.isArray(assets) ? assets : [])
        .map(normalizeSnapshotEntry)
        .filter(Boolean);

      window.localStorage.setItem(this.key, JSON.stringify(normalizedAssets));
    } catch {
      // Ignore storage write errors.
    }
  },
  clear() {
    if (!isClient()) {
      return;
    }

    try {
      window.localStorage.removeItem(this.key);
    } catch {
      // Ignore storage clear errors.
    }
  },
};

export function useMarketSnapshotStorage() {
  return {
    marketSnapshotStorage: MarketSnapshotStorage,
  };
}