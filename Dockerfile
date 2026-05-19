# Last redeploy: 2026-05-06T11:34:42Z - force Cloud Build re-trigger

# Multi-stage build pro Vite frontend + Express AI proxy backend.
# Cloud Run kontejner = jeden Node proces, který servíruje statický dist + /api endpointy.

# === Stage 1: build Vite ===
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .

# Build-time env (Cloud Build substitutions)
ARG VITE_APP_PASSWORD=cbre*
ARG VITE_MARKETPLACE_URL=https://cbre-marketplace.netlify.app
ENV VITE_APP_PASSWORD=$VITE_APP_PASSWORD
ENV VITE_MARKETPLACE_URL=$VITE_MARKETPLACE_URL

RUN npm run build

# === Stage 2: runtime ===
FROM node:20-alpine
WORKDIR /app

# Pouze prod deps (express, @google/genai)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Server runtime
COPY server.js ./
COPY lib ./lib
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.js"]
