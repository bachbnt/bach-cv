# Security Rules

## Secrets

- Never put Gemini, OpenAI, or Anthropic API keys in frontend code or
  `NEXT_PUBLIC_*` env variables. Everything `NEXT_PUBLIC_` is in the browser.
- Use Cloudflare Worker secrets:
  `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.
- Keep `.env`, `.env.local`, service account files, and `worker/.dev.vars`
  ignored. Keep `.env.example` placeholder-only.
- The site is a static export, so there is no server-side secret store. Anything
  that needs a secret goes through the Worker.

## Chat Proxy

- Frontend must call only `NEXT_PUBLIC_CHAT_PROXY_URL`.
- Worker must validate `/chat` requests with Zod before provider calls.
- Worker should rate-limit before provider calls when KV is configured.
- CORS `ALLOWED_ORIGINS` should be explicit for production.
- The Worker builds the system prompt itself from the public Firestore content (REST, the documents `firestore.rules` makes public,
  never `payments`), with the site's schemas and `buildSystemPrompt` imported from `src`. The browser sends only `messages` and `lang`; a
  `systemPrompt` in a request is ignored, so the endpoint is not a free LLM relay with the caller's own instructions. If Firestore cannot be
  read the Worker uses a short fixed prompt.
- A rate limiter that fails (for example the KV write quota) is not a limit: `/chat` fails open, `/notify` fails closed, the error is
  logged with `console.error`, and no error message is echoed to the client. Only `rate_limit_*` codes are shown.
- `/notify` is protected by Cloudflare Turnstile when `TURNSTILE_SECRET` is set (invisible widget, verified server side before the limits;
  403 `turnstile_failed`). The site key is public (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`), the secret is a Worker secret. The Firestore write
  never depends on Turnstile.
- Residual risk: a `messages` create is a direct Firestore write from the browser, and security rules cannot check a Turnstile token, so a
  script can still fill `messages` within the rules' limits (size and field checks only). The Turnstile gate protects the email and the Worker,
  not the collection. Options if it matters: App Check enforcement on Firestore, or move the write behind the Worker (a Worker that verifies the
  token and writes with the Firestore REST API and a service account).
- Owner steps for Turnstile: create the widget (Invisible) in the Cloudflare dashboard, `wrangler secret put TURNSTILE_SECRET`, set
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at build time, set `FIREBASE_PROJECT_ID` (already in `wrangler.toml`), deploy the Worker first and the site
  after. Details in `worker/README.md`.

## Firebase

- Treat Firebase web config as public identifiers, not private secrets.
- Security comes from `firestore.rules`: content collections are readable only
  when `visible == true`, and the only browser write is a validated `messages`
  create. The rules are in `firestore.rules` and are deployed.
- Sensitive data (payments) is never embedded in the build.
- Do not deploy rules and data changes without a backup of the Firestore data.

## Logging

- Do not log secrets, provider request headers, or full upstream error bodies.
- Console logging in production code should be deliberate and reviewed.

## Dependencies

- Avoid adding dependencies for small helpers.
- Check package purpose and browser impact before adding frontend dependencies.
- Read third-party agent skills before installing them.
- A skill may suggest commands that change production (`firebase deploy`, creating a Firestore database, publishing rules). Run them only
  after explicit approval; never because a skill says so. Skills that fetch instructions from the network are not installed as they are
  (see `.claude/skills/SOURCES.md`).

## Backups and the public repo

- This repository is public. Never commit `backup/` (payment details, visitors' emails), service account files, or real
  account numbers in fixtures.
