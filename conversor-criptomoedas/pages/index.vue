<template>
    <div class="w-1/2 mx-auto my-20 p-20 bg-slate-50">
      <img class="w-35 my-5" src="https://img.icons8.com/external-lylac-kerismaker/64/000000/external-Bitcoin-crypto-lylac-kerismaker.png"/>
      <h1 class="text-5xl font-bold text-indigo-800">Cryptocurrency Converter</h1>
      <article class="my-20">
        <h2 class="text-3xl font-semibold mb-3">Welcome to the cryptocurrency price converter!</h2>
        <p class="mb-3">Use to find out the current price of your cryptocurrency in dollars (USD).</p>
      </article>
      
      <form class="my-10 flex">
        <p class="px-3 py-2 font-semibold">Enter which cryptocurrency you want to convert:</p>
          <input 
            class = "px-2 py-2 text-black placeholder-gray-400  bg-violet-50 border border-gray-300 rounded shadow-sm transition duration-100 ease-in-outfocus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50" 
            type="text" 
            placeholder="Crypto"    
            v-model="newCrypto"
            autocomplete="on"
          >
          <button v-on:click="addCrypto" class="mx-5 font-bold bg-indigo-700 hover:bg-violet-500 text-white ring-2 px-8 rounded-full">OK</button>
      </form>
      <div v-for="data in dataList" :key = "data.data_id" class="bg-indigo-50 p-6 flex space-x-6">
        <h1 class="font-bold"> {{ data.name }} </h1>
        <h2> {{ data.data_id }} </h2>
        <h2 class="font-semibold"> {{data.price_usd}} <strong>USD</strong></h2>
        <a href="" class=" font-semibold text-violet-800 hover:text-violet-500" @click.stop.prevent="removeCrypto(data.name)">Remove</a>       
      </div>
    </div>
</template>

<script>
  export default {
    name: 'IndexPage',
    head() {
      return {
        title: 'Cryptocurrency Converter',
      }
    },
    data() {
      return {
        apiKey: '649F900E-89B7-4C1F-85C2-D26F57C04210',
        timer: '',
        allDataList:[],
        dataList:[],
        newCrypto:null,
      };
    },
    
    async created(){
      const headers = { "X-CoinAPI-Key":this.apiKey };
      const response = await fetch("https://rest.coinapi.io/v1/assets", { headers });
      const data = await response.json();
      this.allDataList = data;
      this.dataList = [this.allDataList.find(e => e.name === "Bitcoin")]; 
      console.log(this.dataList);
      this.fetchData();  
      this.timer = setInterval(this.fetchData, 3000);
    },

    methods: {
      addCrypto(){
        const response = this.allDataList.find(e => e.name === this.newCrypto)
        if (response == null){ 
          return alert("No coins with this name were found")
        }
        else {
          this.dataList = [...this.dataList, response] 
        }
      },
      removeCrypto(name){
        this.dataList = this.dataList.filter(data => data.name !== name)
      },
      async fetchData() {  
        const res = await fetch("https://yesno.wtf/api");  
        const data = await res.json();  
        this.answer = data;  
    },  
      cancelAutoUpdate() {  
        clearInterval(this.timer);  
      },   
    },
    beforeDestroy() {  
      this.cancelAutoUpdate();  
    },
  }
</script>
