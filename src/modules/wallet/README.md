# 积分模块 API 文档

## 概述

积分模块提供完整的积分管理功能，支持充值、消费、转账等操作，采用乐观锁确保并发安全。

**特性：**
- ✅ 幂等性支持（防止重复充值）
- ✅ 乐观锁（并发控制）
- ✅ 事务处理（数据一致性）
- ✅ 完整记录（充值/消费/转账）

---

## API 列表

### 1. 查询积分余额

```http
GET /api/points/balance
Authorization: Bearer <token>
```

**响应：**

```json
{
  "balance": "1000.00",
  "frozen": "0.00",
  "points": "105.00",
  "totalPointsReceived": "500.00",
  "totalPointsSpent": "395.00"
}
```

**字段说明：**
- `balance` - 资金余额（元）
- `frozen` - 冻结金额（元）
- `points` - 当前积分
- `totalPointsReceived` - 累计收入积分
- `totalPointsSpent` - 累计消费积分

---

### 2. 积分充值

```http
POST /api/points/recharge
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体：**

```json
{
  "requestId": "unique-request-id-123",  // 可选，幂等性支持
  "recipientId": "456",                   // 可选，为空则为自己充值
  "rechargeType": 1,                      // 1 为自己 2 为好友
  "points": 100,                          // 充值积分数量
  "payAmount": 100,                       // 支付金额（元）
  "payMethod": 1,                         // 1 微信 2 支付宝 3 钱包 4 管理员赠送
  "remark": "充值备注"
}
```

**响应：**

```json
{
  "id": "789",
  "clubId": "1",
  "operatorId": "100",
  "recipientId": "100",
  "rechargeType": 1,
  "points": "100.00",
  "payAmount": "100.00",
  "payMethod": 1,
  "status": 2,
  "balanceAfter": "205.00",
  "requestId": "unique-request-id-123",
  "paidAt": "2026-03-26T10:00:00Z",
  "createdAt": "2026-03-26T10:00:00Z"
}
```

**错误码：**
- `400` - 支付金额必须大于 0
- `401` - 未授权
- `409` - 钱包版本冲突（并发冲突，需重试）

---

### 3. 查询积分记录

```http
GET /api/points/records?type=1&page=1&pageSize=20
Authorization: Bearer <token>
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | number | 交易类型筛选（1 充值 2 代扣 3 退款 4 转账 5 消费 6 奖励 7 调账） |
| `page` | number | 页码（默认 1） |
| `pageSize` | number | 每页数量（默认 20，最大 100） |

**响应：**

```json
{
  "list": [
    {
      "type": "recharge",
      "points": 100,
      "balanceAfter": 205,
      "remark": "积分充值",
      "createdAt": "2026-03-26T10:00:00Z",
      "operatorName": "小明",
      "recipientName": "小明"
    },
    {
      "type": "expense",
      "points": 12,
      "balanceAfter": 193,
      "remark": "报备代扣",
      "createdAt": "2026-03-26T09:00:00Z",
      "expenseType": 2
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50
  }
}
```

---

### 4. 积分转账

```http
POST /api/points/transfer
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体：**

```json
{
  "toMemberId": "456",    // 接收人 ID
  "points": 50,           // 转账积分
  "remark": "转账备注"
}
```

**响应：**

```json
{
  "transfer": {
    "id": "123",
    "clubId": "1",
    "walletId": "100",
    "memberId": "100",
    "expenseType": 4,
    "points": "50.00",
    "relateType": "transfer",
    "status": 1,
    "balanceAfter": "143.00",
    "remark": "转账备注",
    "createdAt": "2026-03-26T10:00:00Z"
  },
  "fromBalanceAfter": 143
}
```

**错误码：**
- `400` - 转账积分必须大于 0 / 积分余额不足
- `401` - 未授权
- `404` - 钱包不存在
- `409` - 钱包版本冲突

---

## 数据字典

### RechargeType（充值类型）

| 值 | 说明 |
|----|------|
| `1` | 为自己充值 |
| `2` | 为好友充值 |

### PayMethod（支付方式）

| 值 | 说明 |
|----|------|
| `1` | 微信支付 |
| `2` | 支付宝 |
| `3` | 钱包余额 |
| `4` | 管理员赠送 |

### PointTransactionType（积分交易类型）

| 值 | 说明 |
|----|------|
| `1` | 充值 |
| `2` | 代扣 |
| `3` | 退款 |
| `4` | 转账 |
| `5` | 消费 |
| `6` | 奖励 |
| `7` | 调账 |

---

## 业务规则

### 1. 积分汇率

```
默认汇率：¥1 = 1 积分
（可通过俱乐部配置调整）
```

### 2. 幂等性

客户端生成唯一 `requestId`（UUID），防止网络波动导致重复充值。

服务端检查 `requestId` 是否存在：
- 存在：返回已有记录
- 不存在：创建新记录

### 3. 乐观锁

使用 `version` 字段实现乐观锁：

```typescript
// 更新积分
const updated = await tx.wallet.updateMany({
  where: {
    id: wallet.id,
    version: wallet.version, // 乐观锁条件
  },
  data: {
    points: { increment: dto.points },
    version: { increment: 1 }, // 版本号 +1
  },
});

if (updated.count === 0) {
  throw new ConflictException('钱包版本冲突，请重试');
}
```

### 4. 积分用途

- 抵扣报备抽成
- 兑换商品/服务
- 成员间转账
- 缴纳罚款/团费

---

## 测试用例

### 积分充值测试

```bash
curl -X POST http://localhost:3000/api/points/recharge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "requestId": "test-001",
    "rechargeType": 1,
    "points": 100,
    "payAmount": 100,
    "payMethod": 1
  }'
```

### 查询积分余额测试

```bash
curl http://localhost:3000/api/points/balance \
  -H "Authorization: Bearer <token>"
```

### 积分转账测试

```bash
curl -X POST http://localhost:3000/api/points/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "toMemberId": "456",
    "points": 50,
    "remark": "测试转账"
  }'
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-26 | 初始版本，支持充值/消费/转账 |
| 1.1 | 2026-03-26 | 新增乐观锁、幂等性支持 |

---

**维护者**: 小桌子 🪑  
**最后更新**: 2026-03-26
