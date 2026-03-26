#!/bin/bash

# Nexus 后端部署脚本
# 部署到腾讯云 CloudBase Run

set -e

echo "🚀 开始部署 Nexus 后端..."

# 1. 编译项目
echo "📦 编译项目..."
npm run build

# 2. 登录 CloudBase（如果未登录）
echo "🔐 检查 CloudBase 登录状态..."
if ! tcb login --check 2>/dev/null; then
  echo "请登录 CloudBase: tcb login"
  exit 1
fi

# 3. 部署到 CloudBase Run
echo "☁️  部署到 CloudBase Run..."
tcb framework deploy

echo "✅ 部署完成！"
echo ""
echo "📊 服务信息:"
echo "  环境 ID: cloud1-0gfwfzyh9c423958"
echo "  服务名: nexus-server"
echo "  访问地址: https://nexus-server-237740-9-1305696213.sh.run.tcloudbase.com"
echo ""
echo "🔍 查看日志: tcb run log nexus-server"
echo "📊 查看状态: tcb run service nexus-server"
