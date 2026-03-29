# 前端 API 对接文档

## 基础配置

**Base URL:** `http://localhost:8787/v1` (开发环境)

**认证方式:** JWT Token
```javascript
headers: {
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

**响应格式:**
```json
{
  "code": 200,
  "message": "成功",
  "data": {}
}
```

---

## 1. 用户认证

### 1.1 借书证登录
```
POST /auth/login/card
```
**请求:**
```json
{
  "card_no": "NLB2024001",
  "password": "password123"
}
```
**响应:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGc...",
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

### 1.2 手机验证码登录
```
POST /auth/login/mobile
```
**请求:**
```json
{
  "phone": "+6591234567",
  "code": "123456"
}
```

### 1.3 发送验证码
```
POST /auth/send-otp
```
**请求:**
```json
{
  "phone": "+6591234567"
}
```

---

## 2. 书籍模块

### 2.1 获取书籍列表
```
GET /books?category={category}&lang={lang}&page={page}&limit={limit}
```
**参数:** category (all/fiction/history/tech/kids/academic/local), lang (中文/English/Malay/Tamil), page (默认1), limit (默认20)

**响应:**
```json
{
  "code": 200,
  "data": {
    "books": [{"id": 1, "title": "新加坡华人史", "author": "柯木林", "category": "history", "language": "中文", "rating": 4.5, "status": "available", "available_copies": 5}],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### 2.2 搜索书籍
```
GET /books/search?q={keyword}&lang={lang}&year={year}&status={status}&sort={sort}&page={page}&limit={limit}
```
**参数:**
- q: 搜索关键词（可选，为空时返回空数组）
- lang: 语言筛选
- year: 出版年份
- status: 书籍状态
- sort: 排序方式（newest=最新, oldest=最旧, title_asc=标题升序, title_desc=标题降序, rating=评分，默认newest）
- page: 页码（默认1）
- limit: 每页数量（默认20）

**响应:**
```json
{
  "code": 200,
  "data": {
    "books": [...],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### 2.3 获取书籍详情
```
GET /books/{id}
```

### 2.4 获取新书速递
```
GET /books/new-arrivals?limit={limit}
```

### 2.5 获取相关推荐
```
GET /books/{id}/similar?limit={limit}
```

### 2.6 获取书籍统计
```
GET /books/stats/counts
```
**响应:**
```json
{
  "code": 200,
  "data": {
    "by_language": {
      "中文": 1234,
      "English": 567,
      "Malay": 89,
      "Tamil": 45
    },
    "by_category": {
      "fiction": 890,
      "history": 234,
      "tech": 156,
      "kids": 123,
      "academic": 98,
      "local": 67
    }
  }
}
```

### 2.7 获取书籍评论
```
GET /books/{id}/reviews
```

### 2.8 发表书籍评论 🔒
```
POST /books/{id}/reviews
```
**请求:** `{"rating": 5, "content": "非常好的书"}`

### 2.9 收藏/取消收藏书籍 🔒
```
POST /books/{id}/favorite
```
**响应:** `{"favorited": true}` 或 `{"favorited": false}`

---

## 3. 借阅管理 🔒

### 3.1 借阅书籍
```
POST /borrows
```
**请求:**
```json
{"book_id": 1}
```
**响应:**
```json
{
  "code": 200,
  "message": "借阅成功",
  "data": {"order_no": "BRW1711234567890", "book_id": 1, "borrow_date": "2025-03-15", "due_date": "2025-04-05", "status": "borrowing"}
}
```

### 3.2 续借书籍
```
POST /borrows/{id}/renew
```

### 3.3 归还书籍
```
POST /borrows/{id}/return
```

### 3.4 获取我的借阅
```
GET /borrows/my?status={status}
```
**参数:** status (borrowing/returned/overdue)

### 3.5 获取借阅历史
```
GET /borrows/history?page={page}&limit={limit}
```

---

## 4. 预约模块 🔒

### 4.1 预约书籍
```
POST /reservations
```
**请求:** `{"book_id": 1}`

### 4.2 取消预约
```
DELETE /reservations/{id}
```

### 4.3 获取我的预约
```
GET /reservations/my?status={status}
```

---

## 5. 设备管理 🔒

### 5.1 添加设备
```
POST /devices
```
**请求:**
```json
{"device_type": "Kindle", "device_email": "user@kindle.com", "device_name": "我的Kindle"}
```

### 5.2 获取设备列表
```
GET /devices
```

### 5.3 删除设备
```
DELETE /devices/{id}
```

### 5.4 推送书籍到设备
```
POST /devices/{id}/push
```
**请求:** `{"book_id": 1}`

---

## 6. 用户中心 🔒

### 6.1 获取用户信息
```
GET /users/profile
```
**响应:**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "card_no": "NLB2024001",
    "name": "陈小明",
    "email": "chen@example.com",
    "phone": "+6591234567",
    "member_since": "2024-01-15",
    "borrow_quota": 8,
    "stats": {"total_borrowed": 45, "reading": 3, "finished": 42}
  }
}
```

### 6.2 更新用户信息
```
PUT /users/profile
```
**请求:** `{"name": "陈小明", "email": "chen@example.com", "phone": "+6591234567"}`

### 6.3 修改密码
```
POST /users/change-password
```
**请求:** `{"old_password": "old123", "new_password": "new123"}`

### 6.4 获取借阅统计
```
GET /users/stats
```

---

## 7. 公告模块

### 7.1 获取公告列表
```
GET /notices?type={type}&page={page}&limit={limit}
```
**参数:** type (新书/提醒/活动/系统)

### 7.2 获取公告详情
```
GET /notices/{id}
```

---

## 8. 阅读模块 🔒

### 8.1 在线阅读
```
GET /reading-progress/{book_id}/read
```

### 8.2 下载书籍
```
GET /reading-progress/{book_id}/download?format={format}
```
**参数:** format (epub/pdf/mobi)

### 8.3 保存阅读进度
```
POST /reading-progress/progress
```
**请求:** `{"book_id": 1, "progress": 45}`

### 8.4 获取阅读进度
```
GET /reading-progress/progress/{book_id}
```

---

## 9. 管理后台 🔒👑

### 9.1 管理员登录
```
POST /admin/auth/login
```
**请求:** `{"username": "admin", "password": "admin123"}`

### 9.2 获取书籍列表
```
GET /admin/books?category={category}&status={status}&page={page}&limit={limit}
```

### 9.3 添加书籍
```
POST /admin/books
```
**请求:** `{"title": "书名", "author": "作者", "category": "history", "language": "中文", "isbn": "9789812345678"}`

### 9.4 更新书籍
```
PUT /admin/books/{id}
```

### 9.5 删除书籍
```
DELETE /admin/books/{id}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 无权限（非管理员） |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 前端示例代码

### Axios 配置
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8787/v1',
  timeout: 10000
});

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 使用示例
```javascript
// 登录
const login = async (card_no, password) => {
  const res = await api.post('/auth/login/card', { card_no, password });
  localStorage.setItem('token', res.data.token);
  return res.data.user;
};

// 获取书籍列表
const getBooks = async (params) => {
  const res = await api.get('/books', { params });
  return res.data;
};

// 借阅书籍
const borrowBook = async (book_id) => {
  const res = await api.post('/borrows', { book_id });
  return res.data;
};
```
