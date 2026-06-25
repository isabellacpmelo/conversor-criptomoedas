<template>
  <div class="bg-[#708d81] mb-3 rounded-lg w-full py-4 px-6 flex flex-col sm:flex-row justify-between items-center text-white hover:bg-[#5f7a6f] transition duration-200 ease-in-out">
    <div class="flex-1">
      <strong class="block text-lg">{{ crypto.name }}</strong>
      <span class="text-sm text-gray-200">{{ crypto.asset_id }}</span>
    </div>
    <div class="text-center my-3 sm:my-0 sm:mx-4">
      <strong class="text-2xl text-[#9ceaef]">${{ formatPrice(crypto.price_usd) }}</strong>
    </div>
    <button
      class="font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition duration-200 ease-in-out"
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
    validator: (obj) => obj.name && obj.asset_id && typeof obj.price_usd === "number",
  },
});

const emit = defineEmits(["remove"]);

const formatPrice = (price) => Number(price).toFixed(2);
</script>
