<template>
  <div>
    <form class="mb-10 w-full max-w-3xl rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_50px_rgba(2,6,23,0.35)] backdrop-blur md:p-6" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-4 md:flex-row md:items-end">
        <div class="relative flex-1">
          <label for="crypto-search" class="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Search cryptocurrency
          </label>
        <input
          id="crypto-search"
          ref="searchInputRef"
          v-model="cryptoInput"
          class="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-4 text-left text-base font-medium text-slate-100 shadow-inner shadow-slate-950/40 transition duration-150 ease-in-out placeholder:text-slate-500 focus:border-sky-300/50 focus:ring-4 focus:ring-sky-300/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
          class="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 text-left shadow-[0_20px_45px_rgba(2,6,23,0.65)] backdrop-blur"
          role="listbox"
        >
          <li
            v-for="(suggestion, index) in suggestions"
            :key="`${suggestion.asset_id || 'asset'}-${suggestion.name || 'name'}-${index}`"
            class="cursor-pointer px-4 py-3 transition"
            :class="index === activeSuggestionIndex ? 'bg-sky-400/15 text-slate-50' : 'text-slate-200 hover:bg-white/5'"
            role="option"
            :aria-selected="index === activeSuggestionIndex"
            @mousedown.prevent="selectSuggestion(suggestion)"
            @mouseenter="activeSuggestionIndex = index"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <p class="truncate font-semibold">{{ suggestion.name || suggestion.asset_id }}</p>
                <p class="truncate text-xs" :class="index === activeSuggestionIndex ? 'text-sky-100' : 'text-slate-500'">
                  {{ suggestion.asset_id }}
                </p>
              </div>
              <span class="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em]" :class="index === activeSuggestionIndex ? 'border-sky-300/20 text-sky-100' : 'text-slate-500'">
                symbol
              </span>
            </div>
          </li>
        </ul>
      </div>

      <button
        class="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-sky-400 px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_14px_30px_rgba(56,189,248,0.25)] transition duration-200 ease-in-out hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 md:min-w-[190px]"
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
      </div>

      <div class="mt-4 flex flex-col gap-2 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
          Type a name like Bitcoin or a symbol like BTC.
        </p>

        <p class="text-xs text-slate-500">
          Only assets from the suggestion list can be added.
        </p>
      </div>

      <p v-if="errorMessage" class="mt-3 text-sm text-rose-300">
        {{ errorMessage }}
      </p>
    </form>

    <AppModal
      :is-open="showNotFoundModal"
      title="Moeda nao encontrada"
      message="A moeda informada nao existe na lista de sugestoes. Selecione uma opcao exibida no dropdown."
      confirm-text="Entendi"
      title-id="crypto-not-found-modal-title"
      @close="closeNotFoundModal"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import AppModal from "@/components/AppModal.vue";
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
const showNotFoundModal = ref(false);
const searchInputRef = ref(null);

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

const openNotFoundModal = () => {
  showNotFoundModal.value = true;
};

const closeNotFoundModal = async () => {
  showNotFoundModal.value = false;
  await nextTick();
  searchInputRef.value?.focus();
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

const findExactSuggestedCrypto = () => {
  const normalizedInput = cryptoInput.value.trim().toLowerCase();
  if (!normalizedInput) {
    return null;
  }

  return (
    suggestions.value.find((suggestion) => {
      const symbol = String(suggestion.asset_id || "").trim().toLowerCase();
      const name = String(suggestion.name || "").trim().toLowerCase();
      return symbol === normalizedInput || name === normalizedInput;
    }) || null
  );
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

  const exactSuggestedCrypto = findExactSuggestedCrypto();
  if (!exactSuggestedCrypto) {
    openNotFoundModal();
    return;
  }

  selectSuggestion(exactSuggestedCrypto);
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
