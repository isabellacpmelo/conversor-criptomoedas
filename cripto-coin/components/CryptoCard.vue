<template>
  <div class="mb-3 flex w-full flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-900/80 px-5 py-5 text-slate-100 shadow-[0_16px_40px_rgba(2,6,23,0.35)] transition duration-200 ease-in-out hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex min-w-0 flex-1 items-center gap-4">
      <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-400/10 text-sm font-bold uppercase tracking-[0.18em] text-sky-200">
        {{ crypto.asset_id.slice(0, 3) }}
      </div>
      <div class="min-w-0">
        <strong class="block truncate text-lg text-slate-50">{{ crypto.name }}</strong>
        <span class="text-sm uppercase tracking-[0.18em] text-slate-400">{{ crypto.asset_id }}</span>
      </div>
    </div>
    <div class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-center sm:mx-4 sm:min-w-[170px]">
      <p class="text-[11px] uppercase tracking-[0.22em] text-slate-500">Current price</p>
      <strong class="mt-1 block text-2xl text-sky-200">${{ formatPrice(crypto.price_usd) }}</strong>
      <p
        class="mt-2 inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
        :class="trendClasses"
      >
        <span aria-hidden="true">{{ trendIcon }}</span>
        <span>{{ trendLabel }}</span>
      </p>
    </div>
    <button
      class="rounded-xl border border-rose-400/20 bg-rose-500/12 px-4 py-2 font-semibold text-rose-100 transition duration-200 ease-in-out hover:bg-rose-500/20"
      @click="$emit('remove', crypto.asset_id)"
    >
      Remove
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  crypto: {
    type: Object,
    required: true,
    validator: (obj) => obj && obj.name && obj.asset_id,
  },
});

const emit = defineEmits(["remove"]);

const hasChangeValue = computed(
  () => Number.isFinite(Number(props.crypto?.price_change_percentage_24h))
);

const trendValue = computed(() => props.crypto?.price_trend || "neutral");

const trendIcon = computed(() => {
  if (trendValue.value === "up") {
    return "▲";
  }
  if (trendValue.value === "down") {
    return "▼";
  }
  return "●";
});

const trendLabel = computed(() => {
  if (trendValue.value === "up" && hasChangeValue.value) {
    return `UP ${Math.abs(Number(props.crypto.price_change_percentage_24h)).toFixed(2)}%`;
  }

  if (trendValue.value === "down" && hasChangeValue.value) {
    return `DOWN ${Math.abs(Number(props.crypto.price_change_percentage_24h)).toFixed(2)}%`;
  }

  return "STABLE";
});

const trendClasses = computed(() => {
  if (trendValue.value === "up") {
    return "bg-emerald-500/15 text-emerald-300";
  }

  if (trendValue.value === "down") {
    return "bg-rose-500/15 text-rose-300";
  }

  return "bg-slate-500/20 text-slate-300";
});

const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return "N/A";
  }
  return Number(price).toFixed(2);
};
</script>
