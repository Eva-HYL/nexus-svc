#!/bin/bash
# 批量修复 Enum 问题

cd /Users/yingdasun/elva-project/elva-server/src

# ClubRole -> MemberRole
find . -name "*.ts" -type f -exec sed -i '' 's/ClubRole\.FOUNDER/MemberRole.OWNER/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/ClubRole\.ADMIN/MemberRole.ADMIN/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/ClubRole\.MEMBER/MemberRole.MEMBER/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/ClubRole\.LEADER/MemberRole.LEADER/g' {} \;

# MemberStatus 更新
find . -name "*.ts" -type f -exec sed -i '' 's/MemberStatus\.ACTIVE/MemberStatus.IDLE/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/MemberStatus\.QUIT/MemberStatus.LEFT/g' {} \;

# 数字状态 -> Enum
find . -name "*.ts" -type f -exec sed -i '' 's/status: 1/status: ReportStatus.PENDING/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/status: 2/status: ReportStatus.APPROVED/g' {} \;

echo "Enum 批量修复完成！"
