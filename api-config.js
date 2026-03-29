// API Configuration
const API_CONFIG = {
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8787/v1'
    : 'https://express-d1-app.damonwu.workers.dev/v1',
  timeout: 10000
};

// API Client
class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  getToken() {
    const isAdminPage = window.location.pathname.includes('admin-');
    return localStorage.getItem(isAdminPage ? 'admin_token' : 'token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      timeout: this.timeout
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.status === 401) {
        this.removeToken();
        window.location.href = '/login.html';
        throw new Error('未授权，请重新登录');
      }

      if (!response.ok) {
        throw new Error(data.message || '请求失败');
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new APIClient();

// Global: load user avatar initial for all pages
$(function() {
  const token = apiClient.getToken();
  if (!token) return;

  fetch(`${API_CONFIG.baseURL}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(res => {
    const name = res.data && res.data.name;
    if (name) {
      $('.user-avatar-initial').text(name.charAt(0));
      $('.user-name').text(name);
      if (res.data.card_no) $('.user-card').text(res.data.card_no);
    }
  })
  .catch(() => {});
});
