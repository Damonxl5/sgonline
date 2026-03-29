// Bookshelf Page API Integration
$(function () {
  const gradients = [
    'linear-gradient(135deg,#0f4c81,#1a6bb5)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#dc2626,#f87171)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#d97706,#fbbf24)',
    'linear-gradient(135deg,#db2777,#f472b6)',
    'linear-gradient(135deg,#2563eb,#60a5fa)',
    'linear-gradient(135deg,#7c2d12,#ea580c)',
    'linear-gradient(135deg,#4338ca,#818cf8)',
    'linear-gradient(135deg,#0891b2,#22d3ee)'
  ];

  // Load borrowing books
  async function loadBorrowingBooks() {
    try {
      const res = await borrowsAPI.getMyBorrows('borrowing');
      const borrows = Array.isArray(res.data) ? res.data : (res.data?.borrows || []);

      // Calculate days_left for each borrow
      borrows.forEach(b => {
        const dueDate = new Date(b.due_date);
        const today = new Date();
        b.days_left = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        b.book_title = b.title;
        b.book_author = b.author;
      });

      // Update stats
      const reading = borrows.length;
      const urgent = borrows.filter(b => b.days_left <= 2).length;
      $('#stat-reading').text(reading);
      $('#stat-urgent').text(urgent);
      $('#tab-borrowing-count').text(reading);

      // Render urgent warning
      const urgentBook = borrows.find(b => b.days_left <= 2);
      if (urgentBook) {
        $('#urgent-warning').html(`
          <i class="fas fa-exclamation-triangle text-red-500 flex-shrink-0"></i>
          <p class="text-sm text-red-700"><span class="font-semibold">《${urgentBook.book_title}》</span> 还有 <span class="font-bold">${urgentBook.days_left}天</span> 到期，请及时续借或归还</p>
          <button class="ml-auto flex-shrink-0 bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition renew-urgent" data-id="${urgentBook.id}">立即续借</button>
        `).removeClass('hidden');
      } else {
        $('#urgent-warning').addClass('hidden');
      }

      // Render books
      const html = borrows.map((b, i) => {
        const gradient = gradients[i % gradients.length];
        const isUrgent = b.days_left <= 2;
        const daysClass = isUrgent ? 'bg-red-100 text-red-600 urgent' : (b.days_left <= 7 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600');
        const borderClass = isUrgent ? 'border-2 border-red-200' : '';

        return `<div class="bg-white rounded-2xl shadow-sm card-hover overflow-hidden ${borderClass}">
          <div class="flex gap-4 p-4">
            <div class="w-16 h-22 rounded-xl flex-shrink-0 flex items-end p-2" style="background:${gradient}">
              <p class="text-white text-xs font-bold leading-tight">${b.book_title.substring(0, 6)}</p>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-semibold text-gray-800 text-sm">${b.book_title}</p>
                  <p class="text-xs text-gray-400 mt-0.5">${b.book_author || ''}</p>
                </div>
                <span class="${daysClass} text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">${b.days_left}天${isUrgent ? '到期' : ''}</span>
              </div>
              <div class="mt-2">
                <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>阅读进度</span>
                  <span class="font-medium text-gray-600">${b.progress || 0}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div class="progress-bar h-1.5 rounded-full" style="width:${b.progress || 0}%"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="px-4 pb-4 flex gap-2">
            <button class="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-dark transition" data-book-id="${b.book_id}">
              <i class="fas fa-book-reader mr-1"></i>继续阅读
            </button>
            <button class="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition renew-book" data-id="${b.id}">续借</button>
            <button class="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition return-book" data-id="${b.id}" data-title="${b.book_title}">归还</button>
          </div>
        </div>`;
      }).join('');

      $('#borrowing-list').html(html || '<p class="text-center text-gray-400 py-8">暂无借阅中的书籍</p>');
    } catch (error) {
      console.error('Load borrowing books error:', error);
    }
  }

  // Load borrow history
  async function loadBorrowHistory() {
    try {
      const res = await borrowsAPI.getBorrowHistory(1, 50);
      const history = res.data || [];

      const html = history.map((h, i) => {
        const gradient = gradients[i % gradients.length];
        const statusClass = h.status === 'borrowing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500';
        const statusText = h.status === 'borrowing' ? '借阅中' : '已归还';

        return `<div class="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
          <div class="w-10 h-14 rounded-lg flex-shrink-0" style="background:${gradient}"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">${h.book_title}</p>
            <p class="text-xs text-gray-400 mt-0.5">借阅：${h.borrow_date} · 归还：${h.return_date || '借阅中'}</p>
          </div>
          <span class="text-xs ${statusClass} px-2 py-1 rounded-full">${statusText}</span>
        </div>`;
      }).join('');

      $('#history-list').html(html || '<p class="text-center text-gray-400 py-8">暂无借阅历史</p>');
    } catch (error) {
      console.error('Load history error:', error);
    }
  }

  // Renew book
  async function renewBook(id) {
    try {
      await borrowsAPI.renewBook(id);
      showToast('续借成功，已延长21天');
      loadBorrowingBooks();
    } catch (error) {
      showToast('续借失败：' + (error.message || '请重试'));
    }
  }

  // Return book
  async function returnBook(id, title) {
    showConfirm('确认归还《' + title + '》？', '归还后将无法继续阅读', async function() {
      try {
        await borrowsAPI.returnBook(id);
        showToast('《' + title + '》已归还');
        loadBorrowingBooks();
      } catch (error) {
        showToast('归还失败：' + (error.message || '请重试'));
      }
    });
  }

  // Event handlers
  $(document).on('click', '.renew-book, .renew-urgent', function() {
    const id = $(this).data('id');
    renewBook(id);
  });

  $(document).on('click', '.return-book', function() {
    const id = $(this).data('id');
    const title = $(this).data('title');
    returnBook(id, title);
  });

  // Tab switching
  $(document).on('click', '#shelf-tabs button', function() {
    const tabName = $(this).attr('onclick').match(/'(\w+)'/)[1];
    if (tabName === 'history' && $('#history-list').is(':empty')) {
      loadBorrowHistory();
    }
  });

  // Init
  loadBorrowingBooks();

  function showToast(msg) {
    const $t = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">' + msg + '</div>');
    $('body').append($t);
    setTimeout(function() { $t.fadeOut(300, function() { $(this).remove(); }); }, 2000);
  }

  function showConfirm(title, desc, onConfirm) {
    const $modal = $(`
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl text-center">
          <i class="fas fa-exclamation-circle text-orange-400 text-3xl mb-3"></i>
          <h3 class="font-semibold text-gray-800 mb-1">${title}</h3>
          <p class="text-sm text-gray-400 mb-5">${desc}</p>
          <div class="flex gap-3">
            <button class="btn-cancel flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button class="btn-ok flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">确认</button>
          </div>
        </div>
      </div>`);
    $('body').append($modal);
    $modal.find('.btn-cancel').on('click', function() { $modal.remove(); });
    $modal.find('.btn-ok').on('click', function() { $modal.remove(); onConfirm(); });
  }
});
