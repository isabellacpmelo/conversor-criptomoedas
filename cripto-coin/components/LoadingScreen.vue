<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-[#050b15]">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-[-6rem] top-12 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl"></div>
      <div class="absolute bottom-[-7rem] right-[-5rem] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"></div>
    </div>

    <div class="relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/10 bg-slate-950/70 px-8 py-10 text-center shadow-[0_20px_70px_rgba(2,6,23,0.6)] backdrop-blur-md">
      <img
        src="@/assets/img/criptomoedas.png"
        alt="Loading cryptocurrency data"
        class="h-16 w-16 animate-pulse drop-shadow-[0_0_26px_rgba(56,189,248,0.45)]"
      />

      <h2 class="mt-6 text-xl font-bold text-slate-100">Tidying up your crypto room</h2>
      <p class="mt-2 text-sm leading-6 text-slate-400">
        Fetching market data and restoring your selected assets.
      </p>

      <div class="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div class="h-full w-1/3 animate-[loading-slide_1.2s_ease-in-out_infinite] rounded-full bg-sky-300"></div>
      </div>

      <p class="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">Loading...</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes loading-slide {
  0% {
    transform: translateX(-115%);
  }
  50% {
    transform: translateX(120%);
  }
  100% {
    transform: translateX(330%);
  }
}
</style>