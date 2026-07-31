# AgentPay Deployment & Submission Plan

Status: planning only. Do not deploy until the UI decisions and Testnet proof are complete.

## Goal

Deploy the AgentPay React frontend to Vercel and the Express/x402 backend to Railway, then demonstrate an autonomous agent completing an inbound x402 payment, a routed downstream payment, and a receipt-bearing response.

## Product Definition

AgentPay is an API-first payment router. An agent calls `POST /api/generate`, receives an HTTP 402 challenge, pays with an Algorand wallet, and receives an AI result after AgentPay selects and pays a downstream provider.

The browser app is a human dashboard and Pera Wallet demo. It is not required for an autonomous agent to use the API.

## Phase 1 — UI decisions before deployment

Keep:

- Hero/router playground with prompt, route preference, payment state, result, and receipts.
- How It Works section.
- Chat playground, API docs, provider/routing pages, and live Console transaction history.
- Wallet connection and clear Testnet/Mainnet network indicator.

Remove or relabel:

- Any placeholder metrics, fake trends, fake uptime claims, or fictional API-key/run-log entries.
- Any page that implies an OpenAI-compatible `/v1` API until that endpoint exists.
- Any claim of “live Mainnet” before a real Mainnet settlement is verified.

Add before public demo:

- Prominent network badge: `Testnet` or `Mainnet`.
- Router receipt card showing inbound facilitator settlement transaction and downstream provider transaction.
- Empty-state messaging when no settled routes exist.
- Clear provider labels: `Built-in adapter` versus `External x402 provider`.
- Copy buttons for request IDs, provider receipt IDs, and API examples.

## Phase 2 — Backend production readiness

Required environment values on Railway:

```env
NODE_ENV=production
PORT=<provided by Railway>
ALGORAND_NETWORK=testnet
ALGORAND_ALGOD_URL=https://testnet-api.algonode.cloud
ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
USDC_ASSET_ID=10458941
X402_FACILITATOR_URL=https://facilitator.goplausible.xyz
X402_PAY_TO_ADDRESS=<AgentPay receiving wallet>
ROUTER_PRIVATE_KEY=<router wallet mnemonic or supported private-key format>
CHEAP_PAY_TO_ADDRESS=<provider wallet>
BALANCED_PAY_TO_ADDRESS=<provider wallet>
PREMIUM_PAY_TO_ADDRESS=<provider wallet>
OPENROUTER_API_KEY=<optional real-AI key>
INTERNAL_BASE_URL=https://<railway-backend-domain>
```

Before Mainnet, confirm every relevant Testnet account is funded with ALGO and opted into USDC ASA `10458941`:

1. Agent wallet: pays AgentPay.
2. AgentPay receiving wallet: receives inbound payment.
3. Router wallet: pays providers.
4. Each provider recipient wallet: receives downstream payment.

Backend changes to make immediately before production:

- Restrict CORS to the Vercel frontend domain instead of allowing all origins.
- Add a Railway health-check route using `/health`.
- Keep `transactions.json` only for local demos; replace it with Postgres/Redis before real multi-instance traffic.
- Do not put a mnemonic in source control, Vercel variables, logs, or frontend code.
- Ensure Railway runs `npm run build` then `npm run start` from the `backend` directory.

`backend/railway.toml` supplies those build, start, restart, and health-check settings when Railway is configured with `backend` as its root directory.

## Phase 3 — Vercel frontend readiness

Set Vercel project root to `frontend`.

Build settings:

```text
Build command: npm run build
Output directory: dist
```

`frontend/vercel.json` provides the SPA fallback rewrite for Vercel.

Required Vercel environment values:

```env
VITE_API_BASE_URL=https://<railway-backend-domain>/api
VITE_ALGORAND_NETWORK=testnet
```

After deployment, test:

- Page loads without `localhost` requests.
- Pera Wallet is connected to the selected network.
- Browser gets a 402 challenge and can retry after signature.
- Console retrieves `/api/stats` and `/api/transactions` from Railway.

## Phase 4 — Agent access

Any agent can use AgentPay if it has:

1. The public `POST /api/generate` URL.
2. An Algorand wallet containing Testnet/Mainnet ALGO and USDC.
3. x402 client logic to handle HTTP 402 and resend `PAYMENT-SIGNATURE`.

The included `backend/src/scripts/agent-client.ts` demonstrates this exact behavior. Codex, Claude, OpenCode, Kimi, or a custom agent do not automatically gain access merely by visiting the website; they need this API integration and a wallet they are authorized to spend from.

## Phase 5 — Testnet acceptance test

Run these in order:

1. Start/deploy backend and confirm `GET /health` reports Testnet configuration.
2. Call `POST /api/generate` without payment and confirm HTTP 402.
3. Run `npm run agent:demo` with a funded `AGENT_MNEMONIC`.
4. Confirm the agent output contains:
   - inbound x402 settlement transaction from `PAYMENT-RESPONSE`;
   - selected provider;
   - downstream provider settlement transaction;
   - AI response.
5. Confirm the provider wallet received Testnet USDC.
6. Confirm `GET /api/transactions` and the Console history contain the routed run.
7. Record a 60–90 second demo video.

## Phase 6 — Go / no-go gate

Deploy publicly only when every item is true:

- [ ] Frontend production build passes.
- [ ] Backend production build passes.
- [ ] Railway backend health endpoint responds.
- [ ] Vercel app uses Railway API URL, not localhost.
- [ ] One full Testnet payment chain succeeds.
- [ ] No secret is committed to GitHub.
- [ ] UI contains no misleading fake stats or Mainnet claims.
- [ ] Demo shows two real transaction receipts.

## Phase 7 — Mainnet and challenge submission

Only after Testnet proof:

1. Switch every configuration item together to Mainnet.
2. Use USDC ASA `31566704` and Mainnet-funded, USDC-opted-in accounts.
3. Use the same permanent receiving wallet for entry attribution.
4. Complete one small real payment before promoting the product.
5. Submit the repository, deployed URLs, architecture explanation, and recorded demo.
