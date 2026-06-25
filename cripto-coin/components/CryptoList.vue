<template>
  <div class="w-full">
    <div v-if="isLoading && cryptoList.length === 0" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-4">
        <svg class="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-white text-lg">Loading cryptocurrencies...</p>
      </div>
    </div>

    <div v-else-if="cryptoList.length === 0" class="text-center py-8">
      <p class="text-white text-lg">No cryptocurrencies added yet. Search for one above!</p>
    </div>

    <TransitionGroup v-else name="crypto" tag="div" class="space-y-3">
      <CryptoCard
        v-for="crypto in cryptoList"
        :key="crypto.asset_id"
        :crypto="crypto"
        @remove="$emit('remove', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({
  cryptoList: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["remove"]);
</script>

<style scoped>
.crypto-enter-active,
.crypto-leave-active {
  transition: all 0.3s ease;
}

.crypto-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.crypto-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.crypto-move {
  transition: transform 0.3s ease;
}
</style>
