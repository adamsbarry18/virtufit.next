# Multi-stage Dockerfile tuned for Next.js builds:
# - deps: install all dependencies (dev + prod)
# - builder: build the Next app
# - runner: copy only production artifacts and run `next start`

# Stage 1 — deps (install all deps so build tools are available)
FROM node:20-bullseye-slim AS deps
WORKDIR /app
# Install common build tools (uncomment additional packages if your project needs them)
RUN apt-get update && apt-get install -y ca-certificates build-essential python3 git --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
# Install all deps (dev + prod) required for build
RUN npm ci

# Stage 2 — builder (build the Next.js app)
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY . .
# ensure public exists to avoid COPY failure in the runner stage when public/ is missing
RUN mkdir -p /app/public
# copy installed deps from deps stage so build can reuse them
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Build the Next.js app
RUN npm run build

# Prune devDependencies to keep only production deps
RUN npm prune --production

# Stage 3 — runner (minimal runtime image)
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy runtime files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# Optional: copy next.config.js if you rely on it at runtime
# COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
# Ensure the package.json contains "start": "next start"
CMD ["npm", "start"]
