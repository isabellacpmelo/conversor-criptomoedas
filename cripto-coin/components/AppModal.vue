<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
      <h3 :id="titleId" class="text-lg font-bold text-slate-900">{{ title }}</h3>
      <p class="mt-3 text-sm text-slate-700">{{ message }}</p>
      <div class="mt-5 flex justify-end">
        <button
          type="button"
          class="rounded-lg bg-[#2B5876] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a3f54]"
          @click="$emit('close')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Aviso",
  },
  message: {
    type: String,
    default: "",
  },
  confirmText: {
    type: String,
    default: "OK",
  },
  titleId: {
    type: String,
    default: "app-modal-title",
  },
});

defineEmits(["close"]);
</script>