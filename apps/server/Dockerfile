# PREPARE
FROM oven/bun:1 AS prepare

RUN bun install -g turbo@^2


WORKDIR /app

COPY package.json bun.lock turbo.json ./


COPY packages ./packages
COPY apps ./apps

RUN turbo prune @mpsb-monorepo/server --docker

# BUILDER
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=prepare /app/out/json/ ./
RUN bun i

COPY --from=prepare /app/out/full/ ./
RUN ls -a


WORKDIR /app/packages/db/
RUN ls -a

RUN bunx --bun prisma generate


WORKDIR /app

RUN bunx --bun turbo build

RUN ls -R apps/server

# RUNNER (SERVER)
FROM oven/bun:1 AS runner



COPY --from=builder /app ./

RUN bun i --production

RUN ls -R apps/server


USER bun
EXPOSE 3000

CMD ["bun", "apps/server/src/index.ts"]
