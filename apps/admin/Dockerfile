# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root package.json and pnpm files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy tsconfig files
COPY tsconfig*.json ./

# Copy turbo config
COPY turbo.json ./

# Copy packages
COPY packages/ ./packages/

# Copy apps
COPY apps/admin/ ./apps/admin/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the app
WORKDIR /app/apps/admin
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/apps/admin/public ./public
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./.next/static

# Copy package.json for dependencies info
COPY --from=builder /app/apps/admin/package.json ./

USER nextjs

EXPOSE 8001

ENV PORT=8001

CMD ["node", "server.js"]
