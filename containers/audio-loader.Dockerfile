# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat protoc g++ make py3-pip
WORKDIR /app

COPY ./out/json .
RUN yarn --immutable

FROM deps AS deps-prod

RUN yarn workspaces focus -A --production

FROM base AS builder
WORKDIR /app
ENV TURBO_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app .
COPY ./out/full .

RUN yarn turbo run --cache=local:r,remote:r "@bibim/audio-loader#build"

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

RUN apk add --no-cache ffmpeg yt-dlp

COPY --from=deps-prod --chown=nodejs:nodejs /app/apps/audio-loader/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/audio-loader/dist ./dist

USER nodejs

ENV PORT=3000
ENV NODE_ENV=production
ENV DISCORD_TOKEN=''
ENV DISCORD_CLIENT_ID=''

ENTRYPOINT ["node", "dist/server.js"]
