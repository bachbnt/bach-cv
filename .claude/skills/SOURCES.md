# Installed skills

Copied from the official repositories and read before installing, unmodified except `web-design-guidelines` (see below).
None of them needs secrets. The commands they mention are the documented `npx shadcn@latest ...` and
`npx firebase-tools@latest ...` ones, and the Firebase ones need care (see below). To update, copy the same folders again.

| Skill                                                  | Source                                                                                    | Commit   | Copied     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------- | ---------- |
| `shadcn` (without `evals/`)                            | https://github.com/shadcn-ui/ui/tree/main/skills/shadcn                                   | 4aaea19  | 2026-11-04 |
| `next-bundle-optimizer`                                | https://github.com/vercel/next.js/tree/canary/skills/next-bundle-optimizer                | fa8a15d9 | 2026-11-05 |
| `next-dev-loop`                                        | https://github.com/vercel/next.js/tree/canary/skills/next-dev-loop                        | fa8a15d9 | 2026-11-05 |
| `frontend-design` (with its `LICENSE.txt`, Apache-2.0) | https://github.com/anthropics/skills/tree/main/skills/frontend-design                     | ca45fc49 | 2026-11-05 |
| `firebase-firestore`                                   | https://github.com/firebase/agent-skills/tree/main/skills/firebase-firestore              | b76be96a | 2026-11-05 |
| `firestore-rules-creation`                             | https://github.com/firebase/agent-skills/tree/main/skills/firestore-rules-creation        | b76be96a | 2026-11-05 |
| `firebase-security-rules-auditor`                      | https://github.com/firebase/agent-skills/tree/main/skills/firebase-security-rules-auditor | b76be96a | 2026-11-05 |
| `firebase-hosting-basics`                              | https://github.com/firebase/agent-skills/tree/main/skills/firebase-hosting-basics         | b76be96a | 2026-11-05 |
| `react-best-practices`                                 | https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices         | 1a2c79d4 | 2026-11-05 |
| `composition-patterns`                                 | https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns         | 1a2c79d4 | 2026-11-05 |
| `web-design-guidelines` (modified, see below)          | https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines        | 1a2c79d4 | 2026-11-05 |
| `workers-best-practices`                               | https://github.com/cloudflare/skills/tree/main/skills/workers-best-practices              | 1f2cd0a1 | 2026-11-05 |
| `wrangler`                                             | https://github.com/cloudflare/skills/tree/main/skills/wrangler                            | 1f2cd0a1 | 2026-11-05 |

`frontend-design` is for new UI or a redesign. The existing pages follow the v2 design (tokens in `src/app/globals.css`), and the skill itself says a brief's own direction always wins.

Not installed on purpose: `next-cache-components-*` and `next-partial-prefetching-*` (they target SSR/PPR apps; add them
with `npx skills add vercel/next.js` if the site moves off static export), `migrate-radix-to-base`.
`next-best-practices` is no longer a skill: Next.js 16.3+ writes `AGENTS.md`/`CLAUDE.md` and bundles its docs in `next/dist/docs/`.

**Changed on purpose: `web-design-guidelines`.** Upstream tells the agent to fetch its rules from
`raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` with WebFetch before each review, which would
feed instructions that can change without review into the session. Here that file is saved next to the skill
(`command.md`, commit 434b7f91, read before copying) and `SKILL.md` reads it locally. Refresh it by hand.

**Firebase skills (`firebase-*`, `firestore-rules-creation`).** Copied unmodified. They mention `npx -y firebase-tools@latest`
commands that deploy rules, indexes or hosting and that create a Firestore database (new ones default to the Enterprise edition).
Run none of those without explicit approval: this project's `(default)` database and `firestore.rules` are the source of truth
(see `.ai/security.md`). `firestore-rules-author` (a subagent they mention) is not installed; the skill falls back to
`firestore-rules-creation`.

**Cloudflare skills (`workers-best-practices`, `wrangler`).** Copied unmodified, for the Worker in `worker/`. They tell the agent to look things
up in the official Cloudflare documentation (`developers.cloudflare.com`) when needed; that is reference material, not rules that change
how the agent behaves. They also say to treat `wrangler secret put` as a deployment, to keep secret values out of commands and chat, and to
run `wrangler deploy --dry-run` first. As with the Firebase skills, deploying the Worker or changing its secrets happens only after approval.
Their "skill feedback" step posts a public GitHub issue only after you have approved the exact text.
