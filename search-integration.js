// Search Page API Integration
$(function () {
  let currentPage = 1;
  let currentSort = 'newest';
  const pageSize = 12;

  // Get search params from sessionStorage
  const searchQuery = sessionStorage.getItem('search_query') || '';
  const aiResults = sessionStorage.getItem('ai_search_results');

  // Clear session storage
  sessionStorage.removeItem('search_query');
  sessionStorage.removeItem('ai_search_results');

  // Load stats for sidebar counts
  loadBookStats();

  // Initialize search
  if (aiResults) {
    try {
      const data = JSON.parse(aiResults);
      renderBooks(data.books || []);
      $('#result-count').text(data.total || 0);
      if (searchQuery) $('#search-input').val(searchQuery);
      updateFilterTags();
    } catch (error) {
      console.error('Parse AI results error:', error);
      performSearch();
    }
  } else {
    if (searchQuery) $('#search-input').val(searchQuery);
    performSearch();
  }

  // Load book statistics
  async function loadBookStats() {
    try {
      const res = await booksAPI.getStats();
      const stats = res.data;

      // Update language counts
      if (stats.by_language) {
        $('input[data-filter="lang"][data-val="中文"]').parent().find('.text-gray-400').text(stats.by_language['中文'] || 0);
        $('input[data-filter="lang"][data-val="English"]').parent().find('.text-gray-400').text(stats.by_language['English'] || 0);
        $('input[data-filter="lang"][data-val="Malay"]').parent().find('.text-gray-400').text(stats.by_language['Malay'] || 0);
        $('input[data-filter="lang"][data-val="Tamil"]').parent().find('.text-gray-400').text(stats.by_language['Tamil'] || 0);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  // Perform search with filters
  async function performSearch() {
    const query = $('#search-input').val().trim();
    const languages = getChecked('lang');
    const statuses = getChecked('status');
    const years = getChecked('year');

    const params = {
      page: currentPage,
      limit: pageSize,
      sort: currentSort
    };

    if (query) params.q = query;
    if (languages.length) params.lang = languages.join(',');
    if (statuses.length) params.status = statuses.join(',');
    if (years.length) params.year = years.join(',');

    try {
      const res = await booksAPI.searchBooks(params);
      const data = res.data;
      renderBooks(data.books || []);
      $('#result-count').text(data.total || 0);
      renderPagination(data.total || 0, currentPage);
      updateFilterTags();
    } catch (error) {
      console.error('Search error:', error);
      $('#book-grid').html('<div class="col-span-full text-center py-10 text-gray-500">搜索失败，请重试</div>');
    }
  }

  // Render books
  function renderBooks(books) {
    const colors = [
      'linear-gradient(135deg,#0f4c81,#1a6bb5)',
      'linear-gradient(135deg,#7c3aed,#a855f7)',
      'linear-gradient(135deg,#dc2626,#f97316)',
      'linear-gradient(135deg,#059669,#10b981)',
      'linear-gradient(135deg,#0891b2,#06b6d4)',
      'linear-gradient(135deg,#be185d,#ec4899)'
    ];

    if (!books.length) {
      $('#book-grid').html('<div class="col-span-full text-center py-10 text-gray-500">未找到相关书籍</div>');
      return;
    }

    const html = books.map((book, i) => {
      const statusClass = book.status === 'available' ? 'status-available' :
                         book.status === 'reserved' ? 'status-reserve' : 'status-borrowed';
      const statusText = book.status === 'available' ? '可借阅' :
                        book.status === 'reserved' ? '预约中' : '已借完';
      const btnText = book.status === 'available' ? '立即借阅' :
                     book.status === 'reserved' ? '查看详情' : '加入预约';
      const btnClass = book.status === 'available' ?
        'bg-primary text-white' : 'border border-primary text-primary';

      return `
        <div class="book-card bg-white rounded-2xl shadow-sm card-hover overflow-hidden" data-book-id="${book.id}" onclick="navigateTo('book-detail', ${book.id})">
          <div class="h-40 flex items-end p-3" style="background:${colors[i % colors.length]}">
            <div>
              <p class="text-white font-bold text-sm leading-tight">${book.title}</p>
              <p class="text-blue-200 text-xs mt-0.5">${book.author}</p>
            </div>
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="${statusClass} text-xs px-2 py-0.5 rounded-full font-medium">${statusText}</span>
              <div class="flex items-center gap-0.5">
                <i class="fas fa-star text-amber-400 text-xs"></i>
                <span class="text-xs text-gray-600 ml-0.5">${book.rating || '4.5'}</span>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-1">${book.category} · ${book.language}</p>
            <button class="mt-2 w-full py-1.5 text-xs rounded-lg font-medium transition ${btnClass}">${btnText}</button>
          </div>
        </div>
      `;
    }).join('');

    $('#book-grid').html(html);
  }

  // Render pagination
  function renderPagination(total, page) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
      $('#pagination').html('');
      return;
    }

    let html = '';

    // Previous button
    if (page > 1) {
      html += `<button class="pg-btn px-3 py-1.5 border rounded-lg text-sm" data-page="${page - 1}">上一页</button>`;
    }

    // Page numbers
    const range = getPageRange(page, totalPages);
    range.forEach(p => {
      if (p === '...') {
        html += `<span class="px-2 text-gray-400">...</span>`;
      } else {
        const active = p === page ? 'bg-primary text-white' : 'border hover:bg-gray-50';
        html += `<button class="pg-btn px-3 py-1.5 ${active} rounded-lg text-sm" data-page="${p}">${p}</button>`;
      }
    });

    // Next button
    if (page < totalPages) {
      html += `<button class="pg-btn px-3 py-1.5 border rounded-lg text-sm" data-page="${page + 1}">下一页</button>`;
    }

    $('#pagination').html(html);
  }

  // Get page range for pagination
  function getPageRange(current, total) {
    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  // Get checked filters
  function getChecked(filterType) {
    const vals = [];
    $(`input[data-filter="${filterType}"]:checked`).each(function() {
      vals.push($(this).data('val'));
    });
    return vals;
  }

  // Update filter tags
  function updateFilterTags() {
    const query = $('#search-input').val().trim();
    const tags = [];

    if (query) tags.push({ label: query, type: 'query' });

    getChecked('lang').forEach(l => tags.push({ label: l, type: 'lang', val: l }));
    getChecked('year').forEach(y => tags.push({ label: y, type: 'year', val: y }));
    getChecked('status').forEach(s => {
      const label = { available: '可借阅', reserve: '预约中', borrowed: '已借完' }[s] || s;
      tags.push({ label, type: 'status', val: s });
    });

    const html = tags.map(t => `
      <span class="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
        ${t.label}
        <i class="fas fa-times cursor-pointer ml-1 tag-remove" data-type="${t.type}" data-val="${t.val || ''}"></i>
      </span>
    `).join('');

    $('#filter-tags').html(html);
  }

  // Event: Filter change
  $(document).on('change', 'input[data-filter]', function() {
    currentPage = 1;
    performSearch();
  });

  // Event: Search input
  $('#search-input').on('keypress', function(e) {
    if (e.which === 13) {
      currentPage = 1;
      performSearch();
    }
  });

  // Event: Remove filter tag
  $(document).on('click', '.tag-remove', function(e) {
    e.stopPropagation();
    const type = $(this).data('type');
    const val = $(this).data('val');

    if (type === 'query') {
      $('#search-input').val('');
    } else {
      $(`input[data-filter="${type}"][data-val="${val}"]`).prop('checked', false);
    }

    currentPage = 1;
    performSearch();
  });

  // Event: Pagination
  $(document).on('click', '.pg-btn', function() {
    currentPage = parseInt($(this).data('page'));
    performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Event: Sort change
  $('#sort-select').on('change', function() {
    const sortMap = {
      '借阅热度': 'rating',
      '最新上架': 'newest',
      '评分最高': 'rating',
      '出版日期': 'newest'
    };
    currentSort = sortMap[$(this).val()] || 'newest';
    currentPage = 1;
    performSearch();
  });

  // Event: View toggle
  $('#btn-grid-view').on('click', function() {
    $('#book-grid').removeClass('space-y-4').addClass('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4');
    $(this).addClass('bg-gray-100');
    $('#btn-list-view').removeClass('bg-gray-100');
  });

  $('#btn-list-view').on('click', function() {
    $('#book-grid').removeClass('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4').addClass('space-y-4');
    $(this).addClass('bg-gray-100');
    $('#btn-grid-view').removeClass('bg-gray-100');
  });
});
