# Nexus 后端部署指南

**环境**: 腾讯云 CloudBase Run  
**服务名**: nexus-server  
**环境 ID**: cloud1-0gfwfzyh9c423958

---

## 📋 部署前准备

### 1. 确认配置

**数据库连接**:
```
mysql://admin:database12345678.@sh-cynosdbmysql-grp-kysz4ziw.sql.tencentcdb.com:27663/nexus
```

**环境变量**:
- `NODE_ENV`: production
- `DATABASE_URL`: MySQL 连接字符串
- `JWT_SECRET`: JWT 密钥（至少 32 字符）
- `APP_PORT`: 3000
- `PORT`: 80 (CloudBase 默认)

---

## 🚀 部署方式

### 方式 1: 使用部署脚本（推荐）

```bash
cd /Users/yingdasun/elva-project/elva-server

# 1. 赋予执行权限
chmod +x deploy.sh

# 2. 执行部署
./deploy.sh
```

---

### 方式 2: 手动部署

#### 步骤 1: 编译项目

```bash
npm run build
```

#### 步骤 2: 登录 CloudBase

```bash
tcb login
# 或使用 API 密钥
# export TCB_KEY=your-api-key
```

#### 步骤 3: 部署到 CloudBase Run

```bash
tcb framework deploy
```

---

### 方式 3: 使用 Docker（本地测试）

```bash
# 构建镜像
docker build -t nexus-server:latest .

# 运行容器
docker run -d \
  -p 3000:80 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="your-secret" \
  nexus-server:latest
```

---

## 📊 服务配置

### CloudBase Run 配置

**服务名称**: nexus-server  
**运行环境**: Nodejs16.13  
**CPU**: 1 核  
**内存**: 2048 MB  
**最小实例数**: 0  
**最大实例数**: 5  
**扩缩容策略**: CPU 80%

### 环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| NODE_ENV | production | 生产环境 |
| DATABASE_URL | mysql://... | 数据库连接 |
| JWT_SECRET | nexus-jwt-secret... | JWT 密钥 |
| APP_PORT | 3000 | 应用端口 |
| PORT | 80 | CloudBase 端口 |

---

## 🔍 部署验证

### 1. 检查服务状态

```bash
tcb run service nexus-server
```

### 2. 查看日志

```bash
tcb run log nexus-server --limit 50
```

### 3. 测试 API

```bash
# 健康检查
curl https://nexus-server-237740-9-1305696213.sh.run.tcloudbase.com/health

# 预期响应
{"status": "ok", "timestamp": "2026-03-26T09:00:00.000Z"}
```

---

## 📝 常用命令

### 查看服务

```bash
tcb run service nexus-server
```

### 查看日志

```bash
# 实时日志
tcb run log nexus-server --follow

# 最近 100 条
tcb run log nexus-server --limit 100

# 错误日志
tcb run log nexus-server --level error
```

### 重启服务

```bash
tcb run restart nexus-server
```

### 更新环境变量

```bash
tcb run env update nexus-server --env-vars "KEY=value"
```

---

## 🎯 访问地址

**生产环境**:
```
https://nexus-server-237740-9-1305696213.sh.run.tcloudbase.com
```

**API 端点**:
```
https://nexus-server-237740-9-1305696213.sh.run.tcloudbase.com/api
```

---

## 📊 监控指标

### 性能指标

- **CPU 使用率**: < 80%
- **内存使用率**: < 80%
- **请求响应时间**: < 500ms
- **错误率**: < 1%

### 业务指标

- **日活跃用户**: 监控
- **API 调用次数**: 监控
- **数据库连接数**: 监控

---

## 🐛 故障排查

### 问题 1: 服务无法启动

**检查日志**:
```bash
tcb run log nexus-server --level error
```

**常见原因**:
- 数据库连接失败
- 端口被占用
- 环境变量缺失

### 问题 2: API 返回 500 错误

**检查**:
1. 查看错误日志
2. 检查数据库连接
3. 验证 JWT 配置

### 问题 3: 内存溢出

**解决方案**:
1. 增加内存配置（最大 4096 MB）
2. 优化代码内存使用
3. 检查内存泄漏

---

## 📈 性能优化

### 1. 数据库连接池

```typescript
// prisma.service.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});
```

### 2. 缓存策略

- Redis 缓存热点数据
- JWT Token 缓存
- 数据库查询结果缓存

### 3. 负载均衡

- CloudBase 自动扩缩容
- 多实例部署
- CDN 加速静态资源

---

## 📝 部署记录

| 日期 | 版本 | 说明 | 操作人 |
|------|------|------|--------|
| 2026-03-26 | 1.0.0 | 首次部署 | 小桌子 |

---

**文档版本**: 1.0  
**最后更新**: 2026-03-26  
**维护者**: 小桌子 🪑
