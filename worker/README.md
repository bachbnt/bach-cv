# chat-proxy worker

Cloudflare Worker that fronts the LLM chat providers (Gemini / OpenAI / Anthropic) so API keys never ship to the client.

## Endpoints

- `GET  /health` → `{ "ok": true }`
- `POST /chat` → body `{ provider: "gemini" | "openai" | "claude", messages: [...], systemPrompt }` → `{ "text": "..." }`

Request body is validated with the same Zod schema (`src/schema.ts`) that the client uses.

## One-time setup

```bash
cd worker
npm install
npx wrangler login

# Secrets (never commit these)
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put ANTHROPIC_API_KEY

# Optional but recommended: per-IP rate limit via KV
npx wrangler kv:namespace create CHAT_RATE_LIMIT
# → paste returned id into wrangler.toml under [[kv_namespaces]]
```

## Deploy

```bash
npm run deploy
# → copy the deployed URL into the app's .env.local as NEXT_PUBLIC_CHAT_PROXY_URL
```

## Local dev

```bash
npm run dev
# Worker available at http://localhost:8787
# Tail prod logs with: npm run tail
```

## Configuration

`wrangler.toml` exposes:

- `ALLOWED_ORIGINS` — comma-separated list, used for CORS.
- `RATE_LIMIT_PER_DAY` / `RATE_LIMIT_PER_MINUTE` — only enforced when the `CHAT_RATE_LIMIT` KV binding is present.

## Security checklist after deploy

1. Rotate the old `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` — the previous values were bundled into the public client and must be considered compromised.
2. Remove any `*_GEMINI_API_KEY`, `*_OPENAI_API_KEY`, `*_ANTHROPIC_API_KEY` entries (including old `VITE_*` ones) from any deployed environment (Firebase Hosting env, CI secrets, etc.).
3. Confirm `ALLOWED_ORIGINS` matches the production domain only — `*` is acceptable for development but never for production.
