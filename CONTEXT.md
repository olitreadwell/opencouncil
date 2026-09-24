# schemalabz/opencouncil context
> refreshed 2026-09-24 | upstream default: main @ 75dc4ee2

## Identity & policies
- upstream: schemalabz/opencouncil, default branch main, TypeScript/Next.js (Prisma, Elasticsearch, Nix flake)
- CLA/DCO: none (cla_required false, dco_required false)
- AI-assisted PR policy: allowed (bans_ai false, ai_disclosure_required false) — repo is explicitly AI-co-pilot heavy (Claude Code skills, CONTRIBUTING "co-creation partnership")
- signed commits required: no
- PR template: none (pr_template_present false) — use pipeline fallback body
- external tracker: github (issue-first: issue_first_required true; trivial self-found gaps still acceptable per loop-trivial)
- English-first: yes

## Conventions (verified from merged PRs)
- branch naming: `fix/...`, `feat/...`, `chore/...`, `docs/...` (also claude/... and dependabot/...)
- commit style: Conventional Commits `type(scope): subject`, imperative, lowercase, <72 chars, no period
- test command: `npm test` (jest); lint: `npm run lint` (eslint); typecheck: `tsc`
- CI checks that gate merge: Nix Checks (nix flake check), Notis, Integration (testcontainers), Build-and-Deploy-Preview (Cachix fork-secret caveat)
- outside PRs merge responsively; many external merges (95 in 60d)

## Maintainer picture
- active maintainers: kouloumos (recent merged PRs), christos, others; fast response
- areas in flight: decisions overview, embed widgets, search, phone hygiene

## Issue-area health
- 9 open good-first-issues / help-wanted
- prior fork PRs: #1 (issue #335 seed-data), #39 (issue #644 SpeakerContribution.speakerName ES index)

## Gap ledger (dedupe — READ FIRST, never re-pick)
- 2026-08-05 issue #335 — pr-opened-substantive-green (fork PR #1) — stale seed-data detection
- 2026-08-25 issue #644 — pr-opened (fork PR #39) — index SpeakerContribution.speakerName into ES
- 2026-09-09 trivial pass — pr-opened (fork PR) — typos/dead-links/stale-commands cleanup
- 2026-09-23 trivial pass — pr-opened (fork PR #78) — stale doc file-path refs in 4 docs + cityCreatorAI prompt typo
- 2026-09-24 trivial pass — pr-opened (fork PR #79) — stale doc file/component path refs in 5 docs (prisma schema path x5, landing route, admin route, notis agent templates, qr admin page)
- 2026-09-24 issue #597 — pr-opened (fork PR #81) — validate/complete ICU plural categories per locale (new validator pass; completed 2 Serbian few branches in cityOverview)

## Mined gaps (discovered, not yet attempted)
- 2026-09-09 trivial/minor-fix pass across whole repo (typos, dead links, stale command refs, wrong doc lines) — status: attempted
