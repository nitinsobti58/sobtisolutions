<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sobti Solutions — agent instructions

Read `docs/sobtisolutions-site-plan.md` in full before writing code. It is the spec: goals, stack, content model, build phases, acceptance criteria, and known pitfalls.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui (Base UI, `base-nova` preset, lucide icons), Bun, ESLint 9, Vitest. Flat single package. No MDX, no dark mode, no CMS. Deploys to Vercel at https://sobtisolutions.com.

## Layout

- `src/app` — routes: `/`, `/properties`, `/about`, `/contact`. Plain TSX pages with per-route metadata.
- `src/data/properties.ts` — the property inventory. Single source of truth: the grid, the homepage strip, and the empty state all derive from it. Adding a property is one entry plus photos, nothing else.
- `src/components/layout` — header, footer. `src/components/properties` — grid and cards. `src/components/ui` — shadcn output (do not hand-edit).
- `src/lib/site.ts` — name, URL, contact email, legal line. The only place the domain is written.

## Hard rules

- Light theme only. One accent. Every color is a CSS variable in `globals.css`.
- `Property.address` is never rendered unless `showAddress` is true. Never spread a `Property` into rendered attributes or JSON-LD.
- Contact mail goes out through Zoho SMTP. From is always the authenticated mailbox; the submitter goes in Reply-To. User input never reaches the From header.
- No database, no CMS, no per-property routes, no tenant features in v1.
- Repo is public. No secrets in code or history. `.env.local` is gitignored; `.env.example` documents variable names only.
- Base UI components use a `render` prop, not Radix's `asChild`. Link-styled buttons: `<Link className={buttonVariants({...})}>`.

## Commits

- Plain, descriptive commit messages in the imperative mood. No trailers, no tool attribution, no generated sign-offs of any kind. The author is the repo owner's git identity.

## Workflow

- `bun dev` / `bun run build` / `bun run lint` / `bun run typecheck` / `bun run test`.
- Build phases are sequential (spec §8). Verify each phase's exit check before starting the next. Phase 1 ends with the owner approving the homepage comp; nothing else gets styled before that.
