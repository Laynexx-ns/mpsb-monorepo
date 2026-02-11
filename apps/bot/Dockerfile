FROM oven/bun:1

WORKDIR /usr/src/app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --production


COPY --chown=bun:bun . .

RUN mkdir -p /usr/src/app/tmp && chown -R bun:bun /usr/src/app/tmp
RUN chown -R bun:bun /usr/src/app

USER bun
EXPOSE 3000

CMD bunx --bun prisma generate && bun index
