# chat-proxy worker

Cloudflare Worker that fronts the LLM chat providers (Gemini / OpenAI / Anthropic) so API keys never ship to the client.

## Endpoints

- `GET  /health` → `{ "ok": true, "rateLimit": true|false, "providers": ["gemini"], "turnstile": true|false, "notify": true|false }` (`rateLimit: false` means the KV binding is missing and nothing is limited; `notify: true` means the email notification is ready; `turnstile: true` means `/notify` checks a Turnstile token)
- `POST /chat` → body `{ messages: [...], lang?: "en" | "vi", provider?: "cloudflare" | "gemini" | "openai" | "claude" }` → `{ "text": "...", "provider": "..." }`.
  The Worker builds the system prompt itself (see "The system prompt" below); a `systemPrompt` in the body is ignored.
  Without `provider` the Worker tries the enabled providers in order (`ALLOWED_PROVIDERS`, default `cloudflare,gemini`): the first that answers wins,
  and a spent free allowance or a failure moves on to the next. **A provider that does not answer is cut off after 8 s** (`PROVIDER_TIMEOUT_MS` in
  `src/providers.ts`: the request and the reading of its answer; the request is aborted, and Workers AI, which cannot be aborted, has its late answer dropped),
  and **all of them together have 25 s** (`CHAT_BUDGET_MS` in `src/index.ts`; a provider with less than 1.5 s left is not tried). A visitor whose providers all
  time out gets `502 upstream_error` after at most about 25 s, where before one hung provider could keep the request for minutes (122 s was seen).
- `POST /notify` → body `{ name, email, topic?, message, locale?, turnstileToken? }` → emails the owner about a contact-form message (Resend). Needs `RESEND_API_KEY`,
  `NOTIFY_TO` and the KV rate limit; until then it answers `{ "ok": true, "sent": false }` and sends nothing.

When the rate limiter itself fails (not a limit reached: for example the Workers KV write quota is spent) the error is logged with
`console.error` and never sent to the visitor. `/chat` then fails open (the request is answered; the provider allowance and the answer cap
still bound the cost) and `/notify` fails closed (no email, answer `{ "ok": true, "sent": false, "reason": "rate_limit_error" }`). Only the known
codes `rate_limit_minute`, `rate_limit_hour`, `rate_limit_day` (429) and `rate_limit_unavailable` (503, `/chat` only) are shown to the visitor.

Request body is validated with the same Zod schema (`src/schema.ts`) that the client uses.

## The system prompt

The browser sends only `messages` and `lang`. The Worker reads the public site content from Firestore over REST
(`https://firestore.googleapis.com/v1/projects/<FIREBASE_PROJECT_ID>/databases/(default)/documents`): the documents `site/shell` and
`site/profile`, and the `visible == true` documents of `skills`, `experience`, `education`, `projects`, `certificates`, `services` and
`contacts` (exactly what `firestore.rules` lets anyone read; `payments` and `site/settings` are never read). It parses them with the site's own
Zod schemas and builds the prompt with the site's own `buildSystemPrompt`: both are imported from `../src` (the `paths` in
`worker/tsconfig.json`, which esbuild/Wrangler follow), not copied. `zod` is mapped to the Worker's copy so only one is bundled.

- The built prompt is cached for about 5 minutes: in memory of the Worker instance, and in the Cache API. The Cache API does nothing on
  a `*.workers.dev` address (only on a custom domain), so on `workers.dev` each instance reads Firestore again after 5 minutes (9 small reads).
- If Firestore cannot be read (any error, a wrong project, App Check enforced on Firestore) the Worker answers with a short fixed prompt
  (`OWNER_NAME` / `OWNER_HEADLINE`, default `Bach Bui` / `Software Engineer`) and tries Firestore again after one minute. If only some reads
  fail, the prompt has fewer sections for a minute.
- `FIREBASE_PROJECT_ID` (a var in `wrangler.toml`, `bachbntdev`) names the project. Without it only the fallback prompt is used.

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
npx wrangler secret put NOTIFY_TO        # who to tell: one address, or several separated by commas (each gets its own email)
# 2. the KV rate limit above must be bound: without it nothing is sent, so nobody can flood the inbox
```

Without your own domain Resend lets `onboarding@resend.dev` send only to the email of your Resend account, so use that address as
`NOTIFY_TO`. To send from your own address, verify a domain in Resend and set `NOTIFY_FROM`. At most `NOTIFY_PER_HOUR` (5) per visitor
and `NOTIFY_PER_DAY` (40) in total are sent. The browser calls `/notify` only after the message is saved in Firestore, so a failure here
never loses a message.

## Turnstile for the contact notification (optional)

A script could post to `/notify` and flood the inbox up to the per-day cap. Cloudflare Turnstile makes `/notify` need a token that only a
browser running the site's invisible check can get. It is off until `TURNSTILE_SECRET` is set: without it `/notify` behaves as before.
With it, `/notify` needs `turnstileToken` in the body and verifies it at `https://challenges.cloudflare.com/turnstile/v0/siteverify`
(`secret`, `response`, `remoteip` = `CF-Connecting-IP`). A missing or failed token answers `403 { "error": "turnstile_failed" }` and sends nothing; this
check comes before the per-IP limits, so a script without a token cannot spend the daily cap. The browser side is `src/lib/turnstile.ts`, used only
when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; if the token cannot be had (script blocked, 8 s timeout) the message is still saved in Firestore, and
only the email is not sent.

Owner steps, in this order:

1. Cloudflare dashboard, Turnstile, add a widget: widget mode **Invisible**, hostnames `bachbntdev.web.app`, `bachbntdev.firebaseapp.com` (and
   `localhost` while testing). Copy the **site key** and the **secret key**.
2. `cd worker && npx wrangler secret put TURNSTILE_SECRET` (paste the secret key).
3. Deploy the Worker first (`npm run deploy`). Until the site is deployed with the site key, the contact emails stop coming (the messages are still in
   Firestore), so do steps 4 and 5 right after.
4. Put the site key in the build environment of the site: `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>`.
5. Build and deploy the site (`firebase.json` now lets `https://challenges.cloudflare.com` in `script-src` and `frame-src`).

To switch it off, remove the secret (`npx wrangler secret delete TURNSTILE_SECRET`).

## Deploy

Deploy the Worker **before** the site. The Worker accepts both the new body (`lang`) and the old one (an old `systemPrompt` is ignored), so a site that is
still the old build keeps working; a new site against an old Worker would not (the old Worker needs `systemPrompt`).

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
- `FIREBASE_PROJECT_ID` — the Firebase project whose public content is read for the system prompt. `OWNER_NAME` / `OWNER_HEADLINE` — optional, for the fallback prompt.
- `TURNSTILE_SECRET` — secret, optional (see above).
- `ALLOWED_PROVIDERS` — comma-separated, default `gemini`. A request for any other provider gets 403, so nobody else can spend your OpenAI or Anthropic credit. Answers are capped at 1024 tokens.
- `GEMINI_MODEL` / `OPENAI_MODEL` / `ANTHROPIC_MODEL` — optional, to change a model without a code change.
- `REQUIRE_RATE_LIMIT` — `"true"` (set) makes `/chat` answer 503 until the KV namespace is bound.
- `RATE_LIMIT_PER_DAY` / `RATE_LIMIT_PER_MINUTE` — only enforced when the `CHAT_RATE_LIMIT` KV binding is present.

## Security checklist after deploy

1. Rotate the old `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` — the previous values were bundled into the public client and must be considered compromised.
2. Remove any `*_GEMINI_API_KEY`, `*_OPENAI_API_KEY`, `*_ANTHROPIC_API_KEY` entries (including old `VITE_*` ones) from any deployed environment (Firebase Hosting env, CI secrets, etc.).
3. Confirm `ALLOWED_ORIGINS` matches the production domain only — `*` is acceptable for development but never for production.
