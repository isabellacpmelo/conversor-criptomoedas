<template>
  <div class="bg-gradient-to-r from-[#2B5876] to-[#4E4376] w-full min-h-screen py-16 px-6">
    <div class="mx-auto max-w-4xl rounded-lg py-14 px-6 md:px-20 bg-[#9ceaef] bg-opacity-30">
      <div class="flex flex-col items-center">
        <!-- Header -->
        <img class="w-20 mb-6" src="@/assets/img/criptomoedas.png" alt="Cryptocurrency" />
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
          Cryptocurrency Converter
        </h1>

        <!-- Description -->
        <article class="text-white text-center mb-8 max-w-2xl">
          <h2 class="text-2xl md:text-3xl font-semibold mb-4">
            Welcome to the cryptocurrency price converter!
          </h2>
          <p class="text-base md:text-lg">
            Use to find out the current price of your favorite cryptocurrency in dollars (USD).
          </p>
        </article>

        <!-- Error Alert -->
        <div
          v-if="error"
          class="w-full max-w-md mb-6 p-4 bg-red-600 text-white rounded-lg flex items-start gap-3"
        >
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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
              class="mt-2 text-sm underline hover:text-gray-200 transition"
              @click="dismissError"
            >
              Dismiss
            </button>
          </div>
        </div>

        <!-- Form -->
        <CryptoForm :is-loading="isLoadingCryptos" @submit="handleAddCrypto" />

        <!-- Initial Loading State -->
        <div v-if="isInitializing" class="text-center py-8">
          <div class="flex flex-col items-center gap-4">
            <svg class="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-white text-lg">Initializing application...</p>
          </div>
        </div>

        <!-- Crypto List -->
        <div v-else class="w-full max-w-md">
          <CryptoList
            :crypto-list="cryptoList"
            :is-loading="isLoadingCryptos"
            @remove="removeCrypto"
          />
        </div>

        <!-- Last Update -->
        <div v-if="cryptoList.length > 0 && !isInitializing" class="mt-8 text-center text-sm text-gray-300">
          <p>Last updated: {{ lastUpdateTime }}</p>
          <p class="text-xs mt-1">Updates every 60 seconds</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { fetchAllCryptos, searchCrypto, isDuplicateCrypto } from "@/utils/cryptoApi.js";

useHead({ title: "Cryptocurrency Converter" });

const config = useRuntimeConfig();
const apiKey = config.public.cryptoApiKey;

const allCryptos = ref([]);
const cryptoList = ref([]);
const isLoadingCryptos = ref(false);
const isInitializing = ref(true);
const error = ref("");
const lastUpdateTime = ref("");
let refreshInterval = null;

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
    updateLastUpdateTime();
  }, 60000);
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

    cryptoList.value = [...cryptoList.value, foundCrypto];
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

    if (!apiKey) throw new Error("API key not configured. Please check your .env.local file.");

    await loadAllCryptos();

    const bitcoin = searchCrypto("Bitcoin", allCryptos.value);
    if (bitcoin) cryptoList.value = [bitcoin];

    setupAutoRefresh();
    updateLastUpdateTime();
  } catch (err) {
    handleError(err);
  } finally {
    isInitializing.value = false;
  }
};

onMounted(() => {
  initializeApp();
});

onBeforeUnmount(() => {
  clearRefreshInterval();
});
</script>
