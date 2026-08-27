# sobtisolutions.com

Website for Sobti Solutions LLC, a family-owned real estate holding company in Ocean County, New Jersey.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/), ESLint 9
- [Bun](https://bun.sh/) runtime, deployed on [Vercel](https://vercel.com/)

## Getting started

```bash
bun install
bun dev
```

Open http://localhost:3000.

## Scripts

```bash
bun dev             # start the dev server
bun run build       # production build
bun run start       # serve the production build
bun run lint        # eslint
bun run typecheck   # tsc --noEmit
bun run test        # vitest (single run)
bun run test:watch  # vitest in watch mode
```

## Structure

```
src/
├── app/                 # routes (App Router)
├── components/
│   ├── layout/          # header, footer
│   ├── properties/      # property grid and cards
│   └── ui/              # shadcn/ui components
├── data/                # property inventory
└── lib/                 # utilities and site config
```
