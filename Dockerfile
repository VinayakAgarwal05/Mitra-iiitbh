# Multi-stage production build for College Connect
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Build Client
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# 2. Build Server
COPY server/package*.json ./server/
RUN cd server && npm ci

COPY server/ ./server/
RUN cd server && npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

# Copy built server & client
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/uploads ./server/uploads
COPY --from=builder /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 5001

CMD ["node", "dist/index.js"]
