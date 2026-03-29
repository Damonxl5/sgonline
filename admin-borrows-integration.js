// Admin Borrows API Integration
$(function () {
  let currentPage = 1;
  let currentFilters = {};

  // Load borrows
  async function loadBorrows(page = 1) {
    try {
      const params = { page, limit: 20, ...currentFilters };
      const res = await adminAPI.getBorrows(params);
      const borrows = res.data?.borrows || [];
      const total = res.data?.total || 0;

      const html = borrows.map(b => {
        const statusMap = {
          borrowing: { class: 'bg-blue-50 text-blue-600 border-blue-100', text: '借阅中' },
          returned: { class: 'bg-gray-100 text-gray-600 border-gray-200', text: '已归还' },
          overdue: { class: 'bg-red-50 text-red-600 border-red-100', text: '已逾期' }
        };
        const status = statusMap[b.status] || statusMap.borrowing;
        const rowClass = b.status === 'overdue' ? 'bg-red-50/20' : '';

        return `<tr class="hover:bg-gray-50 transition ${rowClass}">
          <td class="px-6 py-4 text-gray-500 font-mono text-xs">${b.borrow_id || b.id}</td>
          <td class="px-6 py-4">
            <p class="font-medium text-gray-800">${b.user_name}</p>
            <p class="text-xs text-gray-400">${b.card_no}</p>
          </td>
          <td class="px-6 py-4">
            <p class="font-medium text-gray-800 text-primary">${b.title || b.book_title}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-gray-700">${b.borrow_date}</p>
            <p class="text-xs text-gray-400">${b.return_date ? '于 ' + b.return_date + ' 还' : '至 ' + b.due_date}</p>
          </td>
          <td class="px-6 py-4 text-center text-gray-500">${b.renew_count || 0} / 2</td>
          <td class="px-6 py-4 text-center">
            <span class="${status.class} px-2.5 py-1 rounded-full text-xs font-medium border">${status.text}</span>
          </td>
          <td class="px-6 py-4 text-right">
            ${b.status === 'borrowing' || b.status === 'overdue' ?
              `<button class="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg force-return" data-id="${b.id}" data-title="${b.title || b.book_title}">强制归还</button>` :
              `<button class="text-gray-400 font-medium text-xs px-2" disabled>无操作</button>`}
          </td>
        </tr>`;
      }).join('');

      $('#borrows-tbody').html(html || '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">暂无借阅记录</td></tr>');
      $('#borrows-total').text(`共 ${total} 条记录`);
      currentPage = page;
    } catch (error) {
      console.error('Load borrows error:', error);
    }
  }

  // Force return
  async function forceReturn(id, title) {
    if (confirm(`确认强制归还《${title}》？`)) {
      try {
        await borrowsAPI.returnBook(id);
        showToast('已强制归还');
        loadBorrows(currentPage);
      } catch (error) {
        showToast('操作失败：' + (error.message || '请重试'));
      }
    }
  }

  // Event handlers
  $(document).on('click', '.force-return', function() {
    const id = $(this).data('id');
    const title = $(this).data('title');
    forceReturn(id, title);
  });

  $('#search-input').on('input', function() {
    const query = $(this).val().trim();
    currentFilters.search = query || undefined;
    loadBorrows(1);
  });

  $('#filter-status').on('change', function() {
    const status = $(this).val();
    currentFilters.status = status !== 'all' ? status : undefined;
    loadBorrows(1);
  });

  // Init
  loadBorrows();

  function showToast(msg) {
    const $t = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">' + msg + '</div>');
    $('body').append($t);
    setTimeout(function() { $t.fadeOut(300, function() { $(this).remove(); }); }, 2000);
  }
});
