// Book Detail Page API Integration
let currentBookId = null;

$(function () {
  // Get book ID from URL or sessionStorage
  const urlParams = new URLSearchParams(window.location.search);
  currentBookId = urlParams.get('id') || sessionStorage.getItem('current_book_id') || 1;

  // Load book detail
  loadBookDetail(currentBookId);
  loadSimilarBooks(currentBookId);
  loadUserDevices();

  // Load book detail
  async function loadBookDetail(id) {
    try {
      const res = await booksAPI.getBookDetail(id);
      const book = res.data;
      renderBookDetail(book);
    } catch (error) {
      console.error('Load book detail error:', error);
      alert('加载书籍详情失败');
    }
  }

  // Render book detail
  function renderBookDetail(book) {
    // Cover
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

    // Update borrow button
    updateBorrowButton(book.status);
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

  // Global function for similar books
  window._loadBook = function(id) {
    currentBookId = id;
    sessionStorage.setItem('current_book_id', id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadBookDetail(id);
    loadSimilarBooks(id);
  };
});
