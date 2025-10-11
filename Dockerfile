# Multi-stage Dockerfile optimized for Next.js builds with better caching
# - deps: install dependencies with optimal caching
# - builder: build the Next app with selective file copying
# - runner: minimal runtime image

# Stage 1 — deps (install dependencies with optimal caching)
FROM node:20-bullseye-slim AS deps
WORKDIR /app

# Install only essential build tools for Next.js
RUN apt-get update && apt-get install -y \
    ca-certificates \
    build-essential \
    python3 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (dev + prod) - npm ci for faster, reliable installs
RUN npm ci --only=production --no-audit --no-fund && \
    npm ci --only=development --no-audit --no-fund

# Stage 2 — builder (build the Next.js app with selective copying)
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy installed dependencies from deps stage (better caching)
COPY --from=deps /app/node_modules ./node_modules

# Copy package files first (for caching)
COPY package.json package-lock.json* ./

# Copy configuration files that affect build
COPY next.config.js* ./
COPY tsconfig.json* ./
COPY tailwind.config.js* ./

# Copy source files in order of change frequency (least to most)
# Source code (changes more frequently)
COPY src ./src

# Environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# Stage 3 — runner (minimal runtime image)
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install only production dependencies in runner
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]
