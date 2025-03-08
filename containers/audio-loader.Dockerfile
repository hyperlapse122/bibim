# syntax=docker.io/docker/dockerfile:1.7-labs
FROM --platform=$BUILDPLATFORM node:22-alpine AS build-base
FROM node:22-alpine AS base

FROM build-base AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat protoc g++ make py3-pip

COPY ./out/json .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn --immutable

FROM base AS deps-prod
WORKDIR /app

RUN apk add --no-cache libc6-compat protoc g++ make py3-pip

COPY ./out/json .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn --immutable && yarn workspaces focus -A --production

FROM base AS builder
WORKDIR /app
ENV TURBO_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app .
COPY ./out/full .

RUN yarn turbo run --cache=local:r,remote:r "@bibim/audio-loader#build"

FROM build-base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

RUN apk add --no-cache ffmpeg yt-dlp

COPY --from=deps-prod --chown=nodejs:nodejs /app/apps/audio-loader/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/audio-loader/dist ./dist

USER nodejs

ENV PORT=3000
ENV BIBIM_USE_HTTP2=true
ENV NODE_ENV=production
ENV DISCORD_TOKEN=''
ENV DISCORD_CLIENT_ID=''

ENTRYPOINT ["node", "dist/server.js"]
