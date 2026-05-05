# player-ui

Stencil web component package for the player profile MFE.

**Relocated from** `apps/mfe-player` → `libs/player-ui`.

## Migration Steps

Source files need to be copied from the original location:

```bash
# From repo root
cp -r apps/mfe-player/src/components libs/player-ui/src/
cp -r apps/mfe-player/src/data libs/player-ui/src/
cp apps/mfe-player/src/index.ts libs/player-ui/src/
cp apps/mfe-player/src/components.d.ts libs/player-ui/src/

# Then build to regenerate react output targets with @rift/player-ui package name
pnpm nx run player-ui:build
```

## Stencil SSR

This package generates:
- `hydrate/` — `renderToString` module for Declarative Shadow DOM output
- `src/react/components.server.ts` — React wrapper using `@stencil/react-output-target/ssr`

In Next.js Server Components, import from `@rift/player-ui/react` — the `"node"` condition
automatically resolves to `components.server.ts` for SSR rendering.
