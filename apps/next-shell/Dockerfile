FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/next-shell/package.json ./apps/next-shell/
COPY libs/next-shared/package.json ./libs/next-shared/
COPY libs/data-access/package.json ./libs/data-access/
COPY libs/champion/package.json ./libs/champion/
COPY libs/player/package.json ./libs/player/
COPY libs/ui/package.json ./libs/ui/
COPY libs/styles/package.json ./libs/styles/
RUN pnpm install --frozen-lockfile

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DOCKER_BUILD=1
RUN pnpm nx run next-shell:build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/next-shell/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/next-shell/.next/static ./apps/next-shell/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/next-shell/public ./apps/next-shell/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/next-shell/server.js"]
