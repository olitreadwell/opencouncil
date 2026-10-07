# schemalabz/opencouncil context
> refreshed 2026-10-07 | upstream default: main @ 937b59ca

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
- umbrella issue #45 (API documentation) still open; maintainer kouloumos lists remaining sub-gaps: statistics route, admin/consultations/auth registrations, contribution guide, /docs intro, and the 500 write routes return when withUserAuthorizedToEdit throws (attempted, fork PR #86)
- prior fork PRs: #1 (issue #335 seed-data), #39 (issue #644 SpeakerContribution.speakerName ES index), #81 (issue #597 i18n plurals), #86 (issue #45 write-route 401), #88 (issue #467 OG render fallback), #89 (trivial doc path refs), #90 (trivial stale refs, files disjoint from #89); #87 closed-superseded by #79, #79 closed-superseded by #89
- other maintainer-authored issues still unclaimed: #467 (OG render boundary), #446 (production npm advisories), #354 (magic-link redirect), #671 (notis failed-intro orphaning)

## Gap ledger (dedupe — READ FIRST, never re-pick)
- 2026-08-05 issue #335 — pr-opened-substantive-green (fork PR #1) — stale seed-data detection
- 2026-08-25 issue #644 — pr-opened (fork PR #39) — index SpeakerContribution.speakerName into ES
- 2026-09-09 trivial pass — pr-opened (fork PR) — typos/dead-links/stale-commands cleanup
- 2026-09-23 trivial pass — pr-opened (fork PR #78) — stale doc file-path refs in 4 docs + cityCreatorAI prompt typo
- 2026-09-24 trivial pass — pr-opened (fork PR #79) — stale doc file/component path refs in 5 docs (prisma schema path x5, landing route, admin route, notis agent templates, qr admin page)
- 2026-09-24 issue #597 — pr-opened (fork PR #81) — validate/complete ICU plural categories per locale (new validator pass; completed 2 Serbian few branches in cityOverview)
- 2026-10-02 issue #45 — pr-opened (fork PR #86) — party/meeting write routes returned 500 when withUserAuthorizedToEdit rejected; throw shared UnauthorizedError and pass ApiError through handleApiError so the documented 401 surfaces
- 2026-10-03 trivial pass — pr-opened then closed-superseded by #79 (fork PR #87) — retarget stale Elasticsearch README ToC anchors (#overview, #set-up-pgsync, #sync-data) to their real headings + README prerequisite Node.js 18+ -> 24+ (matches package.json engines); whole-repo anchor/URL/codespell sweep found only these
- 2026-10-04 issue #467 — pr-opened (this run) — native subject opengraph-image route had no render error boundary; add try/catch + eager arrayBuffer + a mark-only fallback image
- 2026-10-06 trivial pass — pr-opened (fork PR #89), closed-superseded #79 — stale doc file/component path refs (prisma schema, landing/admin routes, notis templates, TopicFilter, middleware->proxy, PlaybackBar), README version refs (Next 16 / Node 24+ / PostgreSQL 16+), 4 Elasticsearch README anchors, `exec.sh` stale script example, and spelling slips (el: εγγραφή/συνδεδεμένος, "that that", "At leaast"); 10 files, 27 changed lines — the whole-repo sweep found no dead external URLs
- 2026-10-07 trivial pass — pr-opened (fork PR #90) — six stale refs the #89 sweep missed: CLAUDE.md Postgres 14+->16+ (flake pins postgresql_16), bird-setup notis templates path, docker-usage find_duplicate_subjects->find-municipal-committee, cityStatus/mcpTokens `db/...`->`src/lib/db/...`, HighlightCompleteEmail `lib/mcp/data.ts`->`src/lib/mcp/data.ts`; 6 files / 6 lines, disjoint from #89 — bare `proxy.ts`/`auth.config.ts`/`env.mjs` mentions are deliberate shorthand, not stale paths

## Mined gaps (discovered, not yet attempted)
- 2026-10-04 commit 238ec328 ("cap every render") states "the subject element renders inside the slot", but the native subject route never calls `renderImage`/`tryAcquireOgSlot`, so it bypasses the shared OG concurrency cap the commit exists to enforce. A fix would route the metadata route through `renderImage` (Next 16 vendors @vercel/og 0.11.1, so the satori version is unchanged) — but 429-at-capacity may hurt crawler unfurls, so it needs a maintainer's call. — status: proposed
- 2026-10-04 issue #467 option 3 (not attempted): `/api/upload` -> `uploadFile` in `src/lib/s3.ts` stores uploads as-is, so WebP/AVIF logos can still enter storage (rendering already transcodes them via `getImageData`). — status: proposed
