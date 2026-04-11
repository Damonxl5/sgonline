// Book Detail Page API Integration
let currentBookId = null;

const COVER_COLORS = [
  'linear-gradient(135deg,#0f4c81,#1a6bb5)',
  'linear-gradient(135deg,#92400e,#d97706)',
  'linear-gradient(135deg,#dc2626,#f97316)',
  'linear-gradient(135deg,#0891b2,#06b6d4)',
  'linear-gradient(135deg,#7c3aed,#a855f7)',
  'linear-gradient(135deg,#7c2d12,#ea580c)',
  'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#1e3a5f,#3b82f6)',
];

$(function () {
  // Get book ID: URL param takes priority, then sessionStorage
  const urlParams = new URLSearchParams(window.location.search);
  currentBookId = urlParams.get('id') || sessionStorage.getItem('current_book_id');

  if (!currentBookId) {
    $('#book-title').text('未找到书籍');
    console.error('book-detail: no book ID provided');
    return;
  }

  // Load book detail
  loadBookDetail(currentBookId);
  loadSimilarBooks(currentBookId);
  loadUserDevices();
  loadUserProfile();

  // Recently viewed books for the switcher bar
  const recentBooks = new Map();

  // Reviews tab: lazy load on first click
  let reviewsLoaded = false;
  $(document).on('click', 'button[onclick*="reviews"]', function () {
    if (!reviewsLoaded) {
      loadReviews(currentBookId);
      reviewsLoaded = true;
    }
  });

  // Load book detail
  async function loadBookDetail(id) {
    try {
      const res = await booksAPI.getBookDetail(id);
      const book = res.data;
      renderBookDetail(book);
      addToSwitcher(book);
    } catch (error) {
      console.error('Load book detail error:', error);
      alert('加载书籍详情失败');
    }
  }

  // Render book detail
  function renderBookDetail(book) {
    // Cover gradient (deterministic by id)
    const coverColor = COVER_COLORS[(book.id || 0) % COVER_COLORS.length];
    $('#book-cover').css('background', coverColor);
    $('#book-cover-title').text(book.title);
    $('#book-cover-author').text(book.author);

    // Title and author
    $('#book-title').text(book.title);
    $('#book-author-pub').text(`${book.author} 著 · ${book.publisher || '出版社'}`);

    // Status
    const statusMap = {
      available: { text: '可借阅', class: 'bg-green-100 text-green-700' },
      borrowed: { text: '已借完', class: 'bg-red-100 text-red-700' },
      reserved: { text: '预约中', class: 'bg-yellow-100 text-yellow-700' }
    };
    const status = statusMap[book.status] || statusMap.available;
    $('#book-status').text(status.text).attr('class', `flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium ${status.class}`);

    // Rating
    $('#book-rating').text(book.rating || '4.5');
    renderStars(book.rating || 4.5, '#book-stars');

    // Stats
    $('#book-borrows').text(`${book.borrow_count || 0} 次借阅`);
    $('#book-reviews').text(`· ${book.review_count || 0} 条评论`);

    // Tags
    const tags = [book.category, book.language, ...(book.tags || [])];
    $('#book-tags').html(tags.map(tag =>
      `<span class="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">${tag}</span>`
    ).join(''));

    // Meta info
    $('#book-year').text(book.publish_year || '2021');
    $('#book-pages').text(`${book.pages || 0}页`);
    $('#book-isbn').text(book.isbn || 'N/A');

    // Introduction
    $('#book-intro').text(book.description || '暂无简介');

    // Author info
    const initial = book.author ? book.author.charAt(0) : '作';
    $('#author-initial').text(initial);
    $('#author-name').text(book.author);
    $('#author-bio').text(book.author_bio || '暂无作者简介');

    // Preview text
    $('#book-preview-text').text(book.preview || '暂无试读内容');

    // TOC
    if (book.toc) {
      let tocData = book.toc;
      if (typeof tocData === 'string') {
        try { tocData = JSON.parse(tocData); } catch(e) { tocData = null; }
      }
      if (Array.isArray(tocData) && tocData.length) {
        const tocHtml = tocData.map(item => `
          <div class="flex items-center justify-between py-2 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-2 cursor-pointer">
            <span class="text-sm text-gray-700">${item.title || item[0] || ''}</span>
            <span class="text-xs text-gray-400">${item.page || item[1] || ''}</span>
          </div>`).join('');
        $('#tab-toc .space-y-2').html(tocHtml);
      }
    }

    // Update borrow button
    updateBorrowButton(book.status);
  }

  // Load user profile → avatar initial + borrow quota
  async function loadUserProfile() {
    try {
      const res = await usersAPI.getProfile();
      const user = res.data;

      // Nav avatar initial
      const initial = user.name ? user.name.charAt(0) : 'U';
      $('.user-avatar-initial').text(initial);

      // Borrow quota bar
      const used = user.stats ? user.stats.reading : 0;
      const quota = user.borrow_quota || 8;
      $('#borrow-quota-text').text(`已用 ${used}/${quota} 本`);
      const pct = quota > 0 ? Math.round(used / quota * 100) : 0;
      $('#borrow-quota-bar').css('width', pct + '%');
    } catch (err) {
      console.error('Load user profile error:', err);
    }
  }

  // Load reviews for a book
  async function loadReviews(id) {
    $('#tab-reviews .space-y-4').html(
      '<p class="text-sm text-gray-400 text-center py-4"><i class="fas fa-spinner fa-spin mr-1"></i>加载中...</p>'
    );
    try {
      const res = await booksAPI.getReviews(id);
      const reviews = res.data.reviews || [];
      renderReviews(reviews);
    } catch (err) {
      console.error('Load reviews error:', err);
      $('#tab-reviews .space-y-4').html(
        '<p class="text-sm text-gray-400 text-center py-4">加载失败，请稍后重试</p>'
      );
    }
  }

  // Render reviews list
  function renderReviews(reviews) {
    if (!reviews.length) {
      $('#tab-reviews .space-y-4').html(
        '<p class="text-sm text-gray-400 text-center py-4">暂无评论</p>'
      );
      return;
    }
    const html = reviews.map((r, i) => `
      <div class="${i < reviews.length - 1 ? 'border-b border-gray-100 pb-4' : ''}">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-primary text-xs font-bold">${r.user_name ? r.user_name.charAt(0) : '匿'}</span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800">${maskName(r.user_name)}</p>
            <div class="flex gap-0.5">${starsHtml(r.rating)}</div>
          </div>
          <span class="ml-auto text-xs text-gray-400">${r.created_at ? r.created_at.split('T')[0] : ''}</span>
        </div>
        <p class="text-sm text-gray-600">${r.content || ''}</p>
      </div>
    `).join('');
    $('#tab-reviews .space-y-4').html(html);
    // Update review count in header
    $('#book-reviews').text(`· ${reviews.length} 条评论`);
  }

  // Mask user name: 张三 → 张**
  function maskName(name) {
    if (!name) return '匿名';
    return name.charAt(0) + '**';
  }

  // Return star icons HTML string
  function starsHtml(rating) {
    return Array(5).fill(0).map((_, i) =>
      `<i class="fas fa-star ${i < rating ? 'text-amber-400' : 'text-gray-300'} text-xs"></i>`
    ).join('');
  }

  // Render stars
  function renderStars(rating, selector) {
    const fullStars = Math.floor(rating);
    const html = Array(5).fill(0).map((_, i) =>
      `<i class="fas fa-star ${i < fullStars ? 'text-amber-400' : 'text-gray-300'} text-xs"></i>`
    ).join('');
    $(selector).html(html);
  }

  // Update borrow button
  function updateBorrowButton(status) {
    const $btn = $('#btn-borrow');
    if (status === 'available') {
      $btn.html('<i class="fas fa-book-reader mr-2"></i>立即借阅（21天）');
    } else if (status === 'borrowed') {
      $btn.html('<i class="fas fa-clock mr-2"></i>加入预约队列').removeClass('btn-primary').addClass('border border-primary text-primary bg-white');
    }
  }

  // Load similar books
  async function loadSimilarBooks(id) {
    try {
      const res = await booksAPI.getSimilarBooks(id, 6);
      const books = res.data.books || [];
      renderSimilarBooks(books);
    } catch (error) {
      console.error('Load similar books error:', error);
    }
  }

  // Render similar books
  function renderSimilarBooks(books) {
    const html = books.map(book => `
      <div class="flex gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition" onclick="loadBook(${book.id})">
        <div class="w-12 h-16 rounded-lg flex-shrink-0" style="background:linear-gradient(135deg,#0f4c81,#1a6bb5)"></div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">${book.title}</p>
          <p class="text-xs text-gray-500 mt-0.5">${book.author}</p>
          <div class="flex items-center gap-1 mt-1">
            <i class="fas fa-star text-amber-400 text-xs"></i>
            <span class="text-xs text-gray-600">${book.rating || '4.5'}</span>
          </div>
        </div>
      </div>
    `).join('');
    $('#related-books').html(html);
  }

  // Load user devices
  async function loadUserDevices() {
    try {
      const res = await devicesAPI.getDevices();
      const devices = res.data.devices || [];
      renderDevices(devices);
    } catch (error) {
      console.error('Load devices error:', error);
    }
  }

  // Render devices
  function renderDevices(devices) {
    if (!devices.length) return;

    const icons = { ios: 'fa-mobile-alt', android: 'fa-mobile-alt', kindle: 'fa-tablet-alt', pc: 'fa-desktop' };
    const html = devices.map(device => `
      <div class="device-card flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer transition" data-device-id="${device.id}">
        <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <i class="fas ${icons[device.type] || 'fa-mobile-alt'} text-primary"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">${device.name}</p>
          <p class="text-xs text-gray-400">${device.model || ''}</p>
        </div>
        <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
      </div>
    `).join('');
    $('.space-y-2').first().html(html);
  }

  // Borrow book
  $('#btn-borrow').on('click', async function() {
    const $btn = $(this);
    const originalHtml = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin mr-2"></i>借阅中...').prop('disabled', true);

    try {
      const res = await borrowsAPI.borrowBook(currentBookId);
      $btn.html('<i class="fas fa-check mr-2"></i>借阅成功！').css('background', '#16a34a');
      sessionStorage.setItem('nlb_reading_book', currentBookId);
      setTimeout(() => navigateTo('reading'), 800);
    } catch (error) {
      alert(error.message || '借阅失败');
      $btn.html(originalHtml).prop('disabled', false);
    }
  });

  // Toggle favorite
  $(document).on('click', '.fa-heart', async function() {
    const $icon = $(this);
    try {
      const res = await booksAPI.toggleFavorite(currentBookId);
      if (res.data.favorited) {
        $icon.removeClass('far text-gray-400').addClass('fas text-red-500');
      } else {
        $icon.removeClass('fas text-red-500').addClass('far text-gray-400');
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  });

  // Push to device
  $(document).on('click', '.device-card', async function() {
    const deviceId = $(this).data('device-id');
    const deviceName = $(this).find('p.font-medium').text();

    const $modal = $(`
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
          <h3 class="font-semibold text-gray-800 mb-4">推送到 ${deviceName}</h3>
          <div class="bg-gray-100 rounded-xl p-4 mb-4">
            <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width:0%"></div>
          </div>
          <p class="text-xs text-center text-gray-400 mb-4">准备推送...</p>
          <button class="w-full py-2 border border-gray-200 rounded-xl text-sm" onclick="$(this).closest('.fixed').remove()">取消</button>
        </div>
      </div>
    `);

    $('body').append($modal);

    try {
      await devicesAPI.pushToDevice(deviceId, currentBookId);
      $modal.find('.bg-primary').css('width', '100%');
      $modal.find('p').text('推送成功！');
      setTimeout(() => $modal.remove(), 2000);
    } catch (error) {
      $modal.find('p').text('推送失败: ' + error.message);
    }
  });

  // Book switcher helpers
  function addToSwitcher(book) {
    recentBooks.set(book.id, book);
    renderSwitcher();
  }

  function renderSwitcher() {
    const html = Array.from(recentBooks.values()).map(b => {
      const color = COVER_COLORS[(b.id || 0) % COVER_COLORS.length];
      const active = b.id == currentBookId ? ' active' : '';
      return `
        <div class="bk-chip${active}" data-id="${b.id}" onclick="loadBook(${b.id})">
          <div class="bk-chip-cover" style="background:${color}"></div>
          <div>
            <div class="bk-chip-title">${b.title}</div>
            <div class="bk-chip-author">${b.author}</div>
          </div>
        </div>`;
    }).join('');
    $('#book-switcher').html(html);
  }

  // ── UI-only interactions ────────────────────────────────────────────────

  // Bookmark toggle
  $(document).on('click', '.fa-bookmark', function () {
    $(this).toggleClass('text-gray-400 text-primary');
  });

  // Share → toast
  $(document).on('click', '.fa-share-alt', function () {
    const $toast = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-xl shadow-lg z-50">链接已复制到剪贴板</div>');
    $('body').append($toast);
    setTimeout(() => $toast.fadeOut(300, function () { $(this).remove(); }), 2000);
  });

  // "试读前3章" button
  $(document).on('click', 'button:contains("试读前3章")', function () {
    sessionStorage.setItem('nlb_reading_book', currentBookId);
    navigateTo('reading');
  });

  // Preview tab "borrowing to read" button
  $(document).on('click', '#tab-preview .btn-primary', function () {
    sessionStorage.setItem('nlb_reading_book', currentBookId);
    navigateTo('reading');
  });

  // "加入书架（待读）"
  $(document).on('click', 'button:contains("加入书架")', function () {
    const $btn = $(this);
    $btn.html('<i class="fas fa-check mr-2 text-green-500"></i>已加入书架').addClass('bg-green-50 border-green-200');
    setTimeout(() => navigateTo('bookshelf'), 800);
  });

  // Download buttons (EPUB / PDF) — feedback only, real download needs auth
  $(document).on('click', 'button:contains("EPUB 格式"), button:contains("PDF 格式")', function () {
    const $btn = $(this);
    const orig = $btn.html();
    $btn.html('<span class="text-sm text-gray-700"><i class="fas fa-spinner fa-spin mr-2"></i>下载中...</span>');
    setTimeout(() => {
      $btn.html('<span class="text-sm text-green-600"><i class="fas fa-check mr-2"></i>下载完成</span>');
      setTimeout(() => $btn.html(orig), 2000);
    }, 1500);
  });

  // "绑定新设备" → devices page
  $(document).on('click', 'button:contains("绑定新设备")', function () {
    navigateTo('devices');
  });

  // "推送至设备" button (bulk push) → push to first bound device
  $(document).on('click', '.btn-push-device', function () {
    const $firstDevice = $('.device-card[data-device-id]').first();
    if ($firstDevice.length) {
      $firstDevice.trigger('click');
    } else {
      navigateTo('devices');
    }
  });

  // Global function for book switching (similar books / switcher bar)
  window._loadBook = function(id) {
    currentBookId = id;
    reviewsLoaded = false;
    sessionStorage.setItem('current_book_id', id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadBookDetail(id);
    loadSimilarBooks(id);
    // Update switcher highlight
    $('#book-switcher .bk-chip').removeClass('active');
    $('#book-switcher .bk-chip[data-id="' + id + '"]').addClass('active');
    // Reset to intro tab
    const firstTab = document.querySelector('#detail-tabs button');
    if (firstTab) switchDetailTab(firstTab, 'intro');
  };
});
