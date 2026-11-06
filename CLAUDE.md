# Claude Instructions

Use the shared project rules in `.ai/`. Keep this file as an entrypoint only;
do not duplicate the full rules here.

Read first:

- `.ai/project.md`
- `.ai/coding.md`
- `.ai/structure.md`
- `.ai/testing.md`
- `.ai/skins.md` (when the work touches the looks of the site or `src/skins`)

For code review:

- `.ai/review.md`
- `.ai/performance.md`
- `.ai/security.md`

For cleanup/refactor work:

- `.ai/clean-code.md`

Default validation for meaningful changes:

```bash
npm run typecheck
npm run lint
npm run test:unit:run
```

Run automation tests for user-visible UI changes:

```bash
npm run test:automation
```
