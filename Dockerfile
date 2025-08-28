# ---- Build stage ----
FROM node:20-slim AS builder
WORKDIR /app

# 패키지 먼저 복사(캐시 최적화)
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN corepack enable || true && yarn install --frozen-lockfile

# 소스 복사 후 빌드
COPY . .
RUN yarn build

# prod 전용 node_modules 준비
RUN rm -rf node_modules && yarn install --frozen-lockfile --production

# ---- Runtime stage ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    TZ=Asia/Seoul

# 프로덕션에 필요한 파일만 복사
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init tzdata ca-certificates && rm -rf /var/lib/apt/lists/*
USER node

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 3000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --retries=5 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/dumb-init","--"]
CMD ["node", "dist/main.js"]
