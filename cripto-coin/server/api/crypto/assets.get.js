import { fetchCoinApiAssets } from "../../utils/coinApi";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  try {
    return await fetchCoinApiAssets(config.cryptoApiKey);
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to load crypto assets",
    });
  }
});