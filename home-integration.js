// Home Page API Integration
$(function () {
  // Load user profile
  async function loadUserProfile() {
    try {
      const res = await usersAPI.getProfile();
      const user = res.data;
      $('.user-name').text(user.name);
      $('.user-card').text(user.card_no);
      $('.user-avatar-initial').text(user.name ? user.name.charAt(0) : '');
    } catch (error) {
      console.error('Load profile error:', error);
    }
  }

  // Load user stats
  async function loadUserStats() {
    try {
      const res = await usersAPI.getStats();
      const stats = res.data;
      $('#stat-borrowing').text(stats.reading || 0);
      $('#stat-expiring').text(stats.expiring || 0);
      $('#stat-quota').text(`${stats.available || 0}/${stats.total || 8}`);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  // Load new arrivals
  async function loadNewArrivals() {
    try {
      const res = await booksAPI.getNewArrivals(6);
      const books = res.data.books || [];
      renderNewBooks(books);
    } catch (error) {
      console.error('Load new arrivals error:', error);
    }
  }

  // Render new books
  function renderNewBooks(books) {
    const colors = [
      'linear-gradient(135deg,#0f4c81,#1a6bb5)',
      'linear-gradient(135deg,#f093fb,#f5576c)',
      'linear-gradient(135deg,#4facfe,#00f2fe)',
      'linear-gradient(135deg,#43e97b,#38f9d7)',
      'linear-gradient(135deg,#fa709a,#fee140)',
      'linear-gradient(135deg,#30cfd0,#330867)'
    ];

    const html = books.map((book, i) => `
      <div class="book-card bg-white rounded-2xl shadow-sm card-hover overflow-hidden" data-book-id="${book.id}" onclick="navigateTo('book-detail', ${book.id})">
        <div class="h-36 flex items-end p-3" style="background:${colors[i % colors.length]}">
          <div>
            <p class="text-white font-bold text-xs">${book.title}</p>
            <p class="text-blue-200 text-xs">${book.author}</p>
          </div>
        </div>
        <div class="p-3">
          <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">${book.status === 'available' ? '可借阅' : '已借出'}</span>
          <p class="text-xs text-gray-400 mt-1.5">${book.category} · ${book.language}</p>
        </div>
      </div>
    `).join('');

    $('#new-books-container').html(html);
  }

  // Load notices
  async function loadNotices() {
    try {
      const res = await noticesAPI.getNotices({ limit: 3 });
      const notices = res.data.notices || [];
      renderNotices(notices);
    } catch (error) {
      console.error('Load notices error:', error);
    }
  }

  // Render notices
  function renderNotices(notices) {
    const typeColors = {
      '新书': 'blue',
      '活动': 'green',
      '提醒': 'orange',
      '系统': 'gray'
    };

    const html = notices.map(notice => {
      const color = typeColors[notice.type] || 'gray';
      return `
        <div class="announce-item flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition" onclick="showNoticeDetail(${notice.id})">
          <span class="bg-${color}-600 text-white text-xs px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">${notice.type}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800">${notice.title}</p>
            <p class="text-xs text-gray-400 mt-0.5">${notice.publish_date}</p>
          </div>
          <i class="fas fa-chevron-right text-gray-300 text-xs mt-1 flex-shrink-0"></i>
        </div>
      `;
    }).join('');

    $('#notices-container').html(html);
  }

  // Initialize page
  loadUserProfile();
  loadUserStats();
  loadNewArrivals();
  loadNotices();

  // Show notice detail
  window.showNoticeDetail = async function(id) {
    try {
      const res = await noticesAPI.getNotices({ limit: 100 });
      const notice = (res.data.notices || []).find(n => n.id === id);
      if (!notice) return;

      const typeColors = { '新书': '#2563eb', '活动': '#16a34a', '提醒': '#f97316', '系统': '#dc2626' };
      const color = typeColors[notice.type] || '#6b7280';
      const div = document.createElement('div');
      div.className = 'fixed inset-0 bg-black/50 z-[99990] flex items-center justify-center p-4';
      div.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-white text-xs px-2 py-0.5 rounded-md font-medium" style="background:${color}">${notice.type}</span>
              <span class="text-xs text-gray-400">${notice.publish_date}</span>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-5">
            <h3 class="font-semibold text-gray-800 text-sm leading-snug mb-3">${notice.title}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">${notice.content || '暂无详细内容'}</p>
          </div>
          <div class="px-5 pb-5">
            <button onclick="this.closest('.fixed').remove()" class="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">关闭</button>
          </div>
        </div>`;
      div.addEventListener('click', function(e){ if (e.target === div) div.remove(); });
      document.body.appendChild(div);
    } catch (error) {
      console.error('Show notice detail error:', error);
    }
  };

  // Category filter
  $('.cat-btn').on('click', async function() {
    const category = $(this).data('cat');
    $('.cat-btn').removeClass('bg-primary text-white').addClass('text-gray-600');
    $(this).addClass('bg-primary text-white').removeClass('text-gray-600');

    if (category === 'all') {
      loadNewArrivals();
    } else {
      try {
        const res = await booksAPI.getBooks({ category, limit: 6 });
        renderNewBooks(res.data.books || []);
      } catch (error) {
        console.error('Load category books error:', error);
      }
    }
  });

  // Search
  $('#search-input').on('keypress', function(e) {
    if (e.which === 13) {
      const query = $(this).val().trim();
      if (query) {
        sessionStorage.setItem('search_query', query);
        navigateTo('search');
      }
    }
  });

  // AI Search
  $('#btn-search').on('click', async function() {
    const query = $('#search-input').val().trim();
    if (!query) return;

    try {
      const res = await booksAPI.aiSearch(query, {});
      sessionStorage.setItem('ai_search_results', JSON.stringify(res.data));
      navigateTo('search');
    } catch (error) {
      alert('AI搜索失败: ' + error.message);
    }
  });
});
