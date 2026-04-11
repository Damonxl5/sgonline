# NLB eReads API 接口文档

## 基础信息

- **Base URL:** `http://localhost:8787/v1`(开发环境)
- **认证方式:** JWT Token（Header: `Authorization: Bearer {token}`）
- **响应格式:** JSON
- **🔒 标记:** 需要登录（用户 Token）
- **🛡️ 标记:** 需要管理员权限（Admin Token）

---

## 统一响应格式

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { }
}
```

**错误响应:**
```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

---

## 错误码说明

| 错误码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或 Token 无效） |
| 403 | 无权限（非管理员） |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 1. 用户认证模块

### 1.1 借书证登录

```
POST /auth/login/card
```

**请求参数:**
```json
{
  "card_no": "NLB2024001",
  "password": "password123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| card_no | string | 是 | 借书证号 |
| password | string | 是 | 登录密码 |

**成功响应:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY2FyZF9ubyI6Ik5MQjIwMjQwMDEiLCJyb2xlIjoidXNlciJ9.xxx",
    "user": {
      "id": 1,
      "card_no": "NLB2024001",
      "name": "陈小明",
      "member_since": "2024-01-15",
      "borrow_quota": 8
    }
  }
}
```

**错误响应:**
```json
{
  "code": 401,
  "message": "借书证号或密码错误",
  "data": null
}
```

---

### 1.2 手机验证码登录

```
POST /auth/login/mobile
```

**请求参数:**
```json
{
  "phone": "+6591234567",
  "code": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号（含国际区号） |
| code | string | 是 | 短信验证码 |

**成功响应:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx",
    "user": {
      "id": 1,
      "name": "陈小明"
    }
  }
}
```

**错误响应:**
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

### 1.3 发送短信验证码

```
POST /auth/send-otp
```

**请求参数:**
```json
{
  "phone": "+6591234567"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号（含国际区号） |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "message": "验证码已发送"
  }
}
```

---

## 2. 书籍模块

### 2.1 获取书籍列表

```
GET /books?category={category}&lang={lang}&page={page}&limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| category | string | 否 | 分类筛选，默认 `all` | `all` / `fiction` / `history` / `tech` / `kids` / `academic` / `local` |
| lang | string | 否 | 语言筛选 | `中文` / `English` / `Malay` / `Tamil` |
| page | integer | 否 | 页码，默认 `1` | — |
| limit | integer | 否 | 每页数量，默认 `20` | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "books": [
      {
        "id": 1,
        "title": "新加坡华人史",
        "author": "柯木林",
        "publisher": "新加坡出版社",
        "isbn": "9789812345678",
        "category": "history",
        "language": "中文",
        "publish_year": 2015,
        "pages": 320,
        "description": "详细介绍新加坡华人的历史发展...",
        "cover_url": "https://cdn.nlb.sg/covers/1.jpg",
        "rating": 4.5,
        "total_copies": 5,
        "available_copies": 5,
        "status": "available",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "limit": 20
  }
}
```

---

### 2.2 搜索书籍

```
GET /books/search?q={keyword}&lang={lang}&category={category}&year={year}&status={status}&sort={sort}&page={page}&limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| q | string | 否 | 搜索关键词（匹配书名或作者） | — |
| lang | string | 否 | 语言筛选 | `中文` / `English` / `Malay` / `Tamil` |
| category | string | 否 | 分类筛选 | `fiction` / `history` / `tech` / `kids` / `academic` / `local` |
| year | string | 否 | 出版年份，支持精确年份或范围 | `2015` / `before2010` / `after2020` |
| status | string | 否 | 可借状态 | `available` / `unavailable` |
| sort | string | 否 | 排序方式，默认 `newest` | `newest` / `oldest` / `title_asc` / `title_desc` / `rating` |
| page | integer | 否 | 页码，默认 `1` | — |
| limit | integer | 否 | 每页数量，默认 `20` | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "books": [
      {
        "id": 3,
        "title": "李光耀回忆录",
        "author": "李光耀",
        "publisher": null,
        "isbn": null,
        "category": "history",
        "language": "中文",
        "publish_year": 2000,
        "pages": null,
        "description": null,
        "cover_url": null,
        "rating": 4.8,
        "total_copies": 10,
        "available_copies": 0,
        "status": "available",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

---

### 2.3 获取新书速递

```
GET /books/new-arrivals?limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | integer | 否 | 返回数量，默认 `10` |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "books": [
      {
        "id": 9,
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "publisher": null,
        "isbn": null,
        "category": "history",
        "language": "English",
        "publish_year": 2015,
        "pages": null,
        "description": null,
        "cover_url": null,
        "rating": 4.9,
        "total_copies": 10,
        "available_copies": 2,
        "status": "available",
        "created_at": "2025-03-01T00:00:00.000Z",
        "updated_at": "2025-03-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.4 获取书籍详情

```
GET /books/{id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 书籍 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "title": "新加坡华人史",
    "author": "柯木林",
    "publisher": "新加坡出版社",
    "isbn": "9789812345678",
    "category": "history",
    "language": "中文",
    "publish_year": 2015,
    "pages": 320,
    "description": "详细介绍新加坡华人的历史发展...",
    "cover_url": "https://cdn.nlb.sg/covers/1.jpg",
    "rating": 4.5,
    "total_copies": 5,
    "available_copies": 5,
    "status": "available",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**错误响应:**
```json
{
  "code": 404,
  "message": "书籍不存在",
  "data": null
}
```

---

### 2.5 获取相关推荐

```
GET /books/{id}/similar?limit={limit}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 书籍 ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | integer | 否 | 返回数量，默认 `5` |

> 推荐逻辑：同分类 + 同语言的其他书籍。

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "books": [
      {
        "id": 2,
        "title": "从甘榜到都市：新加坡的变迁",
        "author": "许源泰",
        "category": "history",
        "language": "中文",
        "rating": 4.3,
        "available_copies": 3,
        "status": "available"
      }
    ]
  }
}
```

---

### 2.6 获取书籍统计

```
GET /books/stats/counts
```

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "by_language": {
      "中文": 456,
      "English": 389,
      "Malay": 87,
      "Tamil": 68
    },
    "by_category": {
      "fiction": 234,
      "history": 189,
      "tech": 156,
      "kids": 123,
      "academic": 98,
      "local": 200
    }
  }
}
```

---

### 2.7 获取书籍评论

```
GET /books/{id}/reviews
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 书籍 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reviews": [
      {
        "id": 1,
        "user_id": 1,
        "book_id": 1,
        "rating": 5,
        "content": "非常好的一本书，推荐！",
        "created_at": "2025-03-15T10:30:00.000Z",
        "user_name": "陈小明"
      }
    ]
  }
}
```

---

### 2.8 发表书籍评论 🔒

```
POST /books/{id}/reviews
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 书籍 ID |

**请求参数:**
```json
{
  "rating": 5,
  "content": "非常好的一本书，推荐！"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rating | integer | 是 | 评分，1~5 分 |
| content | string | 否 | 评论内容 |

**成功响应:**
```json
{
  "code": 200,
  "message": "评论成功",
  "data": null
}
```

**错误响应:**
```json
{
  "code": 400,
  "message": "评分必须在1-5之间",
  "data": null
}
```

---

### 2.9 收藏 / 取消收藏书籍 🔒

```
POST /books/{id}/favorite
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 书籍 ID |

> 该接口为切换操作：已收藏则取消，未收藏则添加。

**收藏成功响应:**
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "favorited": true
  }
}
```

**取消收藏响应:**
```json
{
  "code": 200,
  "message": "已取消收藏",
  "data": {
    "favorited": false
  }
}
```

---

## 3. 借阅管理模块

> 本模块所有接口均需要登录认证 🔒

### 3.1 借阅书籍

```
POST /borrows
```

**请求参数:**
```json
{
  "book_id": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| book_id | integer | 是 | 书籍 ID |

> 借阅期限为 21 天，借阅后自动扣减 `available_copies`。

**成功响应:**
```json
{
  "code": 200,
  "message": "借阅成功",
  "data": {
    "order_no": "BRW1710000000000",
    "book_id": 1,
    "borrow_date": "2025-03-15",
    "due_date": "2025-04-05",
    "status": "borrowing"
  }
}
```

**错误响应:**
```json
{
  "code": 400,
  "message": "书籍不可借阅",
  "data": null
}
```

---

### 3.2 续借书籍

```
POST /borrows/{id}/renew
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 借阅记录 ID |

> 每本书最多续借 2 次，每次续借延长 14 天。

**成功响应:**
```json
{
  "code": 200,
  "message": "续借成功",
  "data": {
    "due_date": "2025-04-19"
  }
}
```

**错误响应:**
```json
{
  "code": 400,
  "message": "已达最大续借次数",
  "data": null
}
```

---

### 3.3 归还书籍

```
POST /borrows/{id}/return
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 借阅记录 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "归还成功",
  "data": null
}
```

**错误响应:**
```json
{
  "code": 404,
  "message": "借阅记录不存在",
  "data": null
}
```

---

### 3.4 获取我的借阅列表

```
GET /borrows/my?status={status}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| status | string | 否 | 借阅状态筛选 | `borrowing` / `returned` / `overdue` |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "borrows": [
      {
        "id": 1,
        "order_no": "BRW1710000000000",
        "user_id": 1,
        "book_id": 1,
        "borrow_date": "2025-03-15",
        "due_date": "2025-04-05",
        "return_date": null,
        "renew_count": 0,
        "status": "borrowing",
        "created_at": "2025-03-15T10:00:00.000Z",
        "updated_at": "2025-03-15T10:00:00.000Z",
        "title": "新加坡华人史",
        "author": "柯木林"
      }
    ]
  }
}
```

---

### 3.5 获取借阅历史

```
GET /borrows/history?page={page}&limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 `1` |
| limit | integer | 否 | 每页数量，默认 `20` |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "borrows": [
      {
        "id": 5,
        "order_no": "BRW1709000000000",
        "user_id": 1,
        "book_id": 3,
        "borrow_date": "2025-02-10",
        "due_date": "2025-03-03",
        "return_date": "2025-02-28",
        "renew_count": 1,
        "status": "returned",
        "created_at": "2025-02-10T09:00:00.000Z",
        "updated_at": "2025-02-28T15:00:00.000Z",
        "title": "李光耀回忆录"
      }
    ],
    "page": 1,
    "limit": 20
  }
}
```

---

## 4. 预约模块

> 本模块所有接口均需要登录认证 🔒

### 4.1 预约书籍

```
POST /reservations
```

**请求参数:**
```json
{
  "book_id": 3
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| book_id | integer | 是 | 书籍 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "预约成功",
  "data": null
}
```

---

### 4.2 取消预约

```
DELETE /reservations/{id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 预约记录 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "取消预约成功",
  "data": null
}
```

---

### 4.3 获取我的预约

```
GET /reservations/my?status={status}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| status | string | 否 | 预约状态筛选 | `waiting` / `available` / `cancelled` / `expired` |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reservations": [
      {
        "id": 1,
        "user_id": 1,
        "book_id": 3,
        "reserve_date": "2025-03-15",
        "status": "waiting",
        "created_at": "2025-03-15T10:00:00.000Z",
        "updated_at": "2025-03-15T10:00:00.000Z",
        "title": "李光耀回忆录",
        "author": "李光耀"
      }
    ]
  }
}
```

---

## 5. 设备管理模块

> 本模块所有接口均需要登录认证 🔒

### 5.1 添加设备

```
POST /devices
```

**请求参数:**
```json
{
  "device_type": "Kindle",
  "device_email": "user@kindle.com",
  "device_name": "我的 Kindle"
}
```

| 字段 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| device_type | string | 是 | 设备类型 | `Kindle` / `Kobo` / `BOOX` / `iReader` |
| device_email | string | 是 | 设备推送邮箱 | — |
| device_name | string | 否 | 设备自定义名称 | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "添加设备成功",
  "data": null
}
```

---

### 5.2 获取设备列表

```
GET /devices
```

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "devices": [
      {
        "id": 1,
        "user_id": 1,
        "device_type": "Kindle",
        "device_email": "user@kindle.com",
        "device_name": "我的 Kindle",
        "created_at": "2025-03-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 5.3 删除设备

```
DELETE /devices/{id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 设备 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "删除设备成功",
  "data": null
}
```

---

### 5.4 推送书籍到设备

```
POST /devices/{id}/push
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 设备 ID |

**请求参数:**
```json
{
  "book_id": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| book_id | integer | 是 | 书籍 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "推送成功",
  "data": null
}
```

---

## 6. 用户中心模块

> 本模块所有接口均需要登录认证 🔒

### 6.1 获取用户信息

```
GET /users/profile
```

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "card_no": "NLB2024001",
    "name": "陈小明",
    "email": "chen@example.com",
    "phone": "+6591234567",
    "member_since": "2024-01-15",
    "borrow_quota": 8,
    "status": "active",
    "stats": {
      "total_borrowed": 45,
      "reading": 3,
      "finished": 42
    }
  }
}
```

---

### 6.2 更新用户信息

```
PUT /users/profile
```

**请求参数:**
```json
{
  "name": "陈小明",
  "email": "new_email@example.com",
  "phone": "+6598888888"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 姓名 |
| email | string | 是 | 邮箱 |
| phone | string | 是 | 手机号 |

**成功响应:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 6.3 修改密码

```
POST /users/change-password
```

**请求参数:**
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| old_password | string | 是 | 原密码 |
| new_password | string | 是 | 新密码 |

**成功响应:**
```json
{
  "code": 200,
  "message": "修改密码成功",
  "data": null
}
```

**错误响应:**
```json
{
  "code": 400,
  "message": "原密码错误",
  "data": null
}
```

---

### 6.4 获取借阅统计

```
GET /users/stats
```

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total_borrowed": 45,
    "reading": 3,
    "finished": 42
  }
}
```

---

## 7. 公告模块

### 7.1 获取公告列表

```
GET /notices?type={type}&page={page}&limit={limit}
```

> 仅返回状态为 `published` 的公告。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| type | string | 否 | 公告类型筛选 | `新书` / `提醒` / `活动` / `系统` |
| page | integer | 否 | 页码，默认 `1` | — |
| limit | integer | 否 | 每页数量，默认 `20` | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "notices": [
      {
        "id": 1,
        "title": "3月新书上架：128本中英文新书已入库",
        "content": "本月共新增128本中英文电子书，涵盖历史人文、科幻小说、儿童绘本等多个分类。",
        "type": "新书",
        "target_audience": "all",
        "publish_date": "2025-03-15",
        "status": "published",
        "created_at": "2025-03-15T08:00:00.000Z",
        "updated_at": "2025-03-15T08:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20
  }
}
```

---

### 7.2 获取公告详情

```
GET /notices/{id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 公告 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "title": "3月新书上架：128本中英文新书已入库",
    "content": "本月共新增128本中英文电子书，涵盖历史人文、科幻小说、儿童绘本等多个分类。",
    "type": "新书",
    "target_audience": "all",
    "publish_date": "2025-03-15",
    "status": "published",
    "created_at": "2025-03-15T08:00:00.000Z",
    "updated_at": "2025-03-15T08:00:00.000Z"
  }
}
```

**错误响应:**
```json
{
  "code": 404,
  "message": "公告不存在",
  "data": null
}
```

---

## 8. 阅读模块

> 本模块所有接口均需要登录认证 🔒

### 8.1 获取在线阅读链接

```
GET /reading-progress/{book_id}/read
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| book_id | integer | 书籍 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "url": "https://reader.nlb.sg/books/1",
    "cover_url": "https://api.nlb-ereads.sg/r2/covers/1710000000000-abc123.jpg"
  }
}
```

---

### 8.2 获取下载链接

```
GET /reading-progress/{book_id}/download?format={format}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| book_id | integer | 书籍 ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| format | string | 否 | 下载格式，默认 `epub` | `epub` / `pdf` / `mobi` |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "download_url": "https://cdn.nlb.sg/books/1.epub"
  }
}
```

---

### 8.3 保存阅读进度

```
POST /reading-progress/progress
```

**请求参数:**
```json
{
  "book_id": 1,
  "progress": 45
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| book_id | integer | 是 | 书籍 ID |
| progress | integer | 是 | 阅读进度百分比（0~100） |

> 使用 `INSERT OR REPLACE`，重复调用会更新进度。

**成功响应:**
```json
{
  "code": 200,
  "message": "保存成功",
  "data": null
}
```

---

### 8.4 获取阅读进度

```
GET /reading-progress/progress/{book_id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| book_id | integer | 书籍 ID |

**成功响应（有记录）:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "book_id": 1,
    "progress": 45,
    "last_read_at": "2025-03-15T10:30:00.000Z"
  }
}
```

**成功响应（无记录）:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "progress": 0
  }
}
```

---

## 9. 管理后台 - 认证

### 9.1 管理员登录

```
POST /admin/auth/login
```

**请求参数:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 管理员用户名 |
| password | string | 是 | 管理员密码 |

**成功响应:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx",
    "admin": {
      "id": 1,
      "username": "admin",
      "name": "系统管理员",
      "role": "super_admin"
    }
  }
}
```

**错误响应:**
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

---

### 9.2 获取当前管理员信息 🛡️

```
GET /admin/profile
```

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "admin": {
      "id": 1,
      "username": "admin",
      "name": "系统管理员",
      "email": "admin@nlb.gov.sg",
      "role": "super_admin",
      "status": "active"
    }
  }
}
```

---

## 10. 管理后台 - 书籍管理

> 本模块所有接口均需要管理员权限 🛡️

### 10.1 获取书籍列表

```
GET /admin/books?search={search}&category={category}&status={status}&page={page}&limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| search | string | 否 | 搜索关键词（匹配书名、作者、ISBN） | — |
| category | string | 否 | 分类筛选 | `fiction` / `history` / `tech` / `kids` / `academic` / `local` |
| status | string | 否 | 状态筛选 | `available` / `unavailable` |
| page | integer | 否 | 页码，默认 `1` | — |
| limit | integer | 否 | 每页数量，默认 `20` | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "books": [
      {
        "id": 1,
        "title": "新加坡华人史",
        "author": "柯木林",
        "publisher": "新加坡出版社",
        "isbn": "9789812345678",
        "category": "history",
        "language": "中文",
        "publish_year": 2015,
        "pages": 320,
        "description": "详细介绍新加坡华人的历史...",
        "cover_url": "https://cdn.nlb.sg/covers/1.jpg",
        "rating": 4.5,
        "total_copies": 5,
        "available_copies": 5,
        "status": "available",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "limit": 20
  }
}
```

---

### 10.2 添加书籍

```
POST /admin/books
Content-Type: multipart/form-data
```

**封面图片上传说明:**
- 上传文件时使用 `multipart/form-data`，文件字段名为 `file`，支持 `jpg` / `png` / `webp` 等图片格式
- 文件上传成功后自动存储至 Cloudflare R2，`cover_url` 自动生成，无需手动填写
- 若不上传文件，可通过 `cover_url` 字段直接传入外部图片 URL
- 文件和 URL 同时传入时，以上传文件为准；图片访问地址格式为 `{base_url}/r2/covers/{filename}`

**请求参数:**

| 字段 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| title | string | 是 | 书名 | — |
| author | string | 是 | 作者 | — |
| category | string | 是 | 分类 | `fiction` / `history` / `tech` / `kids` / `academic` / `local` |
| language | string | 是 | 语言 | `中文` / `English` / `Malay` / `Tamil` |
| isbn | string | 否 | ISBN（唯一） | — |
| publisher | string | 否 | 出版社 | — |
| publish_year | integer | 否 | 出版年份 | — |
| pages | integer | 否 | 页数 | — |
| description | string | 否 | 简介 | — |
| cover_url | string | 否 | 封面图片 URL（不上传文件时使用） | — |
| ebook_url | string | 否 | 电子书文件 URL（不上传文件时使用） | — |
| file | file | 否 | 封面图片文件（优先级高于 cover_url） | — |
| ebook | file | 否 | 电子书文件，支持 epub / pdf / mobi（优先级高于 ebook_url） | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "添加成功",
  "data": null
}
```

---

### 10.3 更新书籍

```
PUT /admin/books/{id}
Content-Type: multipart/form-data
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 书籍 ID |

**可更新字段（传入需要修改的字段即可）:**

| 字段 | 类型 | 说明 | 枚举值 |
|------|------|------|--------|
| title | string | 书名 | — |
| author | string | 作者 | — |
| publisher | string | 出版社 | — |
| isbn | string | ISBN | — |
| category | string | 分类 | `fiction` / `history` / `tech` / `kids` / `academic` / `local` |
| language | string | 语言 | `中文` / `English` / `Malay` / `Tamil` |
| publish_year | integer | 出版年份 | — |
| pages | integer | 页数 | — |
| description | string | 简介 | — |
| cover_url | string | 封面 URL | — |
| ebook_url | string | 电子书文件 URL | — |
| total_copies | integer | 总副本数 | — |
| available_copies | integer | 可借副本数 | — |
| status | string | 状态 | `available` / `unavailable` |

> 支持文件上传（封面图片 `file` / 电子书 `ebook`），使用 `multipart/form-data`；也可仅传文本字段，只更新需要修改的内容。

**请求示例（仅更新库存）:**
```json
{
  "total_copies": 10,
  "available_copies": 8
}
```

**成功响应:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 10.4 删除书籍

```
DELETE /admin/books/{id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 书籍 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 11. 管理后台 - 用户管理

> 本模块所有接口均需要管理员权限 🛡️

### 11.1 获取用户列表

```
GET /admin/users?search={search}&status={status}&page={page}&limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| search | string | 否 | 搜索关键词（匹配姓名、借书证号、邮箱、手机号） | — |
| status | string | 否 | 状态筛选 | `active` / `suspended` / `inactive` |
| page | integer | 否 | 页码，默认 `1` | — |
| limit | integer | 否 | 每页数量，默认 `20` | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "users": [
      {
        "id": 1,
        "card_no": "NLB2024001",
        "name": "陈小明",
        "email": "chen@example.com",
        "phone": "+6591234567",
        "member_since": "2024-01-15",
        "status": "active",
        "borrow_quota": 8,
        "created_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

---

## 12. 管理后台 - 借阅记录

> 本模块所有接口均需要管理员权限 🛡️

### 12.1 获取借阅记录

```
GET /admin/borrows?search={search}&status={status}&page={page}&limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| search | string | 否 | 搜索关键词（匹配书名、作者、用户姓名、借书证号） | — |
| status | string | 否 | 状态筛选 | `borrowing` / `returned` / `overdue` |
| page | integer | 否 | 页码，默认 `1` | — |
| limit | integer | 否 | 每页数量，默认 `20` | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "borrows": [
      {
        "id": 1,
        "order_no": "BRW1710000000000",
        "user_id": 1,
        "book_id": 1,
        "borrow_date": "2025-03-15",
        "due_date": "2025-04-05",
        "return_date": null,
        "renew_count": 0,
        "status": "borrowing",
        "created_at": "2025-03-15T10:00:00.000Z",
        "updated_at": "2025-03-15T10:00:00.000Z",
        "title": "新加坡华人史",
        "author": "柯木林",
        "user_name": "陈小明",
        "card_no": "NLB2024001"
      }
    ],
    "total": 500,
    "page": 1,
    "limit": 20
  }
}
```

---

## 13. 管理后台 - 公告管理

> 本模块所有接口均需要管理员权限 🛡️

### 13.1 获取公告列表

```
GET /admin/notices?status={status}&page={page}&limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| status | string | 否 | 状态筛选（不传则返回全部） | `published` / `draft` / `archived` |
| page | integer | 否 | 页码，默认 `1` | — |
| limit | integer | 否 | 每页数量，默认 `20` | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "notices": [
      {
        "id": 1,
        "title": "3月新书上架：128本中英文新书已入库",
        "content": "本月共新增128本中英文电子书...",
        "type": "新书",
        "target_audience": "all",
        "publish_date": "2025-03-15",
        "status": "published",
        "created_at": "2025-03-15T08:00:00.000Z",
        "updated_at": "2025-03-15T08:00:00.000Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 20
  }
}
```

---

### 13.2 创建公告

```
POST /admin/notices
```

**请求参数:**
```json
{
  "title": "4月新书上架通知",
  "content": "本月新增200本精选电子书，涵盖多个分类。",
  "type": "新书",
  "target_audience": "all",
  "publish_date": "2025-04-01"
}
```

| 字段 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| title | string | 是 | 公告标题 | — |
| content | string | 是 | 公告内容 | — |
| type | string | 是 | 公告类型 | `新书` / `提醒` / `活动` / `系统` |
| target_audience | string | 否 | 目标受众，默认 `all` | `all` / `specific` |
| publish_date | string | 是 | 发布日期（格式：`YYYY-MM-DD`） | — |

**成功响应:**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": null
}
```

---

### 13.3 更新公告

```
PUT /admin/notices/{id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 公告 ID |

**请求参数:**
```json
{
  "title": "4月新书上架通知（更新）",
  "content": "本月新增200本精选电子书...",
  "type": "新书",
  "status": "archived"
}
```

| 字段 | 类型 | 必填 | 说明 | 枚举值 |
|------|------|------|------|--------|
| title | string | 是 | 公告标题 | — |
| content | string | 是 | 公告内容 | — |
| type | string | 是 | 公告类型 | `新书` / `提醒` / `活动` / `系统` |
| status | string | 是 | 状态 | `published` / `draft` / `archived` |

**成功响应:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 13.4 删除公告

```
DELETE /admin/notices/{id}
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 公告 ID |

**成功响应:**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 14. 管理后台 - 统计数据

> 本模块所有接口均需要管理员权限 🛡️

### 14.1 获取概览统计

```
GET /admin/stats
```

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalBooks": 1000,
    "totalUsers": 150,
    "totalBorrows": 45,
    "totalReservations": 12
  }
}
```

> `totalBorrows` 为当前借阅中（`status = borrowing`）的数量，`totalReservations` 为等待中的预约数量。

---

### 14.2 获取仪表盘统计

```
GET /admin/dashboard/stats
```

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalBooks": 1000,
    "totalUsers": 150,
    "totalBorrows": 45,
    "totalReservations": 12
  }
}
```

---

### 14.3 获取最近借阅动态

```
GET /admin/dashboard/recent-borrows?limit={limit}
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | integer | 否 | 返回条数，默认 `5` |

**成功响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "borrows": [
      {
        "id": 1,
        "order_no": "BRW1710000000000",
        "user_id": 1,
        "book_id": 1,
        "borrow_date": "2025-03-15",
        "due_date": "2025-04-05",
        "return_date": null,
        "renew_count": 0,
        "status": "borrowing",
        "created_at": "2025-03-15T10:00:00.000Z",
        "updated_at": "2025-03-15T10:00:00.000Z",
        "title": "新加坡华人史",
        "user_name": "陈小明"
      }
    ]
  }
}
```
