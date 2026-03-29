# API Integration Guide

## Files Created

1. **api-config.js** - API client configuration and HTTP wrapper
2. **api-services.js** - All API endpoint functions organized by module
3. **page-integrations.js** - Page-specific integration helpers

## How to Use in HTML Pages

### Step 1: Include Scripts (in order)
```html
<script src="api-config.js"></script>
<script src="api-services.js"></script>
<script src="page-integrations.js"></script>
```

### Step 2: Use API Functions

#### Authentication (login.html)
```javascript
// Card login
const res = await authAPI.loginWithCard(card_no, password);
apiClient.setToken(res.data.token);

// Mobile login
const res = await authAPI.loginWithMobile(phone, code);
apiClient.setToken(res.data.token);

// Send OTP
await authAPI.sendOTP(phone);
```

#### Home Page (home.html)
```javascript
// Get books by category
const books = await booksAPI.getBooks({ category: 'history', lang: '中文' });

// Search books
const results = await booksAPI.searchBooks({ q: 'keyword' });

// AI search
const aiResults = await booksAPI.aiSearch('query', { category: 'fiction' });

// New arrivals
const newBooks = await booksAPI.getNewArrivals(10);
```

#### Book Detail (book-detail.html)
```javascript
// Get book detail
const book = await booksAPI.getBookDetail(bookId);

// Get similar books
const similar = await booksAPI.getSimilarBooks(bookId, 6);

// Borrow book
const result = await borrowsAPI.borrowBook(bookId);

// Reserve book
const reservation = await reservationsAPI.reserveBook(bookId);
```

#### Bookshelf (bookshelf.html)
```javascript
// Get my borrows
const borrows = await borrowsAPI.getMyBorrows('borrowing');

// Get my reservations
const reservations = await reservationsAPI.getMyReservations();

// Renew book
await borrowsAPI.renewBook(borrowId);

// Return book
await borrowsAPI.returnBook(borrowId);

// Get borrow history
const history = await borrowsAPI.getBorrowHistory(1, 20);
```

#### Profile (profile.html)
```javascript
// Get profile
const profile = await usersAPI.getProfile();

// Update profile
await usersAPI.updateProfile({ name: 'New Name', email: 'new@email.com' });

// Change password
await usersAPI.changePassword('oldPass', 'newPass');

// Get stats
const stats = await usersAPI.getStats();
```

#### Devices (devices.html)
```javascript
// Get devices
const devices = await devicesAPI.getDevices();

// Add device
await devicesAPI.addDevice('Kindle', 'user@kindle.com', 'My Kindle');

// Delete device
await devicesAPI.deleteDevice(deviceId);

// Push to device
await devicesAPI.pushToDevice(deviceId, bookId);
```

#### Reading (reading.html)
```javascript
// Read book
const content = await readingAPI.readBook(bookId);

// Download book
const file = await readingAPI.downloadBook(bookId, 'epub');

// Save progress
await readingAPI.saveProgress(bookId, 45);

// Get progress
const progress = await readingAPI.getProgress(bookId);
```

#### Admin Login (admin-login.html)
```javascript
// Admin login
const res = await adminAPI.login(username, password);
apiClient.setToken(res.data.token);
```

#### Admin Dashboard (admin-dashboard.html)
```javascript
// Get dashboard stats
const stats = await adminAPI.getDashboardStats();

// Get recent borrows
const recent = await adminAPI.getRecentBorrows(10);
```

#### Admin Books (admin-books.html)
```javascript
// Get books
const books = await adminAPI.getBooks({ category: 'history', page: 1 });

// Add book
await adminAPI.addBook({ title: 'Book Title', author: 'Author', ... });

// Update book
await adminAPI.updateBook(bookId, { title: 'New Title' });

// Delete book
await adminAPI.deleteBook(bookId);
```

#### Admin Users (admin-users.html)
```javascript
// Get users
const users = await adminAPI.getUsers({ status: 'active', page: 1 });

// Update user
await adminAPI.updateUser(userId, { status: 'suspended' });
```

#### Admin Borrows (admin-borrows.html)
```javascript
// Get borrows
const borrows = await adminAPI.getBorrows({ status: 'overdue', page: 1 });
```

#### Admin Notices (admin-notices.html)
```javascript
// Get notices
const notices = await adminAPI.getNotices({ type: '新书', page: 1 });

// Add notice
await adminAPI.addNotice({ title: 'Title', content: 'Content', type: '新书' });

// Update notice
await adminAPI.updateNotice(noticeId, { title: 'New Title' });

// Delete notice
await adminAPI.deleteNotice(noticeId);
```

## Error Handling

All API calls return promises. Use try-catch:

```javascript
try {
  const result = await booksAPI.getBooks({ category: 'history' });
  // Handle success
} catch (error) {
  alert(error.message);
  // Handle error
}
```

## Authentication

Token is automatically included in all requests after login:
- Stored in localStorage
- Added to Authorization header
- Auto-redirect to login on 401

## Response Format

All responses follow this structure:
```json
{
  "code": 200,
  "message": "成功",
  "data": {}
}
```

Access data with: `result.data`
