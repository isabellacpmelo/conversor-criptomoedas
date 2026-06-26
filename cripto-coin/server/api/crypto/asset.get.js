import { fetchCoinApiAssetById } from "../../utils/coinApi";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const assetId = getQuery(event).assetId;

  if (!assetId || typeof assetId !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Asset id is required",
    });
  }

  try {
    return await fetchCoinApiAssetById(assetId, config.cryptoApiKey);
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to load crypto asset",
    });
  }
});