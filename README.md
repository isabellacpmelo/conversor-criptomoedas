# Cripto Coin

<div align="left">
<a href="https://cryptor-converter.netlify.app/"><img height="355em" alt="Cripto Coin" src="https://user-images.githubusercontent.com/42364778/212822345-1e628d9f-63a7-4464-bbe2-cb8454335909.png" /></a>
</div>
</br>
<a href="https://cryptor-converter.netlify.app/">Clique aqui para acessar o projeto</a>

## Sobre o projeto

Cripto Coin é um conversor e watchlist de criptomoedas em tempo real construído com Vue.js 3 e Nuxt.js 3. Pesquise ativos por nome ou símbolo, monte uma lista personalizada de acompanhamento, visualize variações de preço e monitore os maiores movimentos do mercado — tudo com atualização automática e suporte a tema claro/escuro.

### Screenshots

#### Página Principal

<img height="330em" alt="Home Page Print Screen" src="https://user-images.githubusercontent.com/42364778/212822345-1e628d9f-63a7-4464-bbe2-cb8454335909.png" />

#### Todos os Ativos

<img height="330em" alt="All Assets Page Print Screen" src="https://user-images.githubusercontent.com/42364778/212822345-1e628d9f-63a7-4464-bbe2-cb8454335909.png" />

### Tecnologias

- [Vue.js 3](https://vuejs.org/)
- [Nuxt.js 3](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [CoinAPI.io](https://www.coinapi.io/)

### IDE Recomendada

[VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (desabilite o Vetur).

## Arquitetura

### Fluxo de dados

```
┌──────────────┐   busca/refresh   ┌─────────────────┐   resposta JSON   ┌────────────┐
│  CryptoForm  │ ────────────────► │  /api/crypto/*  │ ────────────────► │  CoinAPI   │
│  (watchlist) │                   │  (Nuxt server)  │                   │  REST v1   │
└──────────────┘                   └─────────────────┘                   └────────────┘
       │                                                                        
       ▼ resultado                                                              
┌──────────────┐   snapshot   ┌──────────────────────────┐                    
│  CryptoList  │ ──────────►  │  useMarketSnapshotStorage │  (localStorage)   
│  CryptoCard  │              └──────────────────────────┘                    
└──────────────┘                                                               
       │                                                                        
       ▼ histórico                                                              
┌───────────────────────────┐                                                  
│  useCryptoHistoryStorage  │  (localStorage)                                  
└───────────────────────────┘                                                  
```

### Política de Atualização

| Gatilho         | Comportamento                                      |
|-----------------|----------------------------------------------------|
| Carga inicial   | Restaura watchlist e snapshot do localStorage      |
| Auto-refresh    | Sincronização automática a cada 1 hora             |
| Refresh manual  | Botão disponível a qualquer momento                |
| Rate limit 429  | Erro exibido com orientação ao usuário             |

### Estrutura do Projeto

```
📦cripto-coin
 ┣ 📂assets
 ┃ ┣ 📂css
 ┃ ┃ ┗ 📜main.css          # Estilos globais e tokens de tema
 ┃ ┗ 📂img                 # Ícones e imagens do app
 ┣ 📂components
 ┃ ┣ 📜AppModal.vue         # Modal genérico reutilizável
 ┃ ┣ 📜CryptoCard.vue       # Card de ativo individual com preço e variação
 ┃ ┣ 📜CryptoForm.vue       # Campo de busca com autocomplete e navegação por teclado
 ┃ ┣ 📜CryptoList.vue       # Lista dos ativos monitorados
 ┃ ┣ 📜LoadingScreen.vue    # Overlay de carregamento
 ┃ ┗ 📜TopMoversWidget.vue  # Widget com top 3 maiores altas e baixas
 ┣ 📂composables
 ┃ ┣ 📜useCryptoHistoryStorage.js    # Persistência do histórico de ativos no localStorage
 ┃ ┣ 📜useMarketSnapshotStorage.js   # Persistência do snapshot de mercado no localStorage
 ┃ ┗ 📜useThemePreference.js         # Gerenciamento de preferência de tema (dark/light)
 ┣ 📂pages
 ┃ ┣ 📜index.vue    # Página principal — watchlist e conversor
 ┃ ┗ 📜assets.vue   # Página de listagem completa de ativos
 ┣ 📂server
 ┃ ┣ 📂api
 ┃ ┃ ┗ 📂crypto
 ┃ ┃   ┣ 📜asset.get.js    # Endpoint: GET /api/crypto/asset
 ┃ ┃   ┗ 📜assets.get.js   # Endpoint: GET /api/crypto/assets
 ┃ ┗ 📂utils
 ┃   ┗ 📜coinApi.js   # Cliente HTTP para a CoinAPI (fetch + timeout + tratamento de erros)
 ┣ 📂utils
 ┃ ┣ 📜cryptoApi.js          # Helpers de chamada de API no lado do cliente
 ┃ ┗ 📜cryptoMarket.js       # Utilitários de formatação e cálculo de mercado
 ┣ 📜nuxt.config.js
 ┣ 📜package.json
 ┗ 📜tailwind.config.js
```

### Principais Decisões de Design

- **Server routes do Nuxt**: As chamadas à CoinAPI passam pelo servidor (`/server/api/`) para manter a API Key fora do bundle do cliente
- **localStorage como cache**: Snapshots de mercado e histórico de ativos são persistidos localmente para reduzir requisições desnecessárias à API
- **Top Movers**: Calculado comparando o snapshot atual com o anterior, exibindo as 3 maiores altas e baixas
- **Autocomplete com teclado**: Navegação por seta ↑↓, confirmação com Enter e fechamento com Esc, com atributos ARIA para acessibilidade
- **Tema dark/light**: Preferência salva no localStorage e aplicada via classes CSS globais
- **Tratamento de rate limit**: Erros 429 da CoinAPI são capturados e exibidos ao usuário com mensagem clara

## Como executar

### Pré-requisitos

- Node.js >= 18
- npm >= 9

### Variáveis de ambiente

Crie um arquivo `.env` na raiz de `cripto-coin/` com sua chave da [CoinAPI](https://www.coinapi.io/):

```env
NUXT_CRYPTO_API_KEY=sua_chave_aqui
```

> A CoinAPI oferece um plano gratuito com 100 requisições por dia. Ao exceder esse limite, a aplicação exibirá um aviso de rate limit (erro 429).

### Instalação

```bash
cd cripto-coin
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Build de produção

```bash
npm run build
```

```bash
npm run start
```

### Geração estática

```bash
npm run generate
```
