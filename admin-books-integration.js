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
  let booksCache = {};

  // ── Load & render books ──────────────────────────────────────────────────

  async function loadBooks(page = 1) {
    try {
      const params = { page, limit: 20, ...currentFilters };
      // Remove 'all' sentinel values before sending
      if (params.category === 'all') delete params.category;
      if (params.status   === 'all') delete params.status;

      const res = await adminAPI.getBooks(params);
      const books = res.data?.books || [];
      const total = res.data?.total  || books.length;
      const limit = res.data?.limit  || 20;

      books.forEach(b => { booksCache[b.id] = b; });

      const html = books.map((b, i) => {
        const gradient     = gradients[i % gradients.length];
        const isAvailable  = b.available_copies > 0;
        const statusClass  = isAvailable
          ? 'bg-green-50 text-green-600 border-green-100'
          : 'bg-red-50 text-red-600 border-red-100';
        const statusText   = isAvailable ? '可借阅' : '已借空';
        const availClass   = isAvailable ? 'text-primary' : 'text-red-500';

        return `<tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-14 rounded shadow-sm flex-shrink-0" style="background:${gradient}"></div>
              <div>
                <p class="font-bold text-gray-800">${b.title}</p>
                <p class="text-xs text-gray-400 mt-0.5">${b.author}${b.publisher ? ' · ' + b.publisher : ''} · ISBN: ${b.isbn || 'N/A'}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600">${b.category || '—'} / ${b.language || '—'}</td>
          <td class="px-6 py-4 text-center text-gray-600 font-medium">${b.total_copies ?? 0}</td>
          <td class="px-6 py-4 text-center ${availClass} font-bold">${b.available_copies ?? 0}</td>
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
      renderPagination(page, total, limit);
      currentPage = page;
    } catch (err) {
      console.error('Load books error:', err);
      showToast('加载失败：' + (err.message || '请重试'));
    }
  }

  // ── Save book (add / edit) — always FormData ─────────────────────────────

  async function saveBook(fields, file, id = null, ebookFile = null) {
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') formData.append(k, v);
    });
    if (file) formData.append('file', file);
    if (ebookFile) formData.append('ebook', ebookFile);

    try {
      if (id) {
        await adminAPI.updateBook(id, formData);
        showToast('书籍信息已更新');
      } else {
        await adminAPI.addBook(formData);
        showToast('新书录入成功');
      }
      loadBooks(currentPage);
    } catch (err) {
      showToast('保存失败：' + (err.message || '请重试'));
    }
  }

  // ── Delete book ──────────────────────────────────────────────────────────

  async function deleteBook(id, title) {
    if (!confirm(`警告：确定要删除《${title}》吗？此操作不可逆。`)) return;
    try {
      await adminAPI.deleteBook(id);
      showToast('书籍已删除');
      loadBooks(currentPage);
    } catch (err) {
      showToast('删除失败：' + (err.message || '请重试'));
    }
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  function renderPagination(page, total, limit) {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) { $('#books-pagination').html(''); return; }

    const btn = (p, label, active) =>
      `<button class="w-8 h-8 rounded flex items-center justify-center text-sm font-medium
        ${active ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}"
        data-page="${p}">${label}</button>`;

    let html = btn(page - 1, '<i class="fas fa-chevron-left text-xs"></i>', false);
    if (page > 1) html = `<button class="w-8 h-8 rounded flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50" data-page="${page - 1}"><i class="fas fa-chevron-left text-xs"></i></button>`;
    else html = `<button class="w-8 h-8 rounded flex items-center justify-center border border-gray-200 text-gray-400 cursor-not-allowed" disabled><i class="fas fa-chevron-left text-xs"></i></button>`;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) html += btn(i, i, i === page);
    } else {
      html += btn(1, 1, page === 1);
      if (page > 3) html += `<span class="px-1 text-gray-400">...</span>`;
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        html += btn(i, i, i === page);
      }
      if (page < totalPages - 2) html += `<span class="px-1 text-gray-400">...</span>`;
      html += btn(totalPages, totalPages, page === totalPages);
    }

    if (page < totalPages) html += `<button class="w-8 h-8 rounded flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50" data-page="${page + 1}"><i class="fas fa-chevron-right text-xs"></i></button>`;
    else html += `<button class="w-8 h-8 rounded flex items-center justify-center border border-gray-200 text-gray-400 cursor-not-allowed" disabled><i class="fas fa-chevron-right text-xs"></i></button>`;

    $('#books-pagination').html(html);
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  $(document).on('click', '.edit-book', function () {
    showBookModal($(this).data('id'));
  });

  $(document).on('click', '.delete-book', function () {
    deleteBook($(this).data('id'), $(this).data('title'));
  });

  $('#search-btn').on('click', function () {
    const q = $('#search-input').val().trim();
    currentFilters.search = q || undefined;
    loadBooks(1);
  });

  $('#search-input').on('keypress', function (e) {
    if (e.which === 13) $('#search-btn').trigger('click');
  });

  $('#filter-category').on('change', function () {
    currentFilters.category = $(this).val();
    loadBooks(1);
  });

  $('#filter-status').on('change', function () {
    currentFilters.status = $(this).val();
    loadBooks(1);
  });

  $(document).on('click', '#books-pagination button[data-page]', function () {
    const page = parseInt($(this).data('page'));
    if (page > 0) loadBooks(page);
  });

  // ── Init ─────────────────────────────────────────────────────────────────

  loadBooks();

  // ── Toast ─────────────────────────────────────────────────────────────────

  function showToast(msg) {
    const $t = $(`<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">${msg}</div>`);
    $('body').append($t);
    setTimeout(() => $t.fadeOut(300, function () { $(this).remove(); }), 2500);
  }

  // ── Book modal (add / edit) ───────────────────────────────────────────────

  window.showBookModal = function (id = null) {
    const isEdit = !!id;
    const book   = isEdit ? (booksCache[id] || {}) : {};

    const field = (label, inputHtml) => `
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">${label}</label>
        ${inputHtml}
      </div>`;

    const text = (fid, val, placeholder = '') =>
      `<input type="text" id="${fid}" value="${val || ''}" placeholder="${placeholder}"
        class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">`;

    const number = (fid, val, placeholder = '') =>
      `<input type="number" id="${fid}" value="${val || ''}" placeholder="${placeholder}" min="0"
        class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">`;

    const CATEGORIES = [
      ['', '请选择分类'],
      ['fiction',  '文学小说'],
      ['history',  '历史人文'],
      ['tech',     '科技技术'],
      ['kids',     '儿童读物'],
      ['academic', '学术教育'],
      ['local',    '本地文化'],
    ];
    const LANGUAGES = [
      ['', '请选择语言'],
      ['中文',    '中文'],
      ['English', 'English'],
      ['Malay',   'Malay'],
      ['Tamil',   'Tamil'],
    ];
    const selectOpts = (opts, cur) => opts.map(([v, l]) =>
      `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('');

    const selectCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary';

    const $modal = $(`
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h3 class="font-bold text-gray-800 text-lg">${isEdit ? '编辑书籍信息' : '录入新书'}</h3>
            <button class="btn-close text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
          </div>

          <div class="p-6 overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">

              <!-- 书名 -->
              <div class="col-span-2">
                ${field('书名 <span class="text-red-400">*</span>', text('f-title', book.title, '必填'))}
              </div>

              <!-- 作者 / 出版社 -->
              ${field('作者 <span class="text-red-400">*</span>', text('f-author', book.author, '必填'))}
              ${field('出版社', text('f-publisher', book.publisher))}

              <!-- ISBN / 出版年份 -->
              ${field('ISBN', text('f-isbn', book.isbn))}
              ${field('出版年份', number('f-publish-year', book.publish_year, '如 2023'))}

              <!-- 分类 / 语言 -->
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">分类 <span class="text-red-400">*</span></label>
                <select id="f-category" class="${selectCls}">
                  ${selectOpts(CATEGORIES, book.category)}
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">语言 <span class="text-red-400">*</span></label>
                <select id="f-language" class="${selectCls}">
                  ${selectOpts(LANGUAGES, book.language)}
                </select>
              </div>

              <!-- 页数 / 总副本 / 可借副本 -->
              ${field('页数', number('f-pages', book.pages))}
              ${field('总副本数', number('f-total-copies', book.total_copies, '如 5'))}
              <div class="col-span-2">
                ${field('可借副本数', number('f-avail-copies', book.available_copies, '不超过总副本数'))}
              </div>

              <!-- 封面图片 URL -->
              <div class="col-span-2">
                ${field('封面图片 URL', text('f-cover-url', book.cover_url, 'https://cdn.example.com/cover.jpg'))}
              </div>

              <!-- 上传封面图片（可选，优先级高于 URL） -->
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-500 mb-1">上传封面图片（可选，覆盖 URL）</label>
                <input type="file" id="f-cover-file" accept="image/*"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
              </div>

              <!-- 电子书 URL -->
              <div class="col-span-2">
                ${field('电子书 URL', text('f-ebook-url', book.ebook_url, 'https://cdn.example.com/book.epub'))}
              </div>

              <!-- 上传电子书文件（可选，优先级高于 URL） -->
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-500 mb-1">上传电子书文件（可选，覆盖 URL，支持 epub / pdf / mobi）</label>
                <input type="file" id="f-ebook-file" accept=".epub,.pdf,.mobi"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
              </div>

              <!-- 简介 -->
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-500 mb-1">简介</label>
                <textarea id="f-description" rows="3" placeholder="书籍简介..."
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none">${book.description || ''}</textarea>
              </div>

            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button class="btn-close px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-white">取消</button>
            <button class="btn-save px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90">保存</button>
          </div>
        </div>
      </div>`);

    $('body').append($modal);

    $modal.find('.btn-close').on('click', () => $modal.remove());

    $modal.find('.btn-save').on('click', async function () {
      const title    = $('#f-title').val().trim();
      const author   = $('#f-author').val().trim();
      const category = $('#f-category').val();
      const language = $('#f-language').val();

      if (!title)    { showToast('请填写书名'); return; }
      if (!author)   { showToast('请填写作者'); return; }
      if (!category) { showToast('请选择分类'); return; }
      if (!language) { showToast('请选择语言'); return; }

      const totalCopies = parseInt($('#f-total-copies').val()) || undefined;
      const availCopies = parseInt($('#f-avail-copies').val());
      if (availCopies > totalCopies) { showToast('可借副本数不能超过总副本数'); return; }

      const fields = {
        title,
        author,
        publisher:       $('#f-publisher').val().trim()    || undefined,
        isbn:            $('#f-isbn').val().trim()          || undefined,
        category,
        language,
        publish_year:    parseInt($('#f-publish-year').val()) || undefined,
        pages:           parseInt($('#f-pages').val())        || undefined,
        total_copies:    totalCopies,
        available_copies: availCopies || undefined,
        cover_url:       $('#f-cover-url').val().trim()    || undefined,
        ebook_url:       $('#f-ebook-url').val().trim()    || undefined,
        description:     $('#f-description').val().trim()  || undefined,
      };

      const file      = $('#f-cover-file')[0]?.files[0]  || null;
      const ebookFile = $('#f-ebook-file')[0]?.files[0]  || null;

      $modal.remove();
      await saveBook(fields, file, isEdit ? id : null, ebookFile);
    });
  };
});
