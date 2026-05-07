# rift — TanStack Start MFE Architecture Plan

> Status: **Implementation in progress.**
> Lab location: `labs/tanstack-mfe/`
> Goal: demonstrate the same multi-zone MFE pattern as `apps/next-*` using TanStack Start (RC)
> instead of Next.js. Routes live 100% in MFEs. Shell is a thin proxy + auth host.

---

## Architecture Overview

```
Browser → ts-shell (port 3000)
             ├── /                 → ts-shell home
             ├── /login            → ts-shell login (Auth.js)
             ├── /api/auth/**      → ts-shell Auth.js handler
             ├── /champions/**     → Nitro proxy → ts-champions (port 3001)
             ├── /tier-list/**     → Nitro proxy → ts-tier-list (port 3002)
             └── /player/**        → Nitro proxy → ts-player (port 3003) [auth-guarded]
                                                ↓
                                          apps/api (port 3100)
```

Each MFE zone is a **complete, standalone TanStack Start application** with access to the full
framework: TanStack Router, `createServerFn`, server routes, streaming SSR, selective SSR,
loaders, `@tanstack/react-query`, and the full Vite plugin ecosystem.

---

## Zones

| Zone       | Dir                                   | Port | Auth Required |
| ---------- | ------------------------------------- | ---- | ------------- |
| Shell      | `labs/tanstack-mfe/apps/ts-shell`     | 3000 | partial       |
| Champions  | `labs/tanstack-mfe/apps/ts-champions` | 3001 | no            |
| Tier List  | `labs/tanstack-mfe/apps/ts-tier-list` | 3002 | no            |
| Player     | `labs/tanstack-mfe/apps/ts-player`    | 3003 | yes           |
| Shared lib | `labs/tanstack-mfe/libs/ts-shared`    | —    | —             |

---

## Technology Decisions

| Concern            | Choice                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| Framework          | TanStack Start RC — `@tanstack/react-start` + `vinxi`                    |
| Routing            | TanStack Router (file-based, per zone)                                   |
| SSR                | Full-document SSR via TanStack Start streaming handler                   |
| Shell proxy        | Nitro `routeRules` in `app.config.ts` — zero route files for MFE paths   |
| Cross-zone nav     | `<a href>` hard links (full-page reload at zone boundary)                |
| Intra-zone nav     | TanStack Router `<Link>` — SPA, no reload                                |
| Auth               | `@auth/core` with shared `authjsConfig` from `@rift/auth`                |
| CSS                | Tailwind CSS v4 via `@tailwindcss/vite`                                  |
| State              | Jotai (client filter state in ts-tier-list)                              |
| Player stack       | TanStack Start (React) + Stencil components from `@rift/ui`              |
| Data access        | Reuse `@rift/data-access` server fetchers in `loader` / `createServerFn` |
| API                | `apps/api` unchanged (Hono + Drizzle + SQLite, port 3100)                |
| Shared lib         | `@rift/ts-shared` — nav links, Header, theme, providers                  |
| Bundler            | Vinxi (TanStack Start's build system over Vite)                          |
| Linter / Formatter | Oxlint + Oxfmt (same as rest of workspace)                               |

---

## Key Design: Zone-Aware Navigation

Cross-zone and intra-zone navigation uses different mechanisms to avoid full reloads
when staying within the same zone:

```
NAV_LINKS (from @rift/ts-shared)
  { href: '/',          zone: 'shell'     }
  { href: '/champions', zone: 'champions' }
  { href: '/tier-list', zone: 'tier-list' }
  { href: '/player',    zone: 'player'    }
```

Each zone's `__root.tsx` passes a `renderLink` function to `<Header>`:

```tsx
// In ts-champions __root.tsx
function renderLink(href, zone, children, className) {
  if (zone === 'champions') {
    // Same zone → TanStack Router <Link> (SPA, no reload)
    return <Link to={href} className={className}>{children}</Link>
  }
  // Different zone → <a> (hard nav, crosses zone boundary)
  return <a href={href} className={className}>{children}</a>
}
```

`@rift/ts-shared` exports `NAV_LINKS` + a headless `<Header>` that accepts `renderLink`.
The lib has zero dependency on TanStack Router — each zone owns its own router.

---

## Shell Proxy (Nitro routeRules)

```ts
// labs/tanstack-mfe/apps/ts-shell/app.config.ts
server: {
  routeRules: {
    // Zone proxies — preserve /zone-name/ prefix in target
    '/champions/**':        { proxy: `${TS_CHAMPIONS_URL}/champions/**` },
    '/champions-static/**': { proxy: `${TS_CHAMPIONS_URL}/champions-static/**` },
    '/tier-list/**':        { proxy: `${TS_TIER_LIST_URL}/tier-list/**` },
    '/tier-list-static/**': { proxy: `${TS_TIER_LIST_URL}/tier-list-static/**` },
    '/player/**':           { proxy: `${TS_PLAYER_URL}/player/**` },
    '/player-static/**':    { proxy: `${TS_PLAYER_URL}/player-static/**` },
    // API proxy — Nitro ** substitution strips /api prefix
    '/api/champions/**':    { proxy: `${API_URL}/champions/**` },
    '/api/tier-list/**':    { proxy: `${API_URL}/tier-list/**` },
    '/api/health':          { proxy: `${API_URL}/health` },
    // /api/auth/** is NOT proxied — handled by ts-shell's own server route
  }
}
```

**How the `**` substitution works in Nitro:**
- Source `/champions/**`, target `${URL}/champions/**`
- Request `/champions/ahri` → source captures `ahri` → target = `${URL}/champions/ahri`
- Source `/api/champions/**`, target `${API_URL}/champions/**`
- Request `/api/champions/ahri` → source captures `ahri` → target = `${API_URL}/champions/ahri`
  _(strips the `/api/` prefix — matches Hono's route at `/champions/:id`)_

---

## Zone Auth Flow

1. User visits `/login` → ts-shell serves login page
2. Shell's `POST /api/auth/callback/credentials` verifies credentials via `@rift/auth`'s `authjsConfig`
3. Auth.js sets a JWT cookie (`AUTH_SECRET` is shared across all zones)
4. User navigates to `/player/**` → shell's Nitro proxy forwards to ts-player
5. ts-player's root route `beforeLoad` calls `getServerSession` (server fn) — verifies JWT
6. If unauthenticated: redirect to `/login?callbackUrl=/player`
7. If authenticated: player loader fetches from API with forwarded cookie

---

## TanStack Start Full Framework Access Per Zone

Since each zone is a standalone TanStack Start app, each gets:

| Feature                                                                   | Available |
| ------------------------------------------------------------------------- | --------- |
| TanStack Router (nested routes, loaders, search params, `validateSearch`) | ✅         |
| `createServerFn` — type-safe client↔server RPCs                           | ✅         |
| Server routes (`route.server.handlers`)                                   | ✅         |
| Middleware + router context                                               | ✅         |
| Streaming SSR / React 19 Suspense                                         | ✅         |
| Selective SSR per route                                                   | ✅         |
| `@tanstack/react-query` integration                                       | ✅         |
| ISR / static prerendering                                                 | ✅         |
| Full Vite plugin ecosystem                                                | ✅         |

The **only** cross-zone limitation: navigating from `/champions` to `/tier-list` is a
full-page reload. Within a zone, TanStack Router handles everything as SPA.

---

## Performance Strategy

| Concern            | Approach                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Initial load (FCP) | Full SSR per zone, streamed HTML (React 19 Suspense)                                            |
| Data fetching      | `createServerFn` in `loader` — data arrives with streamed HTML, no client waterfall             |
| Client navigation  | TanStack Router per-route code splitting + `defaultPreload: 'intent'` (prefetch on hover/focus) |
| Client caching     | `@tanstack/react-query` stale-while-revalidate for champion/tier-list data                      |
| Tier list filters  | `validateSearch` in route → URL-driven → SSR filters data, not client-side                      |
| Cross-zone nav     | `<a href>` hard nav — new request hits the shell which proxies to that zone's SSR               |
| Stencil SSR        | Declarative Shadow DOM via `@rift/ui`'s `"node"` package export condition                       |
| Production assets  | Per-zone `assetDir` prefix (`champions-static/`, etc.) + shell's proxy rules                    |

---

## File Structure

```
labs/
  tanstack-mfe-plan.md          ← this file
  tanstack-mfe/
    apps/
      ts-shell/
        app.config.ts            ← Nitro proxy routeRules
        app/
          router.tsx
          client.tsx
          ssr.tsx
          routes/
            __root.tsx           ← HTML shell, Header (shell zone renderLink)
            index.tsx            ← Home page
            login.tsx            ← Auth.js login form
            api/auth/$.ts        ← Auth.js wildcard server route
          lib/
            session.server.ts    ← createServerFn: getServerSession
          styles/globals.css
      ts-champions/
        app.config.ts
        app/
          router.tsx
          client.tsx
          ssr.tsx
          routes/
            __root.tsx           ← Header (champions zone renderLink)
            champions/
              index.tsx          ← Champions list (loader → fetchChampions)
              $id.tsx            ← Champion detail (loader → fetchChampionDetail)
          styles/globals.css
      ts-tier-list/
        app.config.ts
        app/
          router.tsx
          client.tsx
          ssr.tsx
          routes/
            __root.tsx
            tier-list/
              index.tsx          ← Tier list (validateSearch + loader + Jotai client filter)
          tier-list/
            tier-list.atoms.ts   ← tierAtom, roleAtom, patchAtom
            TierListView.tsx     ← client filter UI
            parse-filters.ts
          styles/globals.css
      ts-player/
        app.config.ts
        app/
          router.tsx
          client.tsx
          ssr.tsx
          routes/
            __root.tsx           ← beforeLoad auth guard at root
            player/
              index.tsx          ← Player dashboard (loader → fetchPlayer*)
          styles/globals.css
    libs/
      ts-shared/
        src/
          nav-links.ts           ← NAV_LINKS, NavZone type
          components/
            Header.tsx           ← renderLink prop pattern
            Nav.tsx
            SignOutButton.tsx
          theme/
            constants.ts
            ThemeProvider.tsx
            ThemeSwitcher.tsx
          providers/
            Providers.tsx
          index.ts
```

---

## Environment Variables

| Variable           | Owner     | Purpose                                        |
| ------------------ | --------- | ---------------------------------------------- |
| `AUTH_SECRET`      | all zones | Auth.js JWT signing secret (must be identical) |
| `AUTH_URL`         | all zones | Shell's public URL (Auth.js callback base)     |
| `TS_CHAMPIONS_URL` | shell     | ts-champions internal URL for proxy            |
| `TS_TIER_LIST_URL` | shell     | ts-tier-list internal URL for proxy            |
| `TS_PLAYER_URL`    | shell     | ts-player internal URL for proxy               |
| `API_URL`          | all zones | Hono API URL (SSR direct)                      |
| `VITE_API_URL`     | all zones | Browser API URL (empty = same-origin proxy)    |
| `PORT`             | per zone  | Listening port                                 |

---

## Dev Workflow

```bash
# Start all zones + API
pnpm nx run-many -t dev --projects=ts-shell,ts-champions,ts-tier-list,ts-player,api --parallel

# Or individually
pnpm nx run ts-shell:dev        # http://localhost:3000 (shell + proxy)
pnpm nx run ts-champions:dev    # http://localhost:3001 (zone, accessible directly)
pnpm nx run ts-tier-list:dev    # http://localhost:3002
pnpm nx run ts-player:dev       # http://localhost:3003
pnpm nx run api:dev             # http://localhost:3100

# First time: generate TanStack Router route tree
# (auto-generated on `vinxi dev` start — routeTree.gen.ts is gitignored)
```

---

## Comparison with Next.js Multi-zone

| Concern             | Next.js Multi-zone                     | TanStack Start MFE                          |
| ------------------- | -------------------------------------- | ------------------------------------------- |
| Shell proxy         | `rewrites()` in `next.config.ts`       | Nitro `routeRules` in `app.config.ts`       |
| Auth guard          | `proxy.ts` (Next.js 16 middleware)     | Root route `beforeLoad` + `createServerFn`  |
| Route ownership     | Per-zone `app/` directory              | Per-zone `app/routes/` directory            |
| Cross-zone nav      | `<a href>` (same)                      | `<a href>` (same)                           |
| Intra-zone nav      | Next.js `<Link>` (SPA)                 | TanStack Router `<Link>` (SPA)              |
| Active link state   | `usePathname()` from `next/navigation` | `<Link activeProps>` or `useMatch`          |
| Data fetching (SSR) | Server Components (async function)     | `loader` + `createServerFn`                 |
| Search params       | `await searchParams` in page           | `validateSearch` in route (type-safe)       |
| Streaming           | React `Suspense` + `loading.tsx`       | React `Suspense` + `Route.pendingComponent` |
| Dev bundler         | Turbopack                              | Vinxi (Vite-based)                          |
| Config file         | `next.config.ts`                       | `app.config.ts`                             |

---

## Notes & Future Work

- **ISR**: TanStack Start supports static prerendering + ISR. Champions list (stable data)
  is a good candidate for `{ revalidate: 3600 }` on the route loader.
- **Module Federation upgrade path**: Same as existing `apps/shell` — add
  `@module-federation/vite` for seamless cross-zone SPA navigation (no page reload).
  This is a clean Phase 2 on top of the existing multi-zone foundation.
- **routeTree.gen.ts**: Auto-generated by TanStack Router's codegen when `vinxi dev` starts.
  Checked into `.gitignore`. TypeScript will show errors until the first `vinxi dev` run.
- **`@tanstack/react-query`**: Not wired in the initial implementation. Add
  `QueryClient` in `Providers.tsx` and use `routerWithQueryClient` for deduplication.

---

*Written: 2026-05-07*
*Zones: ts-shell (3000), ts-champions (3001), ts-tier-list (3002), ts-player (3003), api (3100)*
