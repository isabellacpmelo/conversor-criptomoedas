<template>
  <form class="my-8 flex flex-col items-center gap-4" @submit.prevent="handleSubmit">
    <div class="relative w-full sm:w-72">
      <input
        v-model="cryptoInput"
        class="p-3 rounded placeholder-[#6096ba] text-center font-semibold border-2 border-gray-300 shadow-sm transition duration-100 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 focus:outline-none disabled:opacity-50 w-full"
        type="text"
        placeholder="Enter crypto name or symbol"
        autocomplete="off"
        :disabled="isLoading"
        :aria-expanded="showSuggestions"
        aria-autocomplete="list"
        aria-controls="crypto-suggestions"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.down.prevent="moveActiveSuggestion(1)"
        @keydown.up.prevent="moveActiveSuggestion(-1)"
        @keydown.esc="closeSuggestions"
      />

      <ul
        v-if="showSuggestions"
        id="crypto-suggestions"
        class="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-white text-left shadow-xl"
        role="listbox"
      >
        <li
          v-for="(suggestion, index) in suggestions"
          :key="`${suggestion.asset_id || 'asset'}-${suggestion.name || 'name'}-${index}`"
          class="cursor-pointer px-4 py-3 transition"
          :class="index === activeSuggestionIndex ? 'bg-[#2B5876] text-white' : 'text-slate-800 hover:bg-slate-100'"
          role="option"
          :aria-selected="index === activeSuggestionIndex"
          @mousedown.prevent="selectSuggestion(suggestion)"
          @mouseenter="activeSuggestionIndex = index"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ suggestion.name || suggestion.asset_id }}</p>
              <p class="truncate text-xs" :class="index === activeSuggestionIndex ? 'text-blue-100' : 'text-slate-500'">
                {{ suggestion.asset_id }}
              </p>
            </div>
            <span class="shrink-0 text-xs font-medium" :class="index === activeSuggestionIndex ? 'text-blue-100' : 'text-slate-500'">
              symbol
            </span>
          </div>
        </li>
      </ul>
    </div>

    <button
      class="font-bold bg-[#2B5876] hover:bg-[#1a3f54] disabled:bg-gray-500 text-white ring-1 ring-gray-700 px-8 py-2 rounded-full transition duration-200 ease-in-out transform hover:scale-105"
      type="submit"
      :disabled="isLoading || !cryptoInput.trim()"
    >
      <span v-if="isLoading" class="flex items-center gap-2">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Searching...
      </span>
      <span v-else>Add Crypto</span>
    </button>

    <p class="-mt-1 text-center text-xs text-blue-100/90">
      Type a name like Bitcoin or a symbol like BTC.
    </p>

    <p v-if="errorMessage" class="text-red-400 text-sm text-center">
      {{ errorMessage }}
    </p>
  </form>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { getCryptoSuggestions } from "@/utils/cryptoApi.js";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  allCryptos: {
    type: Array,
    default: () => [],
  },
  selectedCryptos: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["submit"]);

const cryptoInput = ref("");
const errorMessage = ref("");
const isFocused = ref(false);
const activeSuggestionIndex = ref(-1);

const suggestions = computed(() =>
  getCryptoSuggestions(cryptoInput.value, props.allCryptos, props.selectedCryptos)
);

const showSuggestions = computed(
  () => isFocused.value && cryptoInput.value.trim().length > 0 && suggestions.value.length > 0
);

const closeSuggestions = () => {
  isFocused.value = false;
  activeSuggestionIndex.value = -1;
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleBlur = () => {
  globalThis.setTimeout(() => {
    closeSuggestions();
  }, 100);
};

const selectSuggestion = (suggestion) => {
  emit("submit", suggestion.name || suggestion.asset_id || "");
  cryptoInput.value = "";
  errorMessage.value = "";
  closeSuggestions();
};

const moveActiveSuggestion = (direction) => {
  if (!showSuggestions.value) {
    isFocused.value = true;
  }

  if (!suggestions.value.length) {
    return;
  }

  const lastIndex = suggestions.value.length - 1;
  if (activeSuggestionIndex.value === -1 && direction > 0) {
    activeSuggestionIndex.value = 0;
    return;
  }

  if (activeSuggestionIndex.value === -1 && direction < 0) {
    activeSuggestionIndex.value = lastIndex;
    return;
  }

  activeSuggestionIndex.value += direction;

  if (activeSuggestionIndex.value > lastIndex) {
    activeSuggestionIndex.value = 0;
  }

  if (activeSuggestionIndex.value < 0) {
    activeSuggestionIndex.value = lastIndex;
  }
};

const handleSubmit = () => {
  errorMessage.value = "";

  if (!cryptoInput.value.trim()) {
    errorMessage.value = "Please enter a cryptocurrency name";
    return;
  }

  if (activeSuggestionIndex.value >= 0 && suggestions.value[activeSuggestionIndex.value]) {
    selectSuggestion(suggestions.value[activeSuggestionIndex.value]);
    return;
  }

  emit("submit", cryptoInput.value.trim());
  cryptoInput.value = "";
  closeSuggestions();
};

watch(
  () => props.isLoading,
  (newVal) => {
    if (!newVal) errorMessage.value = "";
  }
);

watch(cryptoInput, () => {
  activeSuggestionIndex.value = suggestions.value.length ? 0 : -1;
  if (cryptoInput.value.trim()) {
    isFocused.value = true;
  }
});
</script>
