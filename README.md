<h1 align="center">
  <img src="docs/images/readme/agentpay-logo.jpg" alt="AgentPay logo" width="84" />
  <br />
  AgentPay
</h1>

<p align="center">
  <strong>Open-source x402 payment routing for AI agents on Algorand.</strong><br />
  One paid request in. Policy-based AI routing and on-chain provider settlement out.
</p>

<p align="center">
  <a href="https://agentpay-teal.vercel.app">Live app</a> ·
  <a href="#quickstart">Quickstart</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="https://dev.algorand.co/resources/x402-on-algorand/">x402 on Algorand</a>
</p>

<p align="center">
  <img alt="Algorand Testnet" src="https://img.shields.io/badge/network-Algorand%20Testnet-00A3FF?style=flat-square" />
  <img alt="x402" src="https://img.shields.io/badge/payments-x402-10B981?style=flat-square" />
  <img alt="USDC" src="https://img.shields.io/badge/settlement-USDC-2775CA?style=flat-square" />
  <img alt="Agent clients" src="https://img.shields.io/badge/agent%20clients-supported-00C853?style=flat-square" />
</p>

## What is AgentPay

AgentPay is an OpenAI-style agent gateway with an x402 payment layer. A client or autonomous agent sends an AI request, receives an HTTP 402 Payment Required challenge, signs a USDC payment on Algorand Testnet, and retries with payment proof.

AgentPay applies a routing policy, selects an OpenRouter-backed provider, pays that provider's x402 endpoint, and returns the model output together with inbound and downstream settlement data. It is built for agents as well as the browser playground.

## Project status

AgentPay is a hackathon prototype on Algorand Testnet. Browser payment, Pera Wallet signing, live OpenRouter responses, downstream x402 provider payments, Neon-backed agents, and hashed API keys are implemented. Mainnet hardening, user authentication, durable budgets, and production rate limiting remain future work.

<a id="features"></a>

## Features

| Capability | What AgentPay provides |
| --- | --- |
| x402 payment gateway | Returns a standards-based HTTP 402 challenge before paid AI requests are processed |
| Algorand settlement | Uses USDC on Algorand Testnet for client payments and downstream provider payments |
| Policy-based routing | Selects cheap, balanced, or premium providers according to the requested preference |
| Live AI responses | Routes configured providers through OpenRouter; falls back to explicit demo responses when no key is configured |
| Provider discovery | Exposes a live provider catalogue, routing statistics, and settlement records |
| Agent-ready API | Supports programmatic clients that sign a payment and automatically retry the protected route |
| Browser playground | React chat UI with Pera Wallet connection, payment signing, receipts, and transaction visibility |

## Developer surface

| Endpoint | Purpose |
| --- | --- |
| POST /api/generate | x402-protected AI routing endpoint |
| GET /api/providers | Available providers and their routing metadata |
| GET /api/stats | Routing and provider performance data |
| GET /api/transactions | Successful routing records and downstream settlement receipts |

<h2 id="architecture">Architecture & payment lifecycle</h2>

~~~text
Pera Wallet / autonomous x402 client
            │
            ▼
AgentPay POST /api/generate
            │  402 challenge → client signs USDC payment → retry with PAYMENT-SIGNATURE
            ▼
Decision engine selects a provider
            │
            ▼
AgentPay wallet settles the provider's x402 request
            │
            ▼
Provider returns AI output
            │
            ▼
AgentPay returns output + inbound and downstream receipts
~~~

Every paid request follows the same path: verify the client's payment, choose a provider using the routing policy, settle the provider's own x402 request, then return a single response with the relevant payment receipts.

<a id="quickstart"></a>

## Quickstart

### Run locally on Testnet

1. Copy backend/.env.example to backend/.env and configure three USDC-opted-in Testnet recipient accounts plus a funded router mnemonic.
2. Copy frontend/.env.example to frontend/.env.
3. Start the backend, then the frontend:

~~~bash
cd backend
npm run dev

# In a second terminal
cd frontend
npm run dev
~~~

4. Visit http://localhost:5173, connect Pera Wallet on Testnet, send a prompt, approve the 402 payment, and inspect the returned receipts.

For live model output, set OPENROUTER_API_KEY in backend/.env. Without it, the provider adapters return clear demo text while the payment-routing flow remains available when wallets are funded.

### Run as an autonomous agent

The browser is optional. The included agent client calls AgentPay, receives the 402 challenge, signs it using its own wallet, retries with PAYMENT-SIGNATURE, and prints both settlement receipts.

~~~bash
cd backend
npm run agent:demo
~~~

Set AGENT_MNEMONIC in backend/.env to a separately funded Testnet account. Keep the client wallet separate from the router wallet. Each payer and recipient must be opted into Testnet USDC ASA 10458941, and payer accounts need Testnet ALGO and USDC.

## Configure external providers

AgentPay includes cheap, balanced, and premium provider adapters for local testing. To use independently deployed providers, configure their x402-protected endpoints:

~~~env
CHEAP_PROVIDER_URL=https://cheap-provider.example/api/generate
BALANCED_PROVIDER_URL=https://balanced-provider.example/api/generate
PREMIUM_PROVIDER_URL=https://premium-provider.example/api/generate
~~~

Each endpoint must have its own USDC-opted-in payTo wallet and return { "result": "..." } after payment. Leave a URL blank to use AgentPay's built-in adapter.

## Deployment

- Deploy the backend to a public HTTPS origin and set INTERNAL_BASE_URL to that backend address.
- Host the frontend on the same origin, or set VITE_API_BASE_URL=https://YOUR_API_DOMAIN/api.
- For Mainnet, change every Algorand configuration value together: ALGORAND_NETWORK=mainnet, the Algod URL, USDC ASA 31566704, and all opted-in wallet addresses.

## Repository structure

~~~text
agentpay/
├── backend/                 # Express API, x402 payment flow, provider routing, and agent client
├── frontend/                # React dashboard, Pera Wallet flow, and chat playground
├── contracts/               # Algorand contract-related resources
├── shared/                  # Shared project utilities and types
└── docs/images/readme/      # README assets
~~~

## Important

Never commit .env files, mnemonics, or API keys. The router cannot settle downstream provider payments until ROUTER_PRIVATE_KEY and every provider payTo address are configured.

## Links

- Live app: [agentpay-teal.vercel.app](https://agentpay-teal.vercel.app)
- Facilitator documentation: [facilitator.goplausible.xyz/docs](https://facilitator.goplausible.xyz/docs)
- x402 on Algorand: [developer guide](https://dev.algorand.co/resources/x402-on-algorand/)
