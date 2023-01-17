<template>
  <div
    class="bg-gradient-to-r from-[#2B5876] to-[#4E4376] w-full py-16 px-6 h-screen"
  >
    <div
      class="mx-auto h-full container rounded-lg py-14 px-20 bg-[#9ceaef] bg-opacity-30"
    >
      <div class="flex flex-col items-center">
        <img class="w-20" src="@/assets/img/criptomoedas.png" />
        <h1 class="text-5xl font-bold text-white my-14">
          Cryptocurrency Converter
        </h1>
        <article class="text-white text-center">
          <h2 class="text-3xl font-semibold">
            Welcome to the cryptocurrency price converter!
          </h2>
          <p class="my-4 text-lg">
            Use to find out the current price of your favorite cryptocurrency in
            dollars (USD).
          </p>
        </article>

        <form class="my-6 flex flex-col items-center">
          <input
            v-model="newCrypto"
            class="mb-4 p-2 rounded placeholder-[#6096ba] text-center font-semibold border border-gray-300 shadow-sm transition duration-100 ease-in-outfocus:border-blue-500 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 focus:outline-none disabled:opacity-50"
            type="text"
            placeholder="Crypto"
            autocomplete="on"
          />
          <button
            class="mx-5 font-bold bg-[#2B5876] hover:bg-gray-700 text-white ring-1 ring-gray-700 px-6 py-2 rounded-full"
            @click.stop.prevent="addCrypto()"
          >
            OK
          </button>
        </form>
        <div
          v-for="data in dataList"
          :key="data.data_id"
          class="bg-[#708d81] mb-1 rounded-lg w-1/3 py-4 px-6 flex justify-around text-white"
        >
          <!-- <img class="w-20" :src="`${data.id_icon}.png`" /> -->
          <strong> {{ data.name }}</strong>
          <span>{{ data.asset_id }}</span>
          <strong> ${{ data.price_usd.toFixed(2) }} </strong>
          <a
            class="font-semibold text-white hover:text-[#4E4376]"
            @click.stop.prevent="removeCrypto(data.name)"
            >Remove</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      // apiKey: "E221F8BF-3AF3-4253-81DD-AB663690A02A",
      apiKey: "649F900E-89B7-4C1F-85C2-D26F57C04210",
      // apiKey: 'CCFAE85E-633E-4207-8D0E-0A49FB2D59B5',
      allDataList: [],
      dataList: [],
      newCrypto: null,
    };
  },

  head() {
    return {
      title: "Cryptocurrency Converter",
    };
  },

  async created() {
    const headers = { "X-CoinAPI-Key": this.apiKey };
    const response = await fetch("https://rest.coinapi.io/v1/assets", {
      headers,
    });
    const data = await response.json();
    this.allDataList = data;
    this.dataList = [this.allDataList.find((e) => e.name === "Bitcoin")];
  },

  methods: {
    addCrypto() {
      const currency = this.allDataList.find(
        (e) => e.name.toLowerCase() === this.newCrypto.toLowerCase()
      );
      if (currency == null) {
        return alert("No cryptocurrency with this name was found");
      } else {
        this.dataList = [...this.dataList, currency];
      }
      setInterval(this.dataList, 30000);
    },
    removeCrypto(name) {
      this.dataList = this.dataList.filter((data) => data.name !== name);
    },
  },
};
</script>
