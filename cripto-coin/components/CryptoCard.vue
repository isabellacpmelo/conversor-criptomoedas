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
    </div>
    <button
      class="rounded-xl border border-rose-400/20 bg-rose-500/12 px-4 py-2 font-semibold text-rose-100 transition duration-200 ease-in-out hover:bg-rose-500/20"
      @click="$emit('remove', crypto.name)"
    >
      Remove
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  crypto: {
    type: Object,
    required: true,
    validator: (obj) => obj && obj.name && obj.asset_id,
  },
});

const emit = defineEmits(["remove"]);

const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return "N/A";
  }
  return Number(price).toFixed(2);
};
</script>
