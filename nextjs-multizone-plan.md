# Next.js Multi-Zone Migration Plan

## Overview

Migrate the existing Vike + Module Federation frontend to a **Next.js 16 multi-zone** architecture.
Each frontend is an independent Next.js app (zone) that is self-deployable. The shell zone owns
routing and auth; sub-zones own their feature sub-trees. The existing `apps/api` Hono backend is
unchanged.

---

## Target Architecture

```
Browser → next-shell (port 3000)
             ├── /                 → next-shell home
             ├── /login            → next-shell login (NextAuth)
             ├── /champions/**     → rewrite → next-champions (port 3001)
             ├── /tier-list/**     → rewrite → next-tier-list (port 3002)
             └── /player/**        → rewrite → next-player (port 3003)  [auth-guarded]
                                             ↓
                                       apps/api (port 3100)
```

### Zones

| Zone      | Dir                   | Port | Auth Required |
| --------- | --------------------- | ---- | ------------- |
| Shell     | `apps/next-shell`     | 3000 | partial       |
| Champions | `apps/next-champions` | 3001 | no            |
| Tier List | `apps/next-tier-list` | 3002 | no            |
| Player    | `apps/next-player`    | 3003 | yes           |

---

## Key Technology Decisions

| Concern               | Choice                                                         |
| --------------------- | -------------------------------------------------------------- |
| Framework             | Next.js 16.2.4 — App Router only                               |
| Auth                  | NextAuth.js v5 (`next-auth`) — JWT, shared `AUTH_SECRET`       |
| Auth guard middleware | `proxy.ts` (Next.js 16 — replaces deprecated `middleware.ts`)  |
| Bundler               | Turbopack (default in Next.js 16, no config needed)            |
| CSS                   | Tailwind CSS v4 via `@tailwindcss/postcss`                     |
| State                 | Jotai (client filter state only — `next-tier-list`)            |
| StencilJS SSR         | `@stencil/react-output-target/ssr` — Declarative Shadow DOM    |
| Web-component hosting | `next-player` zone hosts `<rift-player-app>` as SSR'd React    |
| NX                    | `@nx/next` executors; `nx:run-commands` fallback               |
| Linter                | Oxlint with `nextjs` plugin (no `next lint`)                   |
| Formatter             | Oxfmt                                                          |
| Deployment            | Docker — `next start` with `output: "standalone"`, self-hosted |

---

## Next.js 16 Specifics

- **`proxy.ts`** replaces `middleware.ts` (deprecated). Export a `proxy` function instead of `default`.
- **`params`/`searchParams`** are `Promise<...>` — must `await` them in page components.
- **`await cookies()`**, **`await headers()`** required in Server Components.
- **Turbopack** is the default bundler — no webpack config needed.
- **`"use cache"`** directive available (opt-in via `cacheComponents: true`).
- **`next lint`** command is removed — use Oxlint directly.
- **Server Actions** in non-shell zones need `serverActions: { allowedOrigins: [SHELL_ORIGIN] }`.
- **`assetPrefix`** required on all non-shell zones to avoid static asset URL conflicts.
- **React 19.2** — View Transitions, `useEffectEvent`, `Activity` available.
- **Node.js 20.9+** required (workspace: Node 24).

---

## Shared Library: `libs/next-shared` (`@rift/next-shared`)

New library providing shared Next.js infrastructure across all zones.

### Exports

```
src/
  auth/
    config.ts          # NextAuthConfig — Credentials provider (demo: rift-demo/demo)
  proxy/
    createAuthProxy.ts # Factory: (auth) => proxy function for guarding routes
  components/
    Header.tsx         # Async Server Component — reads session, renders Nav + auth UI
    Nav.tsx            # Cross-zone <a> links (hard nav crosses zone boundary)
    SignOutButton.tsx   # 'use client' — form action wrapping zone's signOut
  theme/
    ThemeProvider.tsx  # 'use client' — rift-theme cookie-aware ThemeProvider (migrated)
    ThemeSwitcher.tsx  # 'use client' — System/Light/Dark control (migrated)
  providers/
    Providers.tsx      # 'use client' — JotaiProvider + ThemeProvider wrapper
  index.ts
```

### Auth flow

- Shell owns `GET|POST /api/auth/**` (NextAuth `handlers`)
- All zones share `AUTH_SECRET` and set `AUTH_URL` → shell URL
- Non-shell zones call `auth()` (read-only) to get session; `signOut()` posts to shell's handler
- `next-player` uses `proxy.ts` to redirect unauthenticated requests to `/login`

---

## Data Access: `libs/data-access` additions

Add server-side fetch utilities (no React hooks) under `src/server/`:

```
src/server/
  champions.ts   # fetchChampions, fetchChampion, fetchChampionAbilities, fetchChampionSkins
  tier-list.ts   # fetchTierList
  player.ts      # fetchPlayerMe, fetchPlayerChampions, fetchPlayerMatches
  index.ts       # barrel
```

These are plain `async` functions (not React hooks) for use in Next.js `page.tsx` Server Components.

---

## Stencil SSR in Next.js

The existing `libs/ui` and `apps/mfe-player` already have `dist-hydrate-script` output targets and
`@stencil/react-output-target` generating `components.server.ts`.

`libs/ui/package.json` exports already use the `"node"` condition:
```json
"./react": {
  "node": "./src/react/components.server.ts",
  "import": "./src/react/components.ts"
}
```

In Next.js App Router (Node.js environment), importing `@rift/ui/react` automatically resolves to
`components.server.ts` which calls Stencil's `renderToString` → Declarative Shadow DOM output.

Each Next.js zone that uses Stencil components must add to `next.config.ts`:
```ts
serverExternalPackages: ['@rift/ui/hydrate', '@rift/mfe-player/hydrate'],
transpilePackages: ['@rift/ui', '@rift/next-shared'],
```

---

## CSS / Tailwind v4

Next.js 16 zones use `@tailwindcss/postcss` (PostCSS plugin) with Turbopack:

```js
// postcss.config.mjs
export default { plugins: { '@tailwindcss/postcss': {} } }
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "@rift/styles/tokens.css";
@import "@rift/styles/components.css";
```

---

## Zone Configuration Details

### `apps/next-shell`

```ts
// next.config.ts
const config: NextConfig = {
  async rewrites() {
    return [
      { source: '/champions/:path*', destination: `${NEXT_CHAMPIONS_URL}/champions/:path*` },
      { source: '/champions-static/:path*', destination: `${NEXT_CHAMPIONS_URL}/champions-static/:path*` },
      { source: '/tier-list/:path*', destination: `${NEXT_TIER_LIST_URL}/tier-list/:path*` },
      { source: '/tier-list-static/:path*', destination: `${NEXT_TIER_LIST_URL}/tier-list-static/:path*` },
      { source: '/player/:path*', destination: `${NEXT_PLAYER_URL}/player/:path*` },
      { source: '/player-static/:path*', destination: `${NEXT_PLAYER_URL}/player-static/:path*` },
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
    ]
  },
  transpilePackages: ['@rift/next-shared', '@rift/ui'],
  serverExternalPackages: ['@rift/ui/hydrate'],
}
```

Shell pages:
- `app/page.tsx` — home, shows sign-in status
- `app/login/page.tsx` — NextAuth credentials form
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handlers

### `apps/next-champions`

```ts
const config: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/champions-static' : undefined,
  basePath: '/champions',
  serverActions: { allowedOrigins: [process.env.SHELL_ORIGIN!] },
  transpilePackages: ['@rift/next-shared', '@rift/ui'],
  serverExternalPackages: ['@rift/ui/hydrate'],
}
```

Pages:
- `app/champions/page.tsx` — champions grid (Server Component + `fetchChampions`)
- `app/champions/[id]/page.tsx` — champion detail (Server Component + `fetchChampion`)

### `apps/next-tier-list`

```ts
const config: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tier-list-static' : undefined,
  basePath: '/tier-list',
  serverActions: { allowedOrigins: [process.env.SHELL_ORIGIN!] },
  transpilePackages: ['@rift/next-shared', '@rift/ui'],
}
```

Pages:
- `app/tier-list/page.tsx` — server fetches tier list with URL-sync filter state (Jotai atoms in client layer)

### `apps/next-player`

```ts
const config: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/player-static' : undefined,
  basePath: '/player',
  serverActions: { allowedOrigins: [process.env.SHELL_ORIGIN!] },
  transpilePackages: ['@rift/next-shared', '@rift/mfe-player'],
  serverExternalPackages: ['@rift/mfe-player/hydrate'],
}
```

`proxy.ts` guards all `/player/**` routes — unauthenticated → redirect to `AUTH_URL/login`.

Pages:
- `app/player/page.tsx` — player dashboard (Server Component + `<RiftPlayerApp>` Stencil component)

---

## Authentication Deep Dive

### Credentials flow (demo)

Demo credentials: username `rift-demo`, password `demo`.

1. User visits `/login` in shell
2. Shell's login page calls `signIn('credentials', ...)` server action
3. NextAuth sets a JWT cookie (`next-auth.session-token`) with `AUTH_SECRET`
4. User navigates to `/player` → shell rewrites to `next-player:3003`
5. `next-player`'s `proxy.ts` calls `auth()` → verifies JWT with same `AUTH_SECRET`
6. If valid, request passes; if not, redirect to `{AUTH_URL}/login`

### Cookie scope

The JWT cookie must be set with `domain=.rift.local` (or your production domain) and `SameSite=Lax`
so all zones on the same domain can read it.

```ts
// libs/next-shared/src/auth/config.ts
export const authConfig: NextAuthConfig = {
  cookies: {
    sessionToken: {
      options: { domain: process.env.COOKIE_DOMAIN ?? undefined, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
    }
  }
}
```

---

## NX Integration

Each zone gets a `project.json` using `@nx/next` executors:

```json
{
  "targets": {
    "build": { "executor": "@nx/next:build", "options": { "outputPath": "dist/apps/next-shell" } },
    "dev":   { "executor": "@nx/next:server", "options": { "buildTarget": "next-shell:build", "dev": true } },
    "lint":  { "executor": "nx:run-commands", "options": { "command": "pnpm oxlint --type-aware src app" } },
    "fmt":   { "executor": "nx:run-commands", "options": { "command": "pnpm oxfmt src app" } }
  }
}
```

---

## Docker / Deployment

Each zone is containerized with Next.js `output: "standalone"`:

```dockerfile
FROM node:20-alpine AS runner
COPY --from=builder /app/apps/next-shell/.next/standalone ./
COPY --from=builder /app/apps/next-shell/.next/static ./apps/next-shell/.next/static
CMD ["node", "apps/next-shell/server.js"]
```

`docker-compose.yml` wires all 5 services (4 zones + api) on an internal network.

---

## Environment Variables

| Variable              | Owner     | Purpose                                             |
| --------------------- | --------- | --------------------------------------------------- |
| `AUTH_SECRET`         | all zones | NextAuth JWT signing secret (must be identical)     |
| `AUTH_URL`            | all zones | Shell's public URL (NextAuth callback base)         |
| `NEXT_CHAMPIONS_URL`  | shell     | Next-champions internal URL for rewrites            |
| `NEXT_TIER_LIST_URL`  | shell     | Next-tier-list internal URL for rewrites            |
| `NEXT_PLAYER_URL`     | shell     | Next-player internal URL for rewrites               |
| `API_URL`             | shell     | Hono API internal URL for rewrites                  |
| `NEXT_PUBLIC_API_URL` | all zones | Browser-visible API URL (empty = same-origin proxy) |
| `SHELL_ORIGIN`        | non-shell | Shell's origin for `serverActions.allowedOrigins`   |
| `COOKIE_DOMAIN`       | shell     | Auth cookie domain for cross-zone sharing           |
| `DATABASE_URL`        | api       | SQLite path                                         |
| `PORT`                | per zone  | Listening port                                      |

---

## Oxlint — Next.js Plugin

Add to `oxlint.config.ts`:

```ts
plugins: ['typescript', 'import', 'react', 'react-perf', 'jsx-a11y', 'vitest', 'unicorn', 'nextjs'],
```

And scoped override for Next.js zones (removes Vike-era noise):

```ts
{
  files: ['apps/next-*/**'],
  rules: {
    'nextjs/no-img-element': 'warn',
    'nextjs/no-html-link-for-pages': 'error',
    'nextjs/no-async-client-component': 'error',
    'nextjs/no-head-element': 'error',
  },
},
```

---

## Migration Phases

### Phase 0 — Pre-requisites ✅ (in progress)
- [x] Install `@nx/next@22.7.0`
- [ ] Add `next`, `next-auth`, `@tailwindcss/postcss` to pnpm catalog
- [ ] Create `.env.example`

### Phase 1 — Shared Infrastructure
- [ ] **1a** Create `libs/next-shared` (`@rift/next-shared`)
- [ ] **1b** Add server-side fetch utilities to `libs/data-access`
- [ ] **1c** Update `tsconfig.base.json` paths + `libs/ui/package.json` exports

### Phase 2 — Scaffold Next.js Zones
- [ ] **2a** `apps/next-shell`
- [ ] **2b** `apps/next-champions`
- [ ] **2c** `apps/next-tier-list`
- [ ] **2d** `apps/next-player`

### Phase 3 — Feature Migration
- [ ] **3a** Shell: home, login, NextAuth handlers
- [ ] **3b** Champions: grid + detail with Stencil SSR
- [ ] **3c** Tier list: Jotai filters + server-rendered rows
- [ ] **3d** Player: auth guard + Stencil player-app SSR

### Phase 4 — Relocate `apps/mfe-player` → `libs/player-ui`
- [ ] Create `@rift/player-ui` package
- [ ] Update `next-player` to import from `@rift/player-ui`

### Phase 5 — Infrastructure
- [ ] Docker Compose + per-zone Dockerfiles
- [ ] Update `oxlint.config.ts` with `nextjs` plugin
- [ ] Update root `pnpm dev` script

### Phase 6 — Cleanup (after verification)
- [ ] Remove old Vike apps: `apps/shell`, `apps/mfe-champions`, `apps/mfe-tier-list`
- [ ] Remove `apps/mfe-player` (replaced by `libs/player-ui`)
- [ ] Remove `vike`, `vike-react`, `@module-federation/vite` from catalog

---

## Open Questions / Future Work

- **MFE discovery**: Consider [AWS Frontend Discovery](https://github.com/awslabs/frontend-discovery) for runtime zone registration
- **Streaming**: Use React 19 `Suspense` + `loading.tsx` for progressive enhancement
- **View Transitions**: React 19.2 View Transitions API for seamless cross-zone navigation
- **Cache strategy**: Evaluate `"use cache"` directive for champion/tier-list data (stable data)
- **E2E tests**: Add Playwright multi-zone test suite against Docker Compose

---

*Last updated: Phase 0 — `@nx/next` installed, scaffolding in progress.*
