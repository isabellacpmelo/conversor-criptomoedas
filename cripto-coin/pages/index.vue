<template>
  <div class="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl"></div>
      <div class="absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"></div>
    </div>

    <div class="relative mx-auto flex max-w-5xl flex-col items-center px-1 md:px-2">
      <div class="flex flex-col items-center">
        <div class="mb-6 flex w-full justify-end">
          <button
            type="button"
            class="theme-secondary-btn rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
            @click="toggleTheme"
          >
            {{ isDarkTheme ? "Switch to light mode" : "Switch to dark mode" }}
          </button>
        </div>

        <!-- Header -->
        <div class="theme-surface theme-text-muted mb-5 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.3em]">
          Live crypto watchlist
        </div>
        <img class="mb-6 w-20 drop-shadow-[0_0_30px_rgba(56,189,248,0.35)]" src="@/assets/img/criptomoedas.png" alt="Cryptocurrency" />
        <h1 class="theme-text-main mb-6 max-w-3xl text-center text-4xl font-bold tracking-tight md:text-6xl">
          Cryptocurrency Converter
        </h1>

        <!-- Description -->
        <article class="mb-10 max-w-2xl text-center">
          <h2 class="theme-text-main mb-4 text-2xl font-semibold md:text-3xl">
            Welcome to the cryptocurrency price converter!
          </h2>
          <p class="theme-text-muted text-base leading-7 md:text-lg">
            Search by name or symbol, build a focused watchlist, and refresh prices on demand without burning API quota.
          </p>
        </article>

        <div class="mb-8 grid w-full max-w-3xl gap-4 md:grid-cols-3">
          <div class="theme-surface rounded-2xl border p-4 text-left">
            <p class="theme-text-subtle text-xs uppercase tracking-[0.24em]">Autocomplete</p>
            <p class="theme-text-muted mt-2 text-sm">Local suggestions with keyboard navigation and exact-match validation.</p>
          </div>
          <div class="theme-surface rounded-2xl border p-4 text-left">
            <p class="theme-text-subtle text-xs uppercase tracking-[0.24em]">Refresh policy</p>
            <p class="theme-text-muted mt-2 text-sm">Automatic sync every hour plus manual refresh whenever needed.</p>
          </div>
          <div class="theme-surface rounded-2xl border p-4 text-left">
            <p class="theme-text-subtle text-xs uppercase tracking-[0.24em]">Accessibility</p>
            <p class="theme-text-muted mt-2 text-sm">High contrast surfaces, visible focus rings, and calmer visual hierarchy.</p>
          </div>
        </div>

        <!-- Error Alert -->
        <div
          v-if="error"
          class="theme-alert mb-6 flex w-full max-w-2xl items-start gap-3 rounded-2xl border p-4 shadow-[0_12px_30px_rgba(244,63,94,0.12)]"
        >
          <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <div class="flex-1">
            <p class="font-semibold">Error</p>
            <p class="text-sm">{{ error }}</p>
            <button
              class="mt-2 text-sm font-medium underline underline-offset-4 transition hover:opacity-85"
              @click="dismissError"
            >
              Dismiss
            </button>
          </div>
        </div>

        <!-- Form -->
        <CryptoForm
          :is-loading="isLoadingCryptos"
          :all-cryptos="allCryptos"
          :selected-cryptos="cryptoList"
          @submit="handleAddCrypto"
        />

        <!-- Initial Loading State -->
        <div v-if="isInitializing" class="py-10 text-center">
          <div class="flex flex-col items-center gap-4">
            <svg class="h-12 w-12 animate-spin text-sky-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="theme-text-muted text-lg">Initializing application...</p>
          </div>
        </div>

        <!-- Crypto List -->
        <div v-else class="w-full max-w-3xl">
          <CryptoList
            :crypto-list="cryptoList"
            :is-loading="isLoadingCryptos"
            @remove="removeCrypto"
          />
        </div>

        <!-- Last Update -->
        <div v-if="cryptoList.length > 0 && !isInitializing" class="theme-surface theme-text-muted mt-8 flex w-full max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-sm md:flex-row">
          <div class="text-center md:text-left">
            <p class="theme-text-main font-medium">Last updated: {{ lastUpdateTime }}</p>
            <p class="theme-text-subtle mt-1 text-xs uppercase tracking-[0.22em]">Automatic sync every 1 hour</p>
          </div>
          <button
            type="button"
            class="theme-secondary-btn inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isRefreshingPrices"
            @click="refreshCryptoPrices"
          >
            <svg v-if="isRefreshingPrices" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isRefreshingPrices ? "Refreshing..." : "Refresh now" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { fetchAllCryptos, searchCrypto, isDuplicateCrypto, fetchCryptoPrice } from "@/utils/cryptoApi.js";
import { useThemePreference } from "@/composables/useThemePreference";

useHead({ title: "Cryptocurrency Converter" });

const config = useRuntimeConfig();
const apiKey = config.public.cryptoApiKey;

const allCryptos = ref([]);
const cryptoList = ref([]);
const isLoadingCryptos = ref(false);
const isInitializing = ref(true);
const isRefreshingPrices = ref(false);
const error = ref("");
const lastUpdateTime = ref("");
let refreshInterval = null;

const { isDarkTheme, initializeTheme, toggleTheme } = useThemePreference();

const hasValidPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

const updateLastUpdateTime = () => {
  const now = new Date();
  lastUpdateTime.value = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const clearRefreshInterval = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

const setupAutoRefresh = () => {
  clearRefreshInterval();
  refreshInterval = setInterval(() => {
    refreshCryptoPrices();
  }, 3600000);
};

const refreshCryptoPrices = async () => {
  if (!cryptoList.value.length || isRefreshingPrices.value) {
    return;
  }

  try {
    isRefreshingPrices.value = true;

    const refreshedList = await Promise.all(
      cryptoList.value.map(async (crypto) => {
        if (!crypto || !crypto.asset_id) {
          return crypto;
        }

        const latestPrice = await fetchCryptoPrice(crypto.asset_id, apiKey);
        if (hasValidPrice(latestPrice)) {
          return { ...crypto, price_usd: Number(latestPrice) };
        }

        return crypto;
      })
    );

    cryptoList.value = refreshedList;
    updateLastUpdateTime();
  } catch (err) {
    console.warn("Failed to refresh crypto prices:", err);
  } finally {
    isRefreshingPrices.value = false;
  }
};

const handleError = (err) => {
  error.value = err.message || "An unexpected error occurred";
  console.error("Error:", err);
};

const dismissError = () => {
  error.value = "";
};

const loadAllCryptos = async () => {
  isLoadingCryptos.value = true;
  try {
    allCryptos.value = await fetchAllCryptos(apiKey);
  } catch (err) {
    throw new Error(`Failed to load cryptocurrencies: ${err.message}`);
  } finally {
    isLoadingCryptos.value = false;
  }
};

const removeCrypto = (cryptoName) => {
  cryptoList.value = cryptoList.value.filter((crypto) => crypto.name !== cryptoName);
  updateLastUpdateTime();
};

const handleAddCrypto = async (cryptoName) => {
  try {
    error.value = "";
    isLoadingCryptos.value = true;

    if (!cryptoName.trim()) throw new Error("Please enter a cryptocurrency name");
    if (isDuplicateCrypto(cryptoList.value, cryptoName)) throw new Error(`${cryptoName} is already in your list`);

    const foundCrypto = searchCrypto(cryptoName, allCryptos.value);
    if (!foundCrypto) throw new Error(`Cryptocurrency "${cryptoName}" not found. Please check the name and try again.`);

    const cryptoToAdd = { ...foundCrypto };

    // Keep API list price when available; otherwise try asset-specific lookup.
    if (!hasValidPrice(cryptoToAdd.price_usd)) {
      const price = await fetchCryptoPrice(cryptoToAdd.asset_id, apiKey);
      if (hasValidPrice(price)) {
        cryptoToAdd.price_usd = Number(price);
      }
    }

    cryptoList.value = [...cryptoList.value, cryptoToAdd];
    updateLastUpdateTime();
  } catch (err) {
    handleError(err);
  } finally {
    isLoadingCryptos.value = false;
  }
};

const initializeApp = async () => {
  try {
    isInitializing.value = true;
    error.value = "";

    if (!apiKey) throw new Error("API key not configured. Please check your .env file.");

    await loadAllCryptos();

    const bitcoin = searchCrypto("Bitcoin", allCryptos.value);
    if (bitcoin) {
      const initialBitcoin = { ...bitcoin };

      // Ensure initial card starts with a valid price.
      if (!hasValidPrice(initialBitcoin.price_usd)) {
        const price = await fetchCryptoPrice(initialBitcoin.asset_id, apiKey);
        if (hasValidPrice(price)) {
          initialBitcoin.price_usd = Number(price);
        }
      }

      cryptoList.value = [initialBitcoin];
    }

    setupAutoRefresh();
    updateLastUpdateTime();
  } catch (err) {
    handleError(err);
  } finally {
    isInitializing.value = false;
  }
};

onMounted(() => {
  initializeTheme();
  initializeApp();
});

onBeforeUnmount(() => {
  clearRefreshInterval();
});
</script>
