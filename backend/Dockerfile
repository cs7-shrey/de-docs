FROM oven/bun:alpine AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bunx --bun prisma generate

ENV PORT=3000
ENV NODE_ENV="production"

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run src/index.ts"]