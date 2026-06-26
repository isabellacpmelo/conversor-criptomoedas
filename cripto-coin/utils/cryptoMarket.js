export function normalizeAssetId(value = "") {
  return String(value || "").trim().toUpperCase();
}

export function hasValidPrice(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

const toFiniteNumberOrNull = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export function buildMarketChangeList(assets = [], previousSnapshot = []) {
  const previousPriceMap = new Map(
    (Array.isArray(previousSnapshot) ? previousSnapshot : []).map((asset) => [
      normalizeAssetId(asset?.asset_id),
      Number(asset?.price_usd),
    ])
  );

  return (Array.isArray(assets) ? assets : []).map((asset) => {
    const currentPrice = Number(asset?.price_usd);
    const previousPrice = previousPriceMap.get(normalizeAssetId(asset?.asset_id));

    let marketChangePercentage = null;
    if (hasValidPrice(currentPrice) && hasValidPrice(previousPrice) && previousPrice > 0) {
      marketChangePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
    }

    return {
      ...asset,
      market_change_percentage: marketChangePercentage,
    };
  });
}

export function addTrendMetadata(asset, nextPrice, previousPriceFallback = null) {
  const previousPrice = hasValidPrice(previousPriceFallback)
    ? Number(previousPriceFallback)
    : hasValidPrice(asset?.price_usd)
      ? Number(asset.price_usd)
      : null;

  const normalizedNextPrice = hasValidPrice(nextPrice) ? Number(nextPrice) : null;

  let trend = "neutral";
  let changePercentage = null;

  if (hasValidPrice(normalizedNextPrice) && hasValidPrice(previousPrice) && previousPrice > 0) {
    const delta = normalizedNextPrice - previousPrice;
    const computedChange = (delta / previousPrice) * 100;
    if (delta !== 0) {
      trend = computedChange > 0 ? "up" : "down";
      changePercentage = computedChange;
    }
  }

  return {
    ...asset,
    price_usd: normalizedNextPrice ?? asset?.price_usd ?? null,
    previous_price_usd: previousPrice,
    price_change_percentage_24h: changePercentage,
    price_trend: trend,
  };
}

export function hydrateSavedCryptos(savedCryptos = [], allCryptos = []) {
  if (!Array.isArray(savedCryptos) || !savedCryptos.length) {
    return [];
  }

  return savedCryptos
    .map((savedCrypto) => {
      const assetId = normalizeAssetId(savedCrypto?.asset_id);
      if (!assetId) {
        return null;
      }

      const apiCrypto = allCryptos.find((crypto) => normalizeAssetId(crypto?.asset_id) === assetId);
      const hydratedCrypto = apiCrypto ? { ...apiCrypto } : { ...savedCrypto, asset_id: assetId };

      if (!hydratedCrypto.name) {
        hydratedCrypto.name = savedCrypto.name || assetId;
      }

      if (!hasValidPrice(hydratedCrypto.price_usd) && hasValidPrice(savedCrypto.price_usd)) {
        hydratedCrypto.price_usd = Number(savedCrypto.price_usd);
      }

      hydratedCrypto.previous_price_usd = hasValidPrice(savedCrypto.previous_price_usd)
        ? Number(savedCrypto.previous_price_usd)
        : null;

      hydratedCrypto.price_change_percentage_24h = toFiniteNumberOrNull(savedCrypto.price_change_percentage_24h);
      hydratedCrypto.price_trend = ["up", "down", "neutral"].includes(savedCrypto.price_trend)
        ? savedCrypto.price_trend
        : "neutral";

      return hydratedCrypto;
    })
    .filter(Boolean);
}