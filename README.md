# mpsb-monorepo

This is a simple bot for 1580 school.
It saves students' homeworks and sends them to yandex disk

There are three typescript services:

- bot on **Gramio**
- backend on **Elysia**
- frontend on **Vue**

Also, there are two data sources, that defined in docker compose file:

- PostgreSQL (main datasource)
- Redis (cache, used by bot service)

## Features

- **TypeScript** - For type safety and improved developer experience
- **Elysia** - Type-safe, high-performance framework
- **Bun** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Turborepo** - Optimized monorepo build system
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality

## Getting Started

Installing dependencies

```bash
bun i
```

create env file

```bash
touch .env
```

and then configure it using `.env.example` file

Run databases for local development

```bash
docker compose -f docker-compose.local.ymlm up -d
```

Run all services using turborepo

```bash
turbo dev
```

The API is running at [http://localhost:3000](http://localhost:3000).
Frontend is running at [http://localhost:5173](http://localhost:5173).

## Git Hooks and Formatting

- Initialize hooks: `bun run prepare`
- Format and lint fix: `bun run check`

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:generate`: Generate database client/types
- `bun run db:migrate`: Run database migrations
- `bun run db:studio`: Open database studio UI
- `bun run check`: Run Biome formatting and linting
