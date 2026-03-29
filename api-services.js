// Authentication API
const authAPI = {
  loginWithCard(card_no, password) {
    return apiClient.post('/auth/login/card', { card_no, password });
  },

  loginWithMobile(phone, code) {
    return apiClient.post('/auth/login/mobile', { phone, code });
  },

  sendOTP(phone) {
    return apiClient.post('/auth/send-otp', { phone });
  },

  getQRCode() {
    return apiClient.get('/auth/qrcode');
  }
};

// Books API
const booksAPI = {
  getBooks(params) {
    return apiClient.get('/books', params);
  },

  searchBooks(params) {
    return apiClient.get('/books/search', params);
  },

  aiSearch(query, filters) {
    return apiClient.post('/books/ai-search', { query, filters });
  },

  getBookDetail(id) {
    return apiClient.get(`/books/${id}`);
  },

  getNewArrivals(limit = 10) {
    return apiClient.get('/books/new-arrivals', { limit });
  },

  getSimilarBooks(id, limit = 6) {
    return apiClient.get(`/books/${id}/similar`, { limit });
  },

  getStats() {
    return apiClient.get('/books/stats/counts');
  },

  getReviews(id) {
    return apiClient.get(`/books/${id}/reviews`);
  },

  postReview(id, rating, content) {
    return apiClient.post(`/books/${id}/reviews`, { rating, content });
  },

  toggleFavorite(id) {
    return apiClient.post(`/books/${id}/favorite`);
  }
};

// Borrows API
const borrowsAPI = {
  borrowBook(book_id) {
    return apiClient.post('/borrows', { book_id });
  },

  renewBook(id) {
    return apiClient.post(`/borrows/${id}/renew`);
  },

  returnBook(id) {
    return apiClient.post(`/borrows/${id}/return`);
  },

  getMyBorrows(status) {
    return apiClient.get('/borrows/my', status ? { status } : {});
  },

  getBorrowHistory(page = 1, limit = 20) {
    return apiClient.get('/borrows/history', { page, limit });
  }
};

// Reservations API
const reservationsAPI = {
  reserveBook(book_id) {
    return apiClient.post('/reservations', { book_id });
  },

  cancelReservation(id) {
    return apiClient.delete(`/reservations/${id}`);
  },

  getMyReservations(status) {
    return apiClient.get('/reservations/my', status ? { status } : {});
  }
};

// Devices API
const devicesAPI = {
  addDevice(device_type, device_email, device_name) {
    return apiClient.post('/devices', { device_type, device_email, device_name });
  },

  getDevices() {
    return apiClient.get('/devices');
  },

  deleteDevice(id) {
    return apiClient.delete(`/devices/${id}`);
  },

  pushToDevice(id, book_id) {
    return apiClient.post(`/devices/${id}/push`, { book_id });
  }
};

// Users API
const usersAPI = {
  getProfile() {
    return apiClient.get('/users/profile');
  },

  updateProfile(data) {
    return apiClient.put('/users/profile', data);
  },

  changePassword(old_password, new_password) {
    return apiClient.post('/users/change-password', { old_password, new_password });
  },

  getStats() {
    return apiClient.get('/users/stats');
  }
};

// Notices API
const noticesAPI = {
  getNotices(params) {
    return apiClient.get('/notices', params);
  },

  getNoticeDetail(id) {
    return apiClient.get(`/notices/${id}`);
  }
};

// Reading Progress API
const readingAPI = {
  readBook(book_id) {
    return apiClient.get(`/reading-progress/${book_id}/read`);
  },

  downloadBook(book_id, format) {
    return apiClient.get(`/reading-progress/${book_id}/download`, { format });
  },

  saveProgress(book_id, progress) {
    return apiClient.post('/reading-progress/progress', { book_id, progress });
  },

  getProgress(book_id) {
    return apiClient.get(`/reading-progress/progress/${book_id}`);
  }
};

// Admin API
const adminAPI = {
  login(username, password) {
    return apiClient.post('/admin/auth/login', { username, password });
  },

  getBooks(params) {
    return apiClient.get('/admin/books', params);
  },

  addBook(data) {
    return apiClient.post('/admin/books', data);
  },

  updateBook(id, data) {
    return apiClient.put(`/admin/books/${id}`, data);
  },

  deleteBook(id) {
    return apiClient.delete(`/admin/books/${id}`);
  },

  getUsers(params) {
    return apiClient.get('/admin/users', params);
  },

  updateUser(id, data) {
    return apiClient.put(`/admin/users/${id}`, data);
  },

  getBorrows(params) {
    return apiClient.get('/admin/borrows', params);
  },

  getNotices(params) {
    return apiClient.get('/admin/notices', params);
  },

  addNotice(data) {
    return apiClient.post('/admin/notices', data);
  },

  updateNotice(id, data) {
    return apiClient.put(`/admin/notices/${id}`, data);
  },

  deleteNotice(id) {
    return apiClient.delete(`/admin/notices/${id}`);
  },

  getDashboardStats() {
    return apiClient.get('/admin/dashboard/stats');
  },

  getRecentBorrows(limit = 10) {
    return apiClient.get('/admin/dashboard/recent-borrows', { limit });
  }
};
