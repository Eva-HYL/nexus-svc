# Nexus 后端 - 微信云托管 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache openssl libc6-compat
RUN npm install -g pnpm

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建
RUN pnpm build

# 生产镜像 - 使用 Debian 代替 Alpine 以获得更好的兼容性
FROM node:18-slim AS runner

WORKDIR /app

# 安装运行时依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# 安装 pnpm
RUN npm install -g pnpm

# 复制必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# 设置环境变量
ENV NODE_ENV=production

EXPOSE 80

# 启动命令
CMD ["node", "dist/main.js"]