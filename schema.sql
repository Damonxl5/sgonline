-- NLB eReads 数据库表结构
-- 新加坡国家图书馆电子书平台

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    card_no VARCHAR(50) UNIQUE NOT NULL COMMENT '借书证号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    member_since DATE NOT NULL COMMENT '会员注册日期',
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active' COMMENT '账号状态',
    borrow_quota INT DEFAULT 8 COMMENT '借阅额度',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='用户表';

-- 书籍表
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '书名',
    author VARCHAR(100) NOT NULL COMMENT '作者',
    publisher VARCHAR(100) COMMENT '出版社',
    isbn VARCHAR(20) UNIQUE COMMENT 'ISBN',
    category ENUM('fiction', 'history', 'tech', 'kids', 'academic', 'local') NOT NULL COMMENT '分类',
    language ENUM('中文', 'English', 'Malay', 'Tamil') NOT NULL COMMENT '语言',
    publish_year INT COMMENT '出版年份',
    pages INT COMMENT '页数',
    description TEXT COMMENT '内容简介',
    cover_url VARCHAR(255) COMMENT '封面图片URL',
    rating DECIMAL(2,1) DEFAULT 0.0 COMMENT '评分',
    total_copies INT DEFAULT 1 COMMENT '副本总量',
    available_copies INT DEFAULT 1 COMMENT '可借阅量',
    status ENUM('available', 'unavailable') DEFAULT 'available' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='书籍表';

-- 借阅记录表
CREATE TABLE borrows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单编号',
    user_id INT NOT NULL COMMENT '用户ID',
    book_id INT NOT NULL COMMENT '书籍ID',
    borrow_date DATE NOT NULL COMMENT '借阅日期',
    due_date DATE NOT NULL COMMENT '到期日期',
    return_date DATE COMMENT '归还日期',
    renew_count INT DEFAULT 0 COMMENT '续借次数',
    status ENUM('borrowing', 'returned', 'overdue') DEFAULT 'borrowing' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
) COMMENT='借阅记录表';

-- 预约表
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    book_id INT NOT NULL COMMENT '书籍ID',
    reserve_date DATE NOT NULL COMMENT '预约日期',
    status ENUM('waiting', 'available', 'cancelled', 'expired') DEFAULT 'waiting' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
) COMMENT='预约表';

-- 设备管理表
CREATE TABLE devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    device_type ENUM('Kindle', 'Kobo', 'BOOX', 'iReader') NOT NULL COMMENT '设备类型',
    device_email VARCHAR(100) NOT NULL COMMENT '设备邮箱',
    device_name VARCHAR(100) COMMENT '设备名称',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='设备管理表';

-- 系统公告表
CREATE TABLE notices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '公告标题',
    content TEXT NOT NULL COMMENT '公告内容',
    type ENUM('新书', '提醒', '活动', '系统') NOT NULL COMMENT '公告类型',
    target_audience ENUM('all', 'specific') DEFAULT 'all' COMMENT '目标受众',
    publish_date DATE NOT NULL COMMENT '发布日期',
    status ENUM('published', 'draft', 'archived') DEFAULT 'published' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='系统公告表';

-- 管理员表
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '管理员账号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    email VARCHAR(100) COMMENT '邮箱',
    role ENUM('super_admin', 'admin', 'operator') DEFAULT 'admin' COMMENT '角色',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='管理员表';

-- 阅读进度表
CREATE TABLE reading_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    book_id INT NOT NULL COMMENT '书籍ID',
    progress INT DEFAULT 0 COMMENT '阅读进度百分比',
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后阅读时间',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    UNIQUE KEY unique_user_book (user_id, book_id)
) COMMENT='阅读进度表';

-- 插入示例书籍数据（历史类中文书籍）
INSERT INTO books (title, author, category, language, publish_year, rating, total_copies, available_copies, status) VALUES
('新加坡华人史', '柯木林', 'history', '中文', 2015, 4.5, 5, 5, 'available'),
('从甘榜到都市：新加坡的变迁', '许源泰', 'history', '中文', 2010, 4.3, 3, 3, 'available'),
('李光耀回忆录', '李光耀', 'history', '中文', 2000, 4.8, 10, 0, 'available'),
('新加坡建国史', '陈荣照', 'history', '中文', 2005, 4.4, 4, 4, 'available'),
('东南亚华人社会', '王赓武', 'history', '中文', 2008, 4.6, 3, 3, 'available');

-- 插入示例英文书籍
INSERT INTO books (title, author, category, language, publish_year, rating, total_copies, available_copies, status) VALUES
('Singapore: A Biography', 'Mark Ravinder Frost', 'history', 'English', 2009, 4.6, 4, 4, 'available'),
('The Singapore Story', 'Lee Kuan Yew', 'history', 'English', 2000, 4.9, 8, 0, 'available'),
('From Third World to First', 'Lee Kuan Yew', 'history', 'English', 2000, 4.8, 6, 6, 'available'),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'history', 'English', 2015, 4.9, 10, 2, 'available');

-- 插入示例用户
INSERT INTO users (card_no, password, name, email, phone, member_since, status, borrow_quota) VALUES
('NLB2024001', '$2y$10$example_hash_1', '陈小明', 'chen@example.com', '+6591234567', '2024-01-15', 'active', 8),
('NLB2024002', '$2y$10$example_hash_2', 'John Tan', 'john@example.com', '+6598765432', '2024-02-20', 'active', 8);

-- 插入示例管理员
INSERT INTO admins (username, password, name, email, role, status) VALUES
('admin', '$2y$10$example_admin_hash', '系统管理员', 'admin@nlb.gov.sg', 'super_admin', 'active');

-- 插入示例公告
INSERT INTO notices (title, content, type, target_audience, publish_date, status) VALUES
('3月新书上架：128本中英文新书已入库', '本月共新增128本中英文电子书，涵盖历史人文、科幻小说、儿童绘本等多个分类。', '新书', 'all', '2025-03-15', 'published'),
('系统维护通知：3月20日凌晨2-4时暂停服务', '为提升平台稳定性，NLB eReads将于2025年3月20日凌晨2:00至4:00进行系统维护。', '系统', 'all', '2025-03-08', 'published');

-- 创建索引
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_borrows_user ON borrows(user_id);
CREATE INDEX idx_borrows_status ON borrows(status);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_notices_publish_date ON notices(publish_date);
