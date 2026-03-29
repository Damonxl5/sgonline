// Admin Books API Integration
$(function () {
  const gradients = [
    'linear-gradient(135deg,#0f4c81,#1a6bb5)',
    'linear-gradient(135deg,#d97706,#fbbf24)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#0891b2,#22d3ee)',
    'linear-gradient(135deg,#059669,#34d399)'
  ];

  let currentPage = 1;
  let currentFilters = {};

  // Load books
  async function loadBooks(page = 1) {
    try {
      const params = { page, limit: 20, ...currentFilters };
      const res = await adminAPI.getBooks(params);
      const books = res.data?.books || [];
      const total = res.data?.total || res.total || books.length;

      const html = books.map((b, i) => {
        const gradient = gradients[i % gradients.length];
        const statusClass = b.available_copies > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100';
        const statusText = b.available_copies > 0 ? '可借阅' : '已借空';
        const availableClass = b.available_copies > 0 ? 'text-primary' : 'text-red-500';

        return `<tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-14 rounded shadow-sm" style="background:${gradient}"></div>
              <div>
                <p class="font-bold text-gray-800">${b.title}</p>
                <p class="text-xs text-gray-400 mt-0.5">${b.author} · ISBN: ${b.isbn || 'N/A'}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600">${b.category} / ${b.language}</td>
          <td class="px-6 py-4 text-center text-gray-600 font-medium">${b.total_copies || 0}</td>
          <td class="px-6 py-4 text-center ${availableClass} font-bold">${b.available_copies || 0}</td>
          <td class="px-6 py-4"><span class="${statusClass} px-2.5 py-1 rounded-full text-xs font-medium border">${statusText}</span></td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button class="p-1.5 text-gray-400 hover:text-blue-500 transition edit-book" data-id="${b.id}" title="编辑"><i class="fas fa-edit"></i></button>
              <button class="p-1.5 text-gray-400 hover:text-red-500 transition delete-book" data-id="${b.id}" data-title="${b.title}" title="删除"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('');

      $('#books-tbody').html(html || '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">暂无书籍记录</td></tr>');
      $('#books-total').text(`共 ${total} 条记录`);
      updatePagination(page);
      currentPage = page;
    } catch (error) {
      console.error('Load books error:', error);
    }
  }

  // Add/Edit book
  async function saveBook(data, id = null) {
    try {
      if (id) {
        await adminAPI.updateBook(id, data);
        showToast('书籍信息已更新');
      } else {
        await adminAPI.addBook(data);
        showToast('新书录入成功');
      }
      loadBooks(currentPage);
    } catch (error) {
      showToast('保存失败：' + (error.message || '请重试'));
    }
  }

  // Add/Edit book with file
  async function saveBookWithFile(formData, id = null) {
    try {
      if (id) {
        await adminAPI.updateBook(id, formData);
        showToast('书籍信息已更新');
      } else {
        await adminAPI.addBook(formData);
        showToast('新书录入成功');
      }
      loadBooks(currentPage);
    } catch (error) {
      showToast('保存失败：' + (error.message || '请重试'));
    }
  }

  // Delete book
  async function deleteBook(id, title) {
    if (confirm(`警告：确定要删除《${title}》吗？此操作不可逆。`)) {
      try {
        await adminAPI.deleteBook(id);
        showToast('书籍已删除');
        loadBooks(currentPage);
      } catch (error) {
        showToast('删除失败：' + (error.message || '请重试'));
      }
    }
  }

  // Event handlers
  $(document).on('click', '.edit-book', function() {
    const id = $(this).data('id');
    showBookModal(id);
  });

  $(document).on('click', '.delete-book', function() {
    const id = $(this).data('id');
    const title = $(this).data('title');
    deleteBook(id, title);
  });

  $('#search-btn').on('click', function() {
    const query = $('#search-input').val().trim();
    currentFilters.search = query || undefined;
    loadBooks(1);
  });

  $(document).on('click', '#books-pagination button[data-page]', function() {
    const page = $(this).data('page');
    if (page === 'prev' && currentPage > 1) {
      loadBooks(currentPage - 1);
    } else if (page === 'next') {
      loadBooks(currentPage + 1);
    } else if (typeof page === 'number') {
      loadBooks(page);
    }
  });

  $('#filter-category').on('change', function() {
    const cat = $(this).val();
    currentFilters.category = cat !== 'all' ? cat : undefined;
    loadBooks(1);
  });

  function updatePagination(page) {
    $('#books-pagination button[data-page]').each(function() {
      const btnPage = $(this).data('page');
      if (btnPage === page) {
        $(this).removeClass('border border-gray-200 text-gray-600').addClass('bg-primary text-white');
      } else if (typeof btnPage === 'number') {
        $(this).removeClass('bg-primary text-white').addClass('border border-gray-200 text-gray-600');
      }
    });
  }

  // Render pagination
  function renderPagination(page, total, limit) {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) {
      $('#books-pagination').html('');
      return;
    }

    let html = '';
    html += `<button class="w-8 h-8 rounded border border-gray-200 flex items-center justify-center ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}" ${page === 1 ? 'disabled' : ''} data-page="${page - 1}"><i class="fas fa-chevron-left text-xs"></i></button>`;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="w-8 h-8 rounded ${i === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'} flex items-center justify-center text-sm font-medium" data-page="${i}">${i}</button>`;
      }
    } else {
      html += `<button class="w-8 h-8 rounded ${page === 1 ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'} flex items-center justify-center text-sm font-medium" data-page="1">1</button>`;
      if (page > 3) html += `<span class="px-1 text-gray-400">...</span>`;
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        html += `<button class="w-8 h-8 rounded ${i === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'} flex items-center justify-center text-sm font-medium" data-page="${i}">${i}</button>`;
      }
      if (page < totalPages - 2) html += `<span class="px-1 text-gray-400">...</span>`;
      html += `<button class="w-8 h-8 rounded ${page === totalPages ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'} flex items-center justify-center text-sm font-medium" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button class="w-8 h-8 rounded border border-gray-200 flex items-center justify-center ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}" ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}"><i class="fas fa-chevron-right text-xs"></i></button>`;

    $('#books-pagination').html(html);
  }

  $(document).on('click', '#books-pagination button[data-page]', function() {
    const page = parseInt($(this).data('page'));
    if (page > 0) loadBooks(page);
  });

  // Init
  loadBooks();

  function showToast(msg) {
    const $t = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">' + msg + '</div>');
    $('body').append($t);
    setTimeout(function() { $t.fadeOut(300, function() { $(this).remove(); }); }, 2000);
  }

  window.showBookModal = function(id = null) {
    const isEdit = !!id;
    const title = isEdit ? '编辑书籍信息' : '录入新书';
    const $modal = $(`
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-gray-800 text-lg">${title}</h3>
            <button class="btn-close text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">书籍名称</label>
                <input type="text" id="book-title" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">作者</label>
                <input type="text" id="book-author" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input type="text" id="book-isbn" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select id="book-category" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">请选择分类</option>
                  <option value="fiction">文学小说</option>
                  <option value="history">历史人文</option>
                  <option value="tech">科技技术</option>
                  <option value="kids">儿童读物</option>
                  <option value="academic">学术教育</option>
                  <option value="local">本地文化</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">语言</label>
                <select id="book-language" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">请选择语言</option>
                  <option value="中文">中文</option>
                  <option value="English">English</option>
                  <option value="Malay">Malay</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">电子版 (PDF)</label>
                <input type="file" id="book-file" accept=".pdf" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
            <button class="btn-close px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-white">取消</button>
            <button class="btn-save px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark">保存</button>
          </div>
        </div>
      </div>`);
    $('body').append($modal);
    $modal.find('.btn-close').on('click', function() { $modal.remove(); });
    $modal.find('.btn-save').on('click', async function() {
      const file = $('#book-file')[0]?.files[0];
      const data = {
        title: $('#book-title').val().trim(),
        author: $('#book-author').val().trim(),
        isbn: $('#book-isbn').val().trim(),
        category: $('#book-category').val().trim(),
        language: $('#book-language').val().trim()
      };
      if (!data.title || !data.author) { showToast('请填写书名和作者'); return; }

      if (file) {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        formData.append('file', file);
        $modal.remove();
        await saveBookWithFile(formData, id);
      } else {
        $modal.remove();
        saveBook(data, id);
      }
    });
  };
});
