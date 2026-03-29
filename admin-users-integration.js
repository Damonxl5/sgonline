// Admin Users API Integration
$(function () {
  let currentPage = 1;
  let currentFilters = {};

  // Load users
  async function loadUsers(page = 1) {
    try {
      const params = { page, limit: 20, ...currentFilters };
      const res = await adminAPI.getUsers(params);
      const users = res.data?.users || [];
      const total = res.data?.total || 0;

      const html = users.map(u => {
        const initial = u.name?.charAt(0) || 'U';
        const statusClass = u.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100';
        const statusText = u.status === 'active' ? '正常' : '已锁定';
        const quotaUsed = u.reading || 0;
        const quotaTotal = u.borrow_quota || 5;
        const quotaPct = quotaTotal > 0 ? (quotaUsed / quotaTotal) * 100 : 0;

        return `<tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">${initial}</div>
              <div>
                <p class="font-bold text-gray-800">${u.name}</p>
                <p class="text-xs text-gray-400 mt-0.5">${u.email || ''}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600 font-mono">${u.card_no}</td>
          <td class="px-6 py-4 text-gray-600 text-xs">${u.created_at || ''}</td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-center gap-2">
              <div class="w-16 bg-gray-200 rounded-full h-1.5"><div class="bg-primary h-1.5 rounded-full" style="width: ${quotaPct}%"></div></div>
              <span class="text-xs font-medium text-gray-600">${quotaUsed}/${quotaTotal}</span>
            </div>
          </td>
          <td class="px-6 py-4"><span class="${statusClass} px-2.5 py-1 rounded-full text-xs font-medium border"><i class="fas fa-check-circle mr-1"></i>${statusText}</span></td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button class="p-1.5 text-gray-400 hover:text-blue-500 transition reset-pwd" data-id="${u.id}" title="重置密码"><i class="fas fa-key"></i></button>
              <button class="p-1.5 text-gray-400 hover:text-red-500 transition ban-user" data-id="${u.id}" data-name="${u.name}" title="封禁账号"><i class="fas fa-ban"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('');

      $('#users-tbody').html(html || '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">暂无用户记录</td></tr>');
      $('#users-total').text(`共 ${total} 条记录`);
      currentPage = page;
    } catch (error) {
      console.error('Load users error:', error);
    }
  }

  // Ban user
  async function banUser(id, name) {
    if (confirm(`确认封禁用户「${name}」？`)) {
      try {
        await adminAPI.updateUser(id, { status: 'banned' });
        showToast('用户已封禁');
        loadUsers(currentPage);
      } catch (error) {
        showToast('操作失败：' + (error.message || '请重试'));
      }
    }
  }

  // Event handlers
  $(document).on('click', '.reset-pwd', function() {
    const id = $(this).data('id');
    alert('重置密码功能：将发送重置邮件到用户邮箱');
  });

  $(document).on('click', '.ban-user', function() {
    const id = $(this).data('id');
    const name = $(this).data('name');
    banUser(id, name);
  });

  $('#search-input').on('input', function() {
    const query = $(this).val().trim();
    currentFilters.search = query || undefined;
    loadUsers(1);
  });

  // Init
  loadUsers();

  function showToast(msg) {
    const $t = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">' + msg + '</div>');
    $('body').append($t);
    setTimeout(function() { $t.fadeOut(300, function() { $(this).remove(); }); }, 2000);
  }
});
