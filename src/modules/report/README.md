# 报备模块 API 文档

## 概述

报备模块是陪玩公会管理系统的核心功能，支持接单和点单两种模式，包含完整的审批流程和收益分配机制。

**特性：**
- ✅ 幂等性支持（防止重复提交）
- ✅ 完整筛选条件（12+ 个筛选维度）
- ✅ 存单/预存扣款
- ✅ 事务处理（数据一致性）
- ✅ 软删除（审计支持）

---

## API 列表

### 1. 提交报备

```http
POST /api/report/submit
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体：**

```json
{
  "requestId": "unique-request-id-123",  // 可选，幂等性支持
  "reportType": "PROJECT",                // PROJECT | GIFT | POINT
  "orderType": "RECEIVER",                // RECEIVER | POINT
  "projectId": "123",
  "ownerId": "456",                       // 点单必填
  "bossName": "王老板",
  "bossContact": "13800138000",
  "duration": 60,                         // 时长（分钟）
  "quantity": 1,                          // 数量
  "useDeposit": false,
  "depositId": "789",
  "startTime": "2026-03-26T10:00:00Z",
  "endTime": "2026-03-26T11:00:00Z",
  "remark": "备注信息"
}
```

**响应：**

```json
{
  "id": "1234567890",
  "clubId": "1",
  "memberId": "100",
  "projectId": "123",
  "reportType": "PROJECT",
  "orderType": "RECEIVER",
  "bossName": "王老板",
  "amount": "60.00",
  "commission": "12.00",
  "rebate": "0.00",
  "actualAmount": "48.00",
  "status": "PENDING",
  "createdAt": "2026-03-26T10:00:00Z"
}
```

**错误码：**
- `400` - 存单余额不足 / 参数验证失败
- `401` - 未授权
- `404` - 项目不存在

---

### 2. 查询报备列表

```http
GET /api/report/list?tab=my-orders&period=month&page=1&pageSize=20
Authorization: Bearer <token>
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `tab` | string | `pending` \| `my-orders` \| `my-point-orders` \| `all` |
| `period` | string | `all` \| `month` \| `week` \| `today` \| `custom` |
| `startDate` | string | 自定义开始日期（period=custom 时必填） |
| `endDate` | string | 自定义结束日期 |
| `reportType` | string | `PROJECT` \| `GIFT` \| `POINT` |
| `orderType` | string | `RECEIVER` \| `POINT` |
| `statuses` | number[] | 状态多选：`[1, 2]` |
| `receiverId` | string | 接单人 ID |
| `ownerId` | string | 所属人 ID |
| `groupId` | string | 群组 ID |
| `hasRemark` | boolean | 有无备注 |
| `remarkContains` | string | 备注内容搜索 |
| `useDeposit` | boolean | 是否使用存单 |
| `bossName` | string | 老板姓名搜索 |
| `keyword` | string | 订单号/老板姓名搜索 |
| `page` | number | 页码（默认 1） |
| `pageSize` | number | 每页数量（默认 20，最大 100） |

**响应：**

```json
{
  "list": [
    {
      "id": "123",
      "reportType": "PROJECT",
      "orderType": "RECEIVER",
      "status": "APPROVED",
      "bossName": "王老板",
      "amount": "60.00",
      "commission": "12.00",
      "actualAmount": "48.00",
      "project": { "name": "王者荣耀", "type": 1 },
      "creator": { "nickname": "小明", "avatar": "..." },
      "createdAt": "2026-03-26T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

### 3. 报备详情

```http
GET /api/report/detail/:id
Authorization: Bearer <token>
```

**响应：**

```json
{
  "id": "123",
  "reportType": "PROJECT",
  "orderType": "RECEIVER",
  "status": "APPROVED",
  "project": {
    "name": "王者荣耀",
    "type": 1,
    "price": "60.00"
  },
  "creator": {
    "nickname": "小明",
    "phone": "138****0000"
  },
  "owner": null,
  "approver": { "nickname": "管理员" },
  "bossName": "王老板",
  "duration": 60,
  "amount": "60.00",
  "commission": "12.00",
  "rebate": "0.00",
  "actualAmount": "48.00",
  "earnings": [...],
  "approvedAt": "2026-03-26T11:00:00Z",
  "createdAt": "2026-03-26T10:00:00Z"
}
```

---

### 4. 审批通过

```http
POST /api/report/:id/approve
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体：**

```json
{
  "remark": "审批备注"
}
```

**响应：**

```json
{
  "success": true
}
```

---

### 5. 审批驳回

```http
POST /api/report/:id/reject
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体：**

```json
{
  "reason": "驳回原因（必填）"
}
```

**响应：**

```json
{
  "success": true
}
```

---

### 6. 撤销报备

```http
POST /api/report/:id/cancel
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true
}
```

**错误码：**
- `400` - 只能撤销待审批的报备
- `403` - 只能撤销自己提交的报备

---

### 7. 收益统计

```http
GET /api/report/earning-stats?period=month&startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>
```

**响应：**

```json
{
  "period": "month",
  "startDate": "2026-03-01",
  "endDate": "2026-03-31",
  "stats": {
    "actualAmount": 14182.00,    // 个人收益
    "points": 105.00,            // 剩余积分
    "orderCount": 1479,          // 接单量
    "orderAmount": 21526.00,     // 接单额
    "commission": 7395.00,       // 抽成
    "pointCount": 17,            // 点单量
    "pointAmount": 275.00,       // 点单额
    "rebate": 51.00              // 返点
  }
}
```

---

## 数据字典

### ReportType（报备类型）

| 值 | 说明 |
|----|------|
| `PROJECT` | 项目单（游戏） |
| `GIFT` | 礼物单 |
| `POINT` | 点单 |

### OrderType（订单类型）

| 值 | 说明 |
|----|------|
| `RECEIVER` | 接单（主动） |
| `POINT` | 点单（被动） |

### ReportStatus（报备状态）

| 值 | 说明 |
|----|------|
| `PENDING` | 待审批 |
| `APPROVED` | 已通过 |
| `REJECTED` | 已驳回 |
| `CANCELLED` | 已撤销 |

---

## 业务规则

### 1. 金额计算

```
接单：
  总金额 = 单价 × 时长（或数量）
  抽成 = 总金额 × 抽成比例（或固定金额）
  实收 = 总金额 - 抽成

点单：
  总金额 = 单价 × 时长（或数量）
  抽成 = 总金额 × 抽成比例
  返点 = 总金额 × 5%（默认）
  所属人收益 = (总金额 - 抽成) × 30%
  接单人收益 = (总金额 - 抽成) × 60%
  俱乐部收益 = 总金额 × 10%
```

### 2. 幂等性

客户端生成唯一 `requestId`（UUID），防止网络波动导致重复提交。

服务端检查 `requestId` 是否存在：
- 存在：返回已有记录
- 不存在：创建新记录

### 3. 存单扣款

启用存单扣款时：
1. 检查存单余额是否足够
2. 事务中更新存单余额
3. 记录存单使用明细
4. 撤销报备时恢复余额

### 4. 审批流程

```
接单：接单人 → (可选) 管理员
点单：接单人 → 所属人 → (可选) 管理员
```

---

## 测试用例

### 提交报备测试

```bash
curl -X POST http://localhost:3000/api/report/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "requestId": "test-001",
    "reportType": "PROJECT",
    "orderType": "RECEIVER",
    "projectId": "1",
    "bossName": "测试老板",
    "duration": 60
  }'
```

### 查询报备列表测试

```bash
curl "http://localhost:3000/api/report/list?tab=my-orders&period=month" \
  -H "Authorization: Bearer <token>"
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-26 | 初始版本，支持基础 CRUD |
| 1.1 | 2026-03-26 | 新增幂等性、存单扣款、收益统计 |

---

**维护者**: 小桌子 🪑  
**最后更新**: 2026-03-26
