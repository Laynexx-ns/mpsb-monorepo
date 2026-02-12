# PREPARE
FROM oven/bun:1 AS prepare

RUN bun install -g turbo@^2


WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY .env ./

COPY packages ./packages
COPY apps ./apps

RUN turbo prune @mpsb-monorepo/frontend --docker

# BUILDER
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=prepare /app/out/json/ ./
RUN bun i

COPY --from=prepare /app/out/full/ ./

RUN ls -R apps

# RUNNER
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
