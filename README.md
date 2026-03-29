# NLB eReads 本地开发指南

## 快速启动

### 方法1：使用 Node.js（推荐）

```bash
# 启动服务器
node server.js

# 或使用 npm
npm start
```

访问：http://localhost:3000

### 方法2：使用 Python

```bash
# Python 3
python3 -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

访问：http://localhost:3000

### 方法3：使用 PHP

```bash
php -S localhost:3000
```

访问：http://localhost:3000

## 项目结构

```
sglib-online/
├── index.html              # 入口页面
├── login.html              # 登录页
├── home.html               # 首页
├── search.html             # 搜索页
├── book-detail.html        # 书籍详情
├── bookshelf.html          # 我的书架
├── profile.html            # 个人中心
├── devices.html            # 设备管理
├── reading.html            # 在线阅读
├── admin-login.html        # 管理员登录
├── admin-dashboard.html    # 管理后台
├── admin-books.html        # 书籍管理
├── admin-users.html        # 用户管理
├── admin-borrows.html      # 借阅管理
├── admin-notices.html      # 公告管理
├── i18n.js                 # 多语言配置
├── nav.js                  # 导航逻辑
├── books.js                # 书籍数据
├── api-config.js           # API配置
├── api-services.js         # API服务
├── page-integrations.js    # 页面集成
├── schema.sql              # 数据库结构
├── api.md                  # API文档
└── server.js               # 开发服务器
```

## 注意事项

- 后端API地址配置在 `api-config.js` 中
- 默认后端地址：http://localhost:8787/v1
- 需要先启动后端服务才能完整使用所有功能
- 前端可独立运行，但API调用会失败

## 停止服务

按 `Ctrl + C` 停止服务器
