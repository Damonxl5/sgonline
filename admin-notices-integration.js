// Admin Notices API Integration
$(function () {
  // Load notices
  async function loadNotices() {
    try {
      const res = await adminAPI.getNotices({ limit: 50 });
      const notices = res.data?.notices || [];

      const html = notices.map(n => {
        const typeMap = {
          '新书': { class: 'text-blue-500', text: '新书推荐' },
          '提醒': { class: 'text-orange-500', text: '运营活动' },
          '活动': { class: 'text-orange-500', text: '运营活动' },
          '系统': { class: 'text-red-500', text: '系统公告' }
        };
        const type = typeMap[n.type] || { class: 'text-gray-500', text: '一般通知' };
        const statusClass = n.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200';
        const statusText = n.status === 'active' ? '展示中' : '已结束';
        const titleClass = n.status === 'active' ? '' : 'text-gray-400 line-through';

        return `<tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-4 text-gray-600">
            <p>${n.created_at?.split(' ')[0] || ''}</p>
            <p class="text-xs text-gray-400">${n.created_at?.split(' ')[1] || ''}</p>
          </td>
          <td class="px-6 py-4">
            <p class="font-medium text-gray-800 ${titleClass}">${n.title}</p>
            <p class="text-xs ${type.class} mt-0.5">${type.text}</p>
          </td>
          <td class="px-6 py-4 text-gray-600">全站用户</td>
          <td class="px-6 py-4 text-center">
            <span class="${statusClass} px-2.5 py-1 rounded-full text-xs font-medium border">${statusText}</span>
          </td>
          <td class="px-6 py-4 text-right">
            ${n.status === 'active' ?
              `<button class="text-gray-400 hover:text-red-500 transition deactivate-notice" data-id="${n.id}" title="下线"><i class="fas fa-power-off"></i></button>` :
              `<button class="text-gray-300 cursor-not-allowed" disabled><i class="fas fa-power-off"></i></button>`}
          </td>
        </tr>`;
      }).join('');

      $('#notices-tbody').html(html || '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-400">暂无公告记录</td></tr>');
    } catch (error) {
      console.error('Load notices error:', error);
    }
  }

  // Add notice
  async function addNotice(data) {
    try {
      await adminAPI.addNotice(data);
      showToast('公告已发布');
      $('#notice-title').val('');
      $('textarea').val('');
      loadNotices();
    } catch (error) {
      showToast('发布失败：' + (error.message || '请重试'));
    }
  }

  // Deactivate notice
  async function deactivateNotice(id) {
    if (confirm('确认下线该公告？')) {
      try {
        await adminAPI.updateNotice(id, { status: 'inactive' });
        showToast('公告已下线');
        loadNotices();
      } catch (error) {
        showToast('操作失败：' + (error.message || '请重试'));
      }
    }
  }

  // Event handlers
  $(document).on('click', '.deactivate-notice', function() {
    const id = $(this).data('id');
    deactivateNotice(id);
  });

  // Init
  loadNotices();

  window.submitNotice = function() {
    const title = $('#notice-title').val().trim();
    const typeText = $('input[name="type"]:checked').parent().text().trim();
    const typeMap = { '新书推荐': '新书', '运营活动': '活动', '系统警告': '系统', '一般通知': '提醒' };
    const type = typeMap[typeText] || '提醒';
    const content = $('textarea').val().trim();
    const publish_date = new Date().toISOString().split('T')[0];

    if (!title) { showToast('请填写标题'); return; }

    const $btn = $('#btn-submit');
    $btn.html('<i class="fas fa-spinner fa-spin"></i> 发布中...').prop('disabled', true);

    addNotice({ title, type, content, publish_date, status: 'active' }).finally(() => {
      $btn.html('<i class="fas fa-bullhorn"></i> 立即发布').prop('disabled', false);
    });
  };

  function showToast(msg) {
    const $t = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">' + msg + '</div>');
    $('body').append($t);
    setTimeout(function() { $t.fadeOut(300, function() { $(this).remove(); }); }, 2000);
  }
});
