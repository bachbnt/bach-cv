# Installed skills

Copied unmodified from the official repositories (read before installing; no network or secret access beyond
the documented `npx shadcn@latest` commands). To update, copy the same folders again.

| Skill | Source | Commit | Copied |
|---|---|---|---|
| `shadcn` (without `evals/`) | https://github.com/shadcn-ui/ui/tree/main/skills/shadcn | 4aaea19 | 2026-11-04 |
| `next-bundle-optimizer` | https://github.com/vercel/next.js/tree/canary/skills/next-bundle-optimizer | a4795950 | 2026-11-04 |
| `next-dev-loop` | https://github.com/vercel/next.js/tree/canary/skills/next-dev-loop | a4795950 | 2026-11-04 |

Not installed on purpose: `next-cache-components-*` and `next-partial-prefetching-*` (they target SSR/PPR apps; add them
with `npx skills add vercel/next.js` if the site moves off static export), `migrate-radix-to-base`.
`next-best-practices` is no longer a skill: Next.js 16.3+ writes `AGENTS.md`/`CLAUDE.md` and bundles its docs in `next/dist/docs/`.
