FROM node:20.11-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@kiln/bench

FROM base AS runner
WORKDIR /app
COPY --from=builder /app /app

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Start the bench app
CMD ["pnpm", "--filter", "@kiln/bench", "start"]
