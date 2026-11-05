# chat-proxy worker

Cloudflare Worker that fronts the LLM chat providers (Gemini / OpenAI / Anthropic) so API keys never ship to the client.

## Endpoints

- `GET  /health` → `{ "ok": true, "rateLimit": true|false, "providers": ["gemini"] }` (`rateLimit: false` means the KV binding is missing and nothing is limited; `notify: true` means the email notification is ready)
- `POST /chat` → body `{ messages: [...], systemPrompt, provider?: "cloudflare" | "gemini" | "openai" | "claude" }` → `{ "text": "...", "provider": "..." }`.
  Without `provider` the Worker tries the enabled providers in order (`ALLOWED_PROVIDERS`, default `cloudflare,gemini`): the first that answers wins,
  and a spent free allowance or a failure moves on to the next.
- `POST /notify` → body `{ name, email, topic?, message, locale? }` → emails the owner about a contact-form message (Resend). Needs `RESEND_API_KEY`,
  `NOTIFY_TO` and the KV rate limit; until then it answers `{ "ok": true, "sent": false }` and sends nothing.

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

## Workers AI (free, no API key)

`wrangler.toml` already has `[ai] binding = "AI"`, so the Worker can use Workers AI. The free plan includes a daily pool of
10,000 Neurons shared by all models; once it is spent Workers AI answers an error (no charge) and the Worker falls back to Gemini.
`CLOUDFLARE_AI_MODEL` picks a model from the Workers AI catalog (default `@cf/meta/llama-3.1-8b-instruct-fp8`: check the catalog for
current names). Small free models answer Vietnamese less well than Gemini; put `gemini,cloudflare` in `ALLOWED_PROVIDERS` to try Gemini first.

## Email notification (Resend, free: 100 emails a day)

```bash
# 1. create an account at https://resend.com and an API key
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put NOTIFY_TO        # the address to tell, for example your own email
# 2. the KV rate limit above must be bound: without it nothing is sent, so nobody can flood the inbox
```

Without your own domain Resend lets `onboarding@resend.dev` send only to the email of your Resend account, so use that address as
`NOTIFY_TO`. To send from your own address, verify a domain in Resend and set `NOTIFY_FROM`. At most `NOTIFY_PER_HOUR` (5) per visitor
and `NOTIFY_PER_DAY` (40) in total are sent. The browser calls `/notify` only after the message is saved in Firestore, so a failure here
never loses a message.

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

- `ALLOWED_ORIGINS` — comma-separated list, used for CORS. CORS only stops other websites in a browser; it does not stop a script from calling the worker.
- `ALLOWED_PROVIDERS` — comma-separated, default `gemini`. A request for any other provider gets 403, so nobody else can spend your OpenAI or Anthropic credit. Answers are capped at 1024 tokens.
- `GEMINI_MODEL` / `OPENAI_MODEL` / `ANTHROPIC_MODEL` — optional, to change a model without a code change.
- `REQUIRE_RATE_LIMIT` — `"true"` makes `/chat` answer 503 until the KV namespace is bound.
- `RATE_LIMIT_PER_DAY` / `RATE_LIMIT_PER_MINUTE` — only enforced when the `CHAT_RATE_LIMIT` KV binding is present.

## Security checklist after deploy

1. Rotate the old `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` — the previous values were bundled into the public client and must be considered compromised.
2. Remove any `*_GEMINI_API_KEY`, `*_OPENAI_API_KEY`, `*_ANTHROPIC_API_KEY` entries (including old `VITE_*` ones) from any deployed environment (Firebase Hosting env, CI secrets, etc.).
3. Confirm `ALLOWED_ORIGINS` matches the production domain only — `*` is acceptable for development but never for production.
