# AgentPay Product Brief

## Mission

Intelligent payment routing for autonomous AI agents - one endpoint, multiple providers, x402 payments on Algorand.

## Target Users

- **Autonomous AI Agents**: Software bots that make AI API calls programmatically
- **Developers**: Building agent applications that need cost-effective AI access
- ** Businesses**: Scaling AI operations without subscription overhead

## Core Product

**AgentPay Router** - A payment routing system that:
1. Receives AI requests from agents
2. Routes to the best provider based on price/latency/availability
3. Handles x402 micropayments on Algorand
4. Returns results with payment receipts

## Design Direction

**Mode**: Operate (dashboard/app UI)

**Visual Reference**: OpenRouter (https://openrouter.ai/)

### Key Requirements

1. **Exact OpenRouter UI replication** for the landing page
2. **Dark mode first** (developer-centric)
3. **Modern, clean aesthetic**: Deep backgrounds, subtle borders, generous spacing
4. **Provider showcase** section for AI services
5. **Live stats** showing real x402 transactions
6. **Agent gateway** as hero section

### Color Palette

- **Backgrounds**: Deep charcoal (#0D0D0F), dark navy
- **Cards**: Lighter gray overlays (#1E1E24)
- **Accents**: Blue (#3B82F6), gradient highlights
- **Text**: White primary, gray secondary

### Typography

- **Headings**: Bold, geometric sans-serif (Inter/Space Grotesk style)
- **Body**: Regular weight, comfortable line height
- **Code**: Monospace for API examples

## Key Pages

### 1. Landing Page (openrouter-like)
- Hero: Agent gateway with prompt input
- Stats: Real x402 transaction metrics
- Providers: Showcase AI services
- How it works: 3-step process
- Live dashboard: Real-time routing stats

### 2. Developer Dashboard (new)
- API keys management
- Spending analytics
- Provider routing rules
- Payment history

### 3. Agent Portal (new)
- Single endpoint for all AI calls
- Routing preferences (cheapest/fastest/reliable)
- Payment proof submission
- Receipt viewer

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Blockchain**: Algorand x402 via GoPlausible SDK
- **Deployment**: Railway/Vercel

## Success Metrics

- Real x402 transactions on Algorand MainNet
- Agent agents using the router
- Volume of USDC processed
