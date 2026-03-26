# 立即部署 Nexus 后端

**时间**: 2026-03-26 17:22  
**状态**: ⏳ 等待登录

---

## 🔐 步骤 1: 登录 CloudBase

**请选择以下任一方式登录**:

### 方式 A: 扫码登录（推荐）

```bash
tcb login
```

执行后会显示二维码，使用微信扫码登录。

### 方式 B: 使用 API 密钥

```bash
tcb login -k \
  --apiKeyId "YOUR_API_KEY_ID" \
  --apiKey "YOUR_API_KEY"
```

**获取 API 密钥**:
1. 访问 https://console.cloud.tencent.com/cam/capi
2. 创建或查看现有密钥
3. 复制 SecretId 和 SecretKey

---

## 🚀 步骤 2: 执行部署

登录成功后，执行：

```bash
cd /Users/yingdasun/elva-project/elva-server
./deploy.sh
```

**或手动部署**:

```bash
# 1. 编译
npm run build

# 2. 部署
tcb framework deploy
```

---

## 📊 步骤 3: 验证部署

### 检查服务状态

```bash
tcb run service nexus-server
```

### 查看日志

```bash
tcb run log nexus-server --limit 50
```

### 测试 API

```bash
# 健康检查
curl https://nexus-server-237740-9-1305696213.sh.run.tcloudbase.com/health

# 预期响应
{"status": "ok", "timestamp": "2026-03-26T09:00:00.000Z"}
```

---

## 🎯 部署信息

| 配置项 | 值 |
|--------|-----|
| 环境 ID | cloud1-0gfwfzyh9c423958 |
| 服务名 | nexus-server |
| 访问地址 | https://nexus-server-237740-9-1305696213.sh.run.tcloudbase.com |
| API 地址 | https://nexus-server-237740-9-1305696213.sh.run.tcloudbase.com/api |

---

## ⚠️ 注意事项

1. **首次部署可能需要 5-10 分钟**
2. **确保数据库连接正常**
3. **检查环境变量配置**
4. **部署后验证 API 功能**

---

## 🐛 故障排查

### 问题 1: 登录失败

**解决**:
- 检查网络连接
- 确认微信已绑定腾讯云账号
- 尝试使用 API 密钥登录

### 问题 2: 部署失败

**检查**:
```bash
# 查看部署日志
tcb framework deploy --debug

# 检查 CloudBase 配置
cat cloudbaserc.json
cat cloudbase-framework.json
```

### 问题 3: 服务启动失败

**查看日志**:
```bash
tcb run log nexus-server --level error --limit 100
```

---

**请先执行 `tcb login` 登录，然后告诉我，我会继续执行部署！** 🚀
