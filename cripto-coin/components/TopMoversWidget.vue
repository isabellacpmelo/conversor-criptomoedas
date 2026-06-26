<template>
  <section class="theme-surface w-full rounded-2xl border px-4 py-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h3 class="theme-text-main text-sm font-semibold uppercase tracking-[0.2em]">Top movers</h3>
      <span class="theme-text-subtle text-[11px] uppercase tracking-[0.2em]">Loaded assets</span>
    </div>

    <div v-if="!hasMovers" class="theme-text-subtle text-xs leading-5">
      We need one previous snapshot to compare all loaded assets.
    </div>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div class="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-3">
        <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Top 3 up</p>
        <ul class="space-y-1.5">
          <li
            v-for="crypto in topGainers"
            :key="`up-${crypto.asset_id}`"
            class="flex items-center justify-between text-xs"
          >
            <span class="theme-text-main truncate pr-2">{{ crypto.asset_id }}</span>
            <span class="font-semibold text-emerald-300">+{{ formatChange(crypto.market_change_percentage) }}%</span>
          </li>
        </ul>
      </div>

      <div class="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-3">
        <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-300">Top 3 down</p>
        <ul class="space-y-1.5">
          <li
            v-for="crypto in topLosers"
            :key="`down-${crypto.asset_id}`"
            class="flex items-center justify-between text-xs"
          >
            <span class="theme-text-main truncate pr-2">{{ crypto.asset_id }}</span>
            <span class="font-semibold text-rose-300">-{{ formatChange(Math.abs(crypto.market_change_percentage)) }}%</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  assets: {
    type: Array,
    default: () => [],
  },
});

const validChanges = computed(() =>
  props.assets.filter(
    (crypto) => Number.isFinite(Number(crypto?.market_change_percentage)) && Number(crypto.market_change_percentage) !== 0
  )
);

const topGainers = computed(() =>
  validChanges.value
    .filter((crypto) => Number(crypto.market_change_percentage) > 0)
    .sort((left, right) => Number(right.market_change_percentage) - Number(left.market_change_percentage))
    .slice(0, 3)
);

const topLosers = computed(() =>
  validChanges.value
    .filter((crypto) => Number(crypto.market_change_percentage) < 0)
    .sort((left, right) => Number(left.market_change_percentage) - Number(right.market_change_percentage))
    .slice(0, 3)
);

const hasMovers = computed(() => topGainers.value.length > 0 || topLosers.value.length > 0);

const formatChange = (value) => Number(value).toFixed(2);
</script>