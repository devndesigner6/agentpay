# AgentPay

<p align="center"><strong>Open-source x402 payment routing for AI agents on Algorand.</strong><br/>One paid request in, policy-based model routing and on-chain provider settlement out.</p>

<p align="center">
  <a href="https://agentpay-teal.vercel.app">Live app</a> ·
  <a href="https://facilitator.goplausible.xyz/docs">Facilitator docs</a> ·
  <a href="https://facilitator.goplausible.xyz/dashboard/leaderboards">Leaderboard</a> ·
  <a href="https://dev.algorand.co/resources/x402-on-algorand/">x402 on Algorand</a>
</p>

## What is AgentPay

AgentPay is an OpenAI-style agent gateway with an x402 payment layer. A payer signs a USDC Testnet payment, AgentPay selects a live OpenRouter model according to its routing policy, settles the chosen provider's own x402 request, and returns the model result plus settlement data. It is designed for agent clients, not only the browser chat demo.

## Project status

AgentPay is a hackathon prototype running on Algorand Testnet. The x402 request and downstream provider-payment flow are live. Agents and API keys are persisted in Neon Postgres; production authentication, durable budgets, and mainnet hardening remain future work.

## What is implemented

- `POST /api/generate`: x402-protected AI routing endpoint.
- `GET /api/providers`: live provider catalogue.
- `GET /api/stats`: routing and provider performance data.
- `GET /api/transactions`: persisted successful routing records and downstream receipts.
- Three x402-protected provider adapters: cheap, balanced, and premium.
- Bazaar discovery metadata and `x402-global-challenge` tagging on every paid route.
- React dashboard, Pera Wallet payment flow, chat playground, receipt display, and deployment-safe API configuration.

## Architecture

```text
Pera Wallet / x402 client
  -> AgentPay /api/generate (client payment settles)
  -> Decision engine selects provider
  -> AgentPay wallet pays provider x402 endpoint
  -> Provider returns AI output
  -> AgentPay returns output + inbound and downstream receipts
```

## Run locally on Testnet

1. Copy `backend/.env.example` to `backend/.env` and add three USDC-opted-in Testnet recipient accounts plus a funded router mnemonic.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Run `npm run dev` in `backend`, then `npm run dev` in `frontend`.
4. Visit `http://localhost:5173`, connect Pera Wallet on Testnet, submit a prompt, approve the 402 payment, and verify the returned receipts.

For actual AI output, add `OPENROUTER_API_KEY`. Without it the provider adapters return explicit demo text; payment routing remains real when configured wallets are funded.

## Run as an autonomous agent

The browser is optional. `backend/src/scripts/agent-client.ts` is a working agent-style client: it calls AgentPay, receives the `402`, signs it using its own wallet, retries with a `PAYMENT-SIGNATURE`, and prints the inbound and downstream settlement receipts.

Set `AGENT_MNEMONIC` in `backend/.env` to a separately funded Testnet account, then run:

```bash
cd backend
npm run agent:demo
```

The client wallet and the router wallet should be different accounts. On Testnet, opt each payer and each recipient account into USDC ASA `10458941` and fund payer accounts with Testnet ALGO plus Testnet USDC before running it.

## Use real external providers

The three built-in provider routes make local end-to-end testing easy. For a stronger composite-entry demo, deploy each provider independently and point the router at it:

```env
CHEAP_PROVIDER_URL=https://cheap-provider.example/api/generate
BALANCED_PROVIDER_URL=https://balanced-provider.example/api/generate
PREMIUM_PROVIDER_URL=https://premium-provider.example/api/generate
```

Each remote URL must itself be an x402-protected route, have its own USDC-opted-in `payTo` wallet, and return `{ "result": "..." }` after payment. If the URL is blank, AgentPay uses its built-in provider adapter.

## Deployment

- Deploy the backend to a public HTTPS origin.
- Set `INTERNAL_BASE_URL` to that backend's own public/internal address.
- Host the frontend on the same origin or set `VITE_API_BASE_URL=https://YOUR_API_DOMAIN/api`.
- Switch every Algorand configuration value together for Mainnet: `ALGORAND_NETWORK=mainnet`, Mainnet Algod URL, USDC ASA `31566704`, and Mainnet USDC-opted-in wallets.

## Important

Do not commit `.env`, a mnemonic, or an API key. The endpoint cannot complete a downstream provider settlement until `ROUTER_PRIVATE_KEY` and all provider `payTo` addresses are configured.
