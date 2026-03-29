// Page-specific API integrations

// Home page integration
const homePageInit = async () => {
  try {
    // Load new arrivals
    const newBooks = await booksAPI.getNewArrivals(10);
    renderNewArrivals(newBooks.data);

    // Load notices
    const notices = await noticesAPI.getNotices({ limit: 5 });
    renderNotices(notices.data);
  } catch (error) {
    console.error('Home page init error:', error);
  }
};

// Search functionality
const searchBooks = async (query, filters = {}) => {
  try {
    const result = await booksAPI.searchBooks({ q: query, ...filters });
    return result.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// AI Search
const aiSearchBooks = async (query, filters = {}) => {
  try {
    const result = await booksAPI.aiSearch(query, filters);
    return result.data;
  } catch (error) {
    console.error('AI search error:', error);
    throw error;
  }
};

// Book detail page
const loadBookDetail = async (bookId) => {
  try {
    const book = await booksAPI.getBookDetail(bookId);
    const similar = await booksAPI.getSimilarBooks(bookId, 6);
    return { book: book.data, similar: similar.data };
  } catch (error) {
    console.error('Load book detail error:', error);
    throw error;
  }
};

// Borrow book
const borrowBook = async (bookId) => {
  try {
    const result = await borrowsAPI.borrowBook(bookId);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Bookshelf page
const loadBookshelf = async (status = 'borrowing') => {
  try {
    const borrows = await borrowsAPI.getMyBorrows(status);
    const reservations = await reservationsAPI.getMyReservations();
    return { borrows: borrows.data, reservations: reservations.data };
  } catch (error) {
    console.error('Load bookshelf error:', error);
    throw error;
  }
};

// Renew book
const renewBook = async (borrowId) => {
  try {
    const result = await borrowsAPI.renewBook(borrowId);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Return book
const returnBook = async (borrowId) => {
  try {
    const result = await borrowsAPI.returnBook(borrowId);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Profile page
const loadProfile = async () => {
  try {
    const profile = await usersAPI.getProfile();
    const stats = await usersAPI.getStats();
    return { profile: profile.data, stats: stats.data };
  } catch (error) {
    console.error('Load profile error:', error);
    throw error;
  }
};

// Update profile
const updateProfile = async (data) => {
  try {
    const result = await usersAPI.updateProfile(data);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Devices page
const loadDevices = async () => {
  try {
    const devices = await devicesAPI.getDevices();
    return devices.data;
  } catch (error) {
    console.error('Load devices error:', error);
    throw error;
  }
};

// Add device
const addDevice = async (deviceType, deviceEmail, deviceName) => {
  try {
    const result = await devicesAPI.addDevice(deviceType, deviceEmail, deviceName);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Delete device
const deleteDevice = async (deviceId) => {
  try {
    await devicesAPI.deleteDevice(deviceId);
  } catch (error) {
    throw error;
  }
};

// Push to device
const pushToDevice = async (deviceId, bookId) => {
  try {
    const result = await devicesAPI.pushToDevice(deviceId, bookId);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Reading page
const loadReading = async (bookId) => {
  try {
    const content = await readingAPI.readBook(bookId);
    const progress = await readingAPI.getProgress(bookId);
    return { content: content.data, progress: progress.data };
  } catch (error) {
    console.error('Load reading error:', error);
    throw error;
  }
};

// Save reading progress
const saveReadingProgress = async (bookId, progress) => {
  try {
    await readingAPI.saveProgress(bookId, progress);
  } catch (error) {
    console.error('Save progress error:', error);
  }
};

// Admin login
const adminLogin = async (username, password) => {
  try {
    const result = await adminAPI.login(username, password);
    apiClient.setToken(result.data.token);
    localStorage.setItem('admin', JSON.stringify(result.data.admin));
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Admin dashboard
const loadAdminDashboard = async () => {
  try {
    const stats = await adminAPI.getDashboardStats();
    const recentBorrows = await adminAPI.getRecentBorrows(10);
    return { stats: stats.data, recentBorrows: recentBorrows.data };
  } catch (error) {
    console.error('Load admin dashboard error:', error);
    throw error;
  }
};

// Admin books
const loadAdminBooks = async (params) => {
  try {
    const books = await adminAPI.getBooks(params);
    return books.data;
  } catch (error) {
    console.error('Load admin books error:', error);
    throw error;
  }
};

// Admin add book
const adminAddBook = async (data) => {
  try {
    const result = await adminAPI.addBook(data);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Admin update book
const adminUpdateBook = async (id, data) => {
  try {
    const result = await adminAPI.updateBook(id, data);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Admin delete book
const adminDeleteBook = async (id) => {
  try {
    await adminAPI.deleteBook(id);
  } catch (error) {
    throw error;
  }
};

// Admin users
const loadAdminUsers = async (params) => {
  try {
    const users = await adminAPI.getUsers(params);
    return users.data;
  } catch (error) {
    console.error('Load admin users error:', error);
    throw error;
  }
};

// Admin borrows
const loadAdminBorrows = async (params) => {
  try {
    const borrows = await adminAPI.getBorrows(params);
    return borrows.data;
  } catch (error) {
    console.error('Load admin borrows error:', error);
    throw error;
  }
};

// Admin notices
const loadAdminNotices = async (params) => {
  try {
    const notices = await adminAPI.getNotices(params);
    return notices.data;
  } catch (error) {
    console.error('Load admin notices error:', error);
    throw error;
  }
};

// Helper: Render functions (to be implemented in each page)
const renderNewArrivals = (books) => {
  // Implementation in home.html
};

const renderNotices = (notices) => {
  // Implementation in home.html
};
