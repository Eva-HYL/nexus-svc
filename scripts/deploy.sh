#!/bin/bash

# Nexus 后端 - 微信云托管部署脚本

echo "🚀 开始部署 Nexus 后端到微信云托管..."

# 检查 cloudbase CLI
if ! command -v tcb &> /dev/null; then
    echo "📦 安装 @cloudbase/cli..."
    npm install -g @cloudbase/cli
fi

# 检查登录状态
echo "🔐 检查登录状态..."
tcb whoami 2>/dev/null || tcb login

# 构建
echo "🔨 构建项目..."
pnpm build

# 部署
echo "🚀 部署到云托管..."
tcb framework deploy

echo "✅ 部署完成！"