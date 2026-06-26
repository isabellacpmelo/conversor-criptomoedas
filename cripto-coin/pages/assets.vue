<template>
  <div class="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
    <LoadingScreen v-if="isLoadingPage" />

    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl"></div>
      <div class="absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-6xl">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NuxtLink
          to="/"
          class="theme-secondary-btn inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
        >
          <span aria-hidden="true">←</span>
          Back to watchlist
        </NuxtLink>

        <button
          type="button"
          class="theme-secondary-btn rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
          @click="toggleTheme"
        >
          {{ isDarkTheme ? "Switch to light mode" : "Switch to dark mode" }}
        </button>
      </div>

      <header class="mb-8">
        <h1 class="theme-text-main text-3xl font-bold tracking-tight md:text-4xl">All Crypto Assets</h1>
        <p class="theme-text-muted mt-2 text-sm md:text-base">
          Explore the complete loaded market list with name, symbol, current price, and movement.
        </p>
      </header>

      <div
        v-if="error"
        class="theme-alert mb-6 flex w-full items-start gap-3 rounded-2xl border p-4 shadow-[0_12px_30px_rgba(244,63,94,0.12)]"
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
        </div>
      </div>

      <section class="theme-surface mb-6 rounded-2xl border px-4 py-4 md:px-5">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label for="asset-search" class="theme-text-subtle mb-2 block text-xs font-semibold uppercase tracking-[0.2em]">
              Search
            </label>
            <input
              id="asset-search"
              v-model="searchQuery"
              type="text"
              class="theme-input w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Name or symbol"
            />
          </div>

          <div>
            <label for="sort-by" class="theme-text-subtle mb-2 block text-xs font-semibold uppercase tracking-[0.2em]">
              Sort by
            </label>
            <select
              id="sort-by"
              v-model="sortBy"
              class="theme-input w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="change_desc">Highest gain</option>
              <option value="change_asc">Highest drop</option>
              <option value="price_desc">Price high to low</option>
              <option value="price_asc">Price low to high</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="symbol_asc">Symbol A-Z</option>
              <option value="symbol_desc">Symbol Z-A</option>
            </select>
          </div>

          <div>
            <label for="items-per-page" class="theme-text-subtle mb-2 block text-xs font-semibold uppercase tracking-[0.2em]">
              Rows per page
            </label>
            <select
              id="items-per-page"
              v-model.number="itemsPerPage"
              class="theme-input w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </section>

      <section class="theme-surface rounded-2xl border p-3 md:p-4">
        <div class="mb-3 flex items-center justify-between gap-2">
          <p class="theme-text-muted text-xs uppercase tracking-[0.2em]">
            Showing {{ visibleAssets.length }} of {{ filteredAssets.length }} assets
          </p>
          <p class="theme-text-subtle text-xs uppercase tracking-[0.2em]">Page {{ currentPage }} / {{ totalPages }}</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr class="theme-text-subtle border-b border-white/10 text-xs uppercase tracking-[0.18em]">
                <th class="px-3 py-3 font-semibold">Name</th>
                <th class="px-3 py-3 font-semibold">Symbol</th>
                <th class="px-3 py-3 font-semibold">Price (USD)</th>
                <th class="px-3 py-3 font-semibold">Movement</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="asset in visibleAssets"
                :key="asset.asset_id"
                class="border-b border-white/5 text-sm last:border-b-0"
              >
                <td class="theme-text-main px-3 py-3">{{ asset.name || asset.asset_id }}</td>
                <td class="theme-text-muted px-3 py-3 font-semibold uppercase tracking-[0.1em]">{{ asset.asset_id }}</td>
                <td class="theme-text-main px-3 py-3">${{ formatPrice(asset.price_usd) }}</td>
                <td class="px-3 py-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    :class="getMovementClasses(asset.market_change_percentage)"
                  >
                    <span aria-hidden="true">{{ getMovementIcon(asset.market_change_percentage) }}</span>
                    <span>{{ getMovementLabel(asset.market_change_percentage) }}</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            class="theme-secondary-btn rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage <= 1"
            @click="currentPage -= 1"
          >
            Previous
          </button>

          <button
            type="button"
            class="theme-secondary-btn rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage += 1"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { fetchAllCryptos, normalizeText } from "@/utils/cryptoApi.js";
import { useThemePreference } from "@/composables/useThemePreference";
import { useMarketSnapshotStorage } from "@/composables/useMarketSnapshotStorage";

useHead({ title: "All Assets | Cryptocurrency Converter" });

const config = useRuntimeConfig();
const apiKey = config.public.cryptoApiKey;

const isLoadingPage = ref(true);
const error = ref("");
const assets = ref([]);

const searchQuery = ref("");
const sortBy = ref("change_desc");
const currentPage = ref(1);
const itemsPerPage = ref(50);

const { isDarkTheme, initializeTheme, toggleTheme } = useThemePreference();
const { marketSnapshotStorage } = useMarketSnapshotStorage();

const hasValidPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

const buildMarketChangeList = (loadedAssets) => {
  const previousSnapshot = marketSnapshotStorage.read();
  const previousPriceMap = new Map(
    previousSnapshot.map((asset) => [String(asset.asset_id || "").toUpperCase(), Number(asset.price_usd)])
  );

  const mappedAssets = loadedAssets.map((asset) => {
    const currentPrice = Number(asset?.price_usd);
    const previousPrice = previousPriceMap.get(String(asset?.asset_id || "").toUpperCase());

    let marketChangePercentage = null;
    if (hasValidPrice(currentPrice) && hasValidPrice(previousPrice) && previousPrice > 0) {
      marketChangePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
    }

    return {
      ...asset,
      market_change_percentage: marketChangePercentage,
    };
  });

  marketSnapshotStorage.write(loadedAssets);
  return mappedAssets;
};

const loadAssets = async () => {
  if (!apiKey) {
    throw new Error("API key not configured. Please check your .env file.");
  }

  const loadedAssets = await fetchAllCryptos(apiKey);
  assets.value = buildMarketChangeList(loadedAssets);
};

const filteredAssets = computed(() => {
  const query = normalizeText(searchQuery.value);
  if (!query) {
    return assets.value;
  }

  return assets.value.filter((asset) => {
    const normalizedName = normalizeText(asset.name);
    const normalizedSymbol = normalizeText(asset.asset_id);
    return normalizedName.includes(query) || normalizedSymbol.includes(query);
  });
});

const sortedAssets = computed(() => {
  const list = [...filteredAssets.value];

  const getChange = (asset) => (Number.isFinite(Number(asset.market_change_percentage)) ? Number(asset.market_change_percentage) : 0);
  const getPrice = (asset) => (hasValidPrice(asset.price_usd) ? Number(asset.price_usd) : 0);
  const getName = (asset) => normalizeText(asset.name || asset.asset_id || "");
  const getSymbol = (asset) => normalizeText(asset.asset_id || "");

  switch (sortBy.value) {
    case "change_asc":
      return list.sort((a, b) => getChange(a) - getChange(b));
    case "price_desc":
      return list.sort((a, b) => getPrice(b) - getPrice(a));
    case "price_asc":
      return list.sort((a, b) => getPrice(a) - getPrice(b));
    case "name_asc":
      return list.sort((a, b) => getName(a).localeCompare(getName(b)));
    case "name_desc":
      return list.sort((a, b) => getName(b).localeCompare(getName(a)));
    case "symbol_asc":
      return list.sort((a, b) => getSymbol(a).localeCompare(getSymbol(b)));
    case "symbol_desc":
      return list.sort((a, b) => getSymbol(b).localeCompare(getSymbol(a)));
    case "change_desc":
    default:
      return list.sort((a, b) => getChange(b) - getChange(a));
  }
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedAssets.value.length / itemsPerPage.value)));

const visibleAssets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedAssets.value.slice(start, start + itemsPerPage.value);
});

const formatPrice = (price) => {
  if (!hasValidPrice(price)) {
    return "N/A";
  }
  return Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getMovementClasses = (change) => {
  if (!Number.isFinite(Number(change))) {
    return "bg-slate-500/20 text-slate-300";
  }

  if (Number(change) > 0) {
    return "bg-emerald-500/15 text-emerald-300";
  }

  if (Number(change) < 0) {
    return "bg-rose-500/15 text-rose-300";
  }

  return "bg-slate-500/20 text-slate-300";
};

const getMovementIcon = (change) => {
  if (!Number.isFinite(Number(change))) {
    return "●";
  }

  if (Number(change) > 0) {
    return "▲";
  }

  if (Number(change) < 0) {
    return "▼";
  }

  return "●";
};

const getMovementLabel = (change) => {
  if (!Number.isFinite(Number(change))) {
    return "No base";
  }

  if (Number(change) > 0) {
    return `Up ${Math.abs(Number(change)).toFixed(2)}%`;
  }

  if (Number(change) < 0) {
    return `Down ${Math.abs(Number(change)).toFixed(2)}%`;
  }

  return "Stable";
};

watch([searchQuery, sortBy, itemsPerPage], () => {
  currentPage.value = 1;
});

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages;
  }
});

onMounted(async () => {
  initializeTheme();

  try {
    await loadAssets();
  } catch (err) {
    error.value = err.message || "An unexpected error occurred while loading assets.";
  } finally {
    isLoadingPage.value = false;
  }
});
</script>