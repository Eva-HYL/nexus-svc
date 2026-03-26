# Enum 类型修复指南

## 问题原因

Prisma Schema 更新后，Enum 从**数字类型**改为了**字符串类型**：

**旧版（数字）:**
```prisma
enum MemberStatus {
  ACTIVE = 1
  PENDING = 2
  QUIT = 3
}
```

**新版（字符串）:**
```prisma
enum MemberStatus {
  IDLE
  BUSY
  REST
  LEAVE
  PENDING
  LEFT
}
```

## 需要修复的文件

### 1. src/common/constants/enums.ts
需要更新所有 Enum 定义，匹配 Prisma Schema

### 2. src/modules/club/club.service.ts
替换：
- `ClubStatus.ACTIVE` → 删除（直接使用数字 1 或移除）
- `ClubRole.FOUNDER` → `MemberRole.OWNER`
- `MemberStatus.ACTIVE` → `MemberStatus.IDLE`
- `MemberStatus.QUIT` → `MemberStatus.LEFT`

### 3. src/modules/member/member.service.ts
替换所有 Enum 比较和赋值

### 4. src/common/guards/club-member.guard.ts
更新类型比较

## 快速修复命令

```bash
# 备份
cp -r src src.bak

# 使用 sed 批量替换（谨慎使用）
find src -name "*.ts" -type f -exec sed -i '' 's/MemberStatus\.ACTIVE/MemberStatus\.IDLE/g' {} \;
find src -name "*.ts" -type f -exec sed -i '' 's/MemberStatus\.QUIT/MemberStatus\.LEFT/g' {} \;
find src -name "*.ts" -type f -exec sed -i '' 's/ClubRole\.FOUNDER/MemberRole\.OWNER/g' {} \;
find src -name "*.ts" -type f -exec sed -i '' 's/ClubRole\.MEMBER/MemberRole\.MEMBER/g' {} \;
find src -name "*.ts" -type f -exec sed -i '' 's/ClubRole\.ADMIN/MemberRole\.ADMIN/g' {} \;
```

## 手动修复步骤

1. 更新 constants/enums.ts
2. 修复 club.service.ts
3. 修复 member.service.ts
4. 修复 club-member.guard.ts
5. 运行 `npm run build` 验证

## 测试验证

```bash
npm run build
npm run test
```
