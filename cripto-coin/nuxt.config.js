// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],

  css: ["@/assets/css/main.css"],

  runtimeConfig: {
    public: {
      cryptoApiKey: "", // Sobrescrito automaticamente por NUXT_PUBLIC_CRYPTO_API_KEY
    },
  },

  app: {
    head: {
      title: "Cryptocurrency Converter",
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Real-time cryptocurrency price converter using CoinAPI" },
        { name: "format-detection", content: "telephone=no" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  compatibilityDate: "2024-11-01",
});
