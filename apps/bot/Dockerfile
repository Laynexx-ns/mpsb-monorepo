FROM oven/bun:1 AS prepare

RUN bun install -g turbo@^2

WORKDIR /app

COPY package.json bun.lock turbo.json ./

COPY packages ./packages
COPY apps ./apps

RUN turbo prune @mpsb-monorepo/bot --docker

# BUILDER
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=prepare /app/out/json/ ./
RUN bun i

COPY --from=prepare /app/out/full/ ./

WORKDIR /app/packages/db

RUN bunx --bun prisma generate

WORKDIR /app

RUN bunx --bun turbo build

# RUNNER (BOT)
FROM oven/bun:1 AS runner

COPY --from=builder /app ./

RUN bun i --production

RUN ls -R apps/bot


USER bun
EXPOSE 3000

CMD ["bun", "apps/bot/index.ts"]
