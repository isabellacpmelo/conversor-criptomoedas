<template>
  <form class="my-8 flex flex-col items-center gap-4" @submit.prevent="handleSubmit">
    <input
      v-model="cryptoInput"
      class="p-3 rounded placeholder-[#6096ba] text-center font-semibold border-2 border-gray-300 shadow-sm transition duration-100 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 focus:outline-none disabled:opacity-50 w-full sm:w-64"
      type="text"
      placeholder="Enter crypto name (e.g., Bitcoin)"
      autocomplete="on"
      :disabled="isLoading"
    />
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
    <p v-if="errorMessage" class="text-red-400 text-sm text-center">
      {{ errorMessage }}
    </p>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit"]);

const cryptoInput = ref("");
const errorMessage = ref("");

const handleSubmit = () => {
  errorMessage.value = "";

  if (!cryptoInput.value.trim()) {
    errorMessage.value = "Please enter a cryptocurrency name";
    return;
  }

  emit("submit", cryptoInput.value.trim());
  cryptoInput.value = "";
};

watch(
  () => props.isLoading,
  (newVal) => {
    if (!newVal) errorMessage.value = "";
  }
);
</script>
