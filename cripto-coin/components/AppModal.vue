<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-sm rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.65)] ring-1 ring-sky-300/10">
      <div class="mb-4 inline-flex rounded-full border border-rose-400/20 bg-rose-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-200">
        Validation
      </div>
      <h3 :id="titleId" class="text-lg font-bold text-slate-50">{{ title }}</h3>
      <p class="mt-3 text-sm leading-6 text-slate-300">{{ message }}</p>
      <div class="mt-5 flex justify-end">
        <button
          type="button"
          class="rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          @click="$emit('close')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch } from "vue";

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

const emit = defineEmits(["close"]);

const handleEscKey = (event) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      return;
    }

    document.removeEventListener("keydown", handleEscKey);
  }
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscKey);
});
</script>