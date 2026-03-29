// Profile Page API Integration
$(function () {

  // Load user profile
  async function loadProfile() {
    try {
      const res = await usersAPI.getProfile();
      const user = res.data;

      // Hero section
      $('#profile-name').text(user.name || '');
      $('#profile-card-no').text('借书证号：' + (user.card_no || ''));

      // Account info rows
      $('#profile-field-name').text(user.name || '');
      $('#profile-field-phone').text(user.phone || '');
      $('#profile-field-email').text(user.email || '');
    } catch (error) {
      console.error('Load profile error:', error);
    }
  }

  // Load user stats
  async function loadStats() {
    try {
      const res = await usersAPI.getStats();
      const stats = res.data;

      $('#stat-total-borrowed').text(stats.total_borrowed || 0);
      $('#stat-reading').text(stats.reading || 0);

      const used = stats.reading || 0;
      const total = stats.borrow_quota || 5;
      const available = total - used;

      $('#stat-quota').text(`${used}/${total}`);
      $('#quota-used').text(used);
      $('#quota-total').text(total);
      $('#quota-available').text(available);

      // Update SVG circle progress
      const pct = total > 0 ? (used / total) * 100 : 0;
      $('#quota-circle').attr('stroke-dasharray', `${pct} ${100 - pct}`);
      $('#quota-label').text(`${used}/${total}`);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  // Save profile field via API
  async function saveProfileField(field, value) {
    try {
      const data = {};
      if (field === '姓名') data.name = value;
      else if (field === '手机号码') data.phone = value;
      else if (field === '电子邮件') data.email = value;

      if (Object.keys(data).length) {
        await usersAPI.updateProfile(data);
        loadProfile(); // Refresh
      }
    } catch (error) {
      showToast('保存失败：' + (error.message || '请重试'));
    }
  }

  // Save password via API
  async function savePassword(oldPwd, newPwd) {
    try {
      await usersAPI.changePassword(oldPwd, newPwd);
      showToast('密码已更新');
    } catch (error) {
      showToast('修改失败：' + (error.message || '请重试'));
    }
  }

  // Init
  loadProfile();
  loadStats();

  // Edit profile button
  $(document).on('click', 'button:contains("编辑资料")', function () {
    showEditModal('姓名', $('#profile-field-name').text(), function (val) {
      saveProfileField('姓名', val);
    });
  });

  // Account info rows click
  $(document).on('click', '.setting-row:has(.fa-chevron-right)', function (e) {
    if ($(e.target).closest('.toggle-on, .toggle-off').length) return;
    if ($(this).find('.fa-tablet-alt').length) return;

    const label = $(this).find('.text-sm.text-gray-700').first().text().trim();
    if (label === '密码与安全') {
      showPasswordModal();
      return;
    }
    if (label === '家属绑定') return;

    const fieldMap = { '姓名': '#profile-field-name', '手机号码': '#profile-field-phone', '电子邮件': '#profile-field-email' };
    const current = fieldMap[label] ? $(fieldMap[label]).text() : '';
    if (label && label !== '设备管理') {
      showEditModal(label, current, function (val) {
        saveProfileField(label, val);
      });
    }
  });

  // ---- Modals ----
  function showEditModal(label, current, onSave) {
    const $modal = $(`
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 class="font-semibold text-gray-800 mb-4">修改${label}</h3>
          <input type="text" class="edit-input w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value="${current}" placeholder="请输入${label}">
          <div class="flex gap-3 mt-4">
            <button class="btn-cancel flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button class="btn-save flex-1 py-2.5 text-white rounded-xl text-sm font-medium" style="background:#0f4c81">保存</button>
          </div>
        </div>
      </div>`);
    $('body').append($modal);
    $modal.find('.btn-cancel').on('click', function () { $modal.remove(); });
    $modal.find('.btn-save').on('click', function () {
      const val = $modal.find('.edit-input').val().trim();
      $modal.remove();
      if (val && onSave) onSave(val);
      showToast(label + '已更新');
    });
  }

  function showPasswordModal() {
    const $modal = $(`
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 class="font-semibold text-gray-800 mb-4">修改密码</h3>
          <input type="password" id="old-pwd" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="当前密码">
          <input type="password" id="new-pwd" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="新密码">
          <input type="password" id="confirm-pwd" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="确认新密码">
          <div class="flex gap-3 mt-4">
            <button class="btn-cancel flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button class="btn-save flex-1 py-2.5 text-white rounded-xl text-sm font-medium" style="background:#0f4c81">保存</button>
          </div>
        </div>
      </div>`);
    $('body').append($modal);
    $modal.find('.btn-cancel').on('click', function () { $modal.remove(); });
    $modal.find('.btn-save').on('click', function () {
      const oldPwd = $modal.find('#old-pwd').val();
      const newPwd = $modal.find('#new-pwd').val();
      const confirmPwd = $modal.find('#confirm-pwd').val();
      if (!oldPwd || !newPwd) { showToast('请填写完整'); return; }
      if (newPwd !== confirmPwd) { showToast('两次密码不一致'); return; }
      $modal.remove();
      savePassword(oldPwd, newPwd);
    });
  }

  function showToast(msg) {
    const $t = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">' + msg + '</div>');
    $('body').append($t);
    setTimeout(function () { $t.fadeOut(300, function () { $(this).remove(); }); }, 2000);
  }
});
