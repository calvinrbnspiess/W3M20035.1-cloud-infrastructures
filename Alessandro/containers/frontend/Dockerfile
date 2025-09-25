# Base stage
FROM node:22-alpine AS base
WORKDIR /app

# Copy only frontend's package files (for caching deps)
COPY containers/frontend/package*.json ./

EXPOSE 3000

# Builder stage: build the production-ready Next.js app
FROM base AS builder
WORKDIR /app
# Copy only the frontend source
COPY containers/frontend ./

# Set WebSocket URL for build
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

RUN npm ci
RUN npm run build

# Production stage: run the built app
FROM node:22-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY containers/frontend/package*.json ./
RUN npm ci --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001
USER nextjs

# Copy built assets from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

# Start the production server
CMD ["npm", "run", "start"]
