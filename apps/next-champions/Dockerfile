FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/next-champions/package.json ./apps/next-champions/
COPY libs/next-shared/package.json ./libs/next-shared/
COPY libs/data-access/package.json ./libs/data-access/
COPY libs/champion/package.json ./libs/champion/
COPY libs/player/package.json ./libs/player/
COPY libs/ui/package.json ./libs/ui/
COPY libs/styles/package.json ./libs/styles/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DOCKER_BUILD=1
RUN pnpm nx run next-champions:build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/next-champions/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/next-champions/.next/static ./apps/next-champions/.next/static

USER nextjs
EXPOSE 3001
CMD ["node", "apps/next-champions/server.js"]
