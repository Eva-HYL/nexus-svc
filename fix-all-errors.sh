#!/bin/bash

echo "🔧 开始修复后端 TypeScript 错误..."
echo ""

cd /Users/yingdasun/elva-project/elva-server

# 阶段 1: 修复导入
echo "📝 阶段 1: 修复 Enum 导入..."

# 添加 Prisma Client 导入到所有 Service 文件
for file in src/modules/club/club.service.ts src/modules/member/member.service.ts src/modules/report/report.service.ts src/modules/wallet/wallet.service.ts; do
  if [ -f "$file" ]; then
    # 检查是否已有 Prisma Client 导入
    if ! grep -q "from '@prisma/client'" "$file"; then
      # 在第一个 import 后添加
      sed -i '' "/import.*from.*prisma.service/a\\
import { ReportStatus, MemberStatus, MemberRole, ClubStatus } from '@prisma/client';" "$file"
      echo "  ✅ 添加导入：$file"
    fi
  fi
done

# 修复 club-member.guard.ts
sed -i '' "s/import { ClubRole, MemberStatus } from '..\/..\/common\/constants';/import { ClubRole, MemberStatus } from '@prisma\/client';/" src/common/guards/club-member.guard.ts
echo "  ✅ 修复：club-member.guard.ts"

# 修复 member.controller.ts
sed -i '' "s/import { ClubRole, MemberStatus } from '..\/..\/common\/constants';/import { ClubRole, MemberStatus } from '@prisma\/client';/" src/modules/member/member.controller.ts
echo "  ✅ 修复：member.controller.ts"

echo ""
echo "📝 阶段 2: 修复状态比较..."

# 修复 ReportStatus 比较
for file in src/modules/report/report.service.ts src/modules/club/club.service.ts; do
  if [ -f "$file" ]; then
    sed -i '' 's/status !== 1/status !== ReportStatus.PENDING/g' "$file"
    sed -i '' 's/status === 1/status === ReportStatus.PENDING/g' "$file"
    sed -i '' 's/status !== 2/status !== ReportStatus.APPROVED/g' "$file"
    sed -i '' 's/status === 2/status === ReportStatus.APPROVED/g' "$file"
    sed -i '' 's/status !== 3/status !== ReportStatus.REJECTED/g' "$file"
    sed -i '' 's/status === 3/status === ReportStatus.REJECTED/g' "$file"
    sed -i '' 's/status !== 4/status !== ReportStatus.CANCELLED/g' "$file"
    sed -i '' 's/status === 4/status === ReportStatus.CANCELLED/g' "$file"
    echo "  ✅ 修复 ReportStatus 比较：$file"
  fi
done

# 修复 MemberStatus 比较
for file in src/modules/club/club.service.ts src/modules/member/member.service.ts; do
  if [ -f "$file" ]; then
    sed -i '' 's/status !== 1/status !== MemberStatus.IDLE/g' "$file"
    sed -i '' 's/status === 1/status === MemberStatus.IDLE/g' "$file"
    sed -i '' 's/status !== 2/status !== MemberStatus.PENDING/g' "$file"
    sed -i '' 's/status === 2/status === MemberStatus.PENDING/g' "$file"
    sed -i '' 's/status !== 3/status !== MemberStatus.LEFT/g' "$file"
    sed -i '' 's/status === 3/status === MemberStatus.LEFT/g' "$file"
    echo "  ✅ 修复 MemberStatus 比较：$file"
  fi
done

echo ""
echo "📝 阶段 3: 修复状态赋值..."

# 修复 report.service.ts 中的状态赋值
sed -i '' 's/status: 1/status: ReportStatus.PENDING/g' src/modules/report/report.service.ts
sed -i '' 's/status: 2/status: ReportStatus.APPROVED/g' src/modules/report/report.service.ts
sed -i '' 's/status: 3/status: ReportStatus.REJECTED/g' src/modules/report/report.service.ts
sed -i '' 's/status: 4/status: ReportStatus.CANCELLED/g' src/modules/report/report.service.ts
echo "  ✅ 修复：report.service.ts"

# 修复 club.service.ts 中的状态赋值
sed -i '' 's/status: ClubStatus.ACTIVE/status: ClubStatus.ACTIVE/g' src/modules/club/club.service.ts
sed -i '' 's/status: 1/status: MemberStatus.IDLE/g' src/modules/club/club.service.ts
sed -i '' 's/status: 3/status: MemberStatus.LEFT/g' src/modules/club/club.service.ts
echo "  ✅ 修复：club.service.ts"

# 修复 member.service.ts 中的状态赋值
sed -i '' 's/status: 1/status: MemberStatus.IDLE/g' src/modules/member/member.service.ts
sed -i '' 's/status: 2/status: MemberStatus.PENDING/g' src/modules/member/member.service.ts
sed -i '' 's/status: 3/status: MemberStatus.LEFT/g' src/modules/member/member.service.ts
sed -i '' 's/status: MemberStatus.REJECTED/status: MemberStatus.LEFT/g' src/modules/member/member.service.ts
echo "  ✅ 修复：member.service.ts"

# 修复 role 赋值
sed -i '' 's/role: 1/role: MemberRole.OWNER/g' src/modules/club/club.service.ts
sed -i '' 's/role: 2/role: MemberRole.ADMIN/g' src/modules/club/club.service.ts
sed -i '' 's/role: 3/role: MemberRole.MEMBER/g' src/modules/club/club.service.ts
sed -i '' 's/role: ClubRole.MEMBER/role: MemberRole.MEMBER/g' src/modules/club/club.service.ts
sed -i '' 's/role: ClubRole.ADMIN/role: MemberRole.ADMIN/g' src/modules/club/club.service.ts
sed -i '' 's/role: ClubRole.FOUNDER/role: MemberRole.OWNER/g' src/modules/club/club.service.ts
echo "  ✅ 修复：role 赋值"

echo ""
echo "📝 阶段 4: 清理未使用的导入..."

# 移除旧的 constants 导入
for file in src/modules/club/club.service.ts src/modules/member/member.service.ts src/modules/report/report.service.ts; do
  if [ -f "$file" ]; then
    sed -i '' '/import.*ClubStatus.*from.*constants/d' "$file"
    sed -i '' '/import.*MemberStatus.*from.*constants/d' "$file"
    sed -i '' '/import.*MemberRole.*from.*constants/d' "$file"
    sed -i '' '/import.*ClubRole.*from.*constants/d' "$file"
  fi
done
echo "  ✅ 清理完成"

echo ""
echo "✅ 所有修复完成！"
echo ""
echo "🔍 现在编译验证..."
npm run build
