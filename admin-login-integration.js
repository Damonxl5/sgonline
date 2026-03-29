// Admin Login Page API Integration
$(function () {
  // Admin login
  async function adminLogin(username, password) {
    try {
      const res = await adminAPI.login(username, password);
      if (res.data?.token) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user || {}));
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  // Form submit
  $('#admin-login-form').on('submit', async function() {
    const username = $('#admin-id').val().trim();
    const password = $('#admin-pwd').val().trim();

    if (!username || !password) {
      showToast('请填写完整');
      return;
    }

    const $btn = $('#btn-login');
    const origText = $btn.html();
    $btn.html('<i class="fas fa-spinner fa-spin mr-2"></i>登录中...').prop('disabled', true);

    try {
      await adminLogin(username, password);
      $btn.html('<i class="fas fa-check mr-2"></i>登录成功').css('background', '#16a34a');
      setTimeout(function() {
        navigateTo('admin-dashboard');
      }, 600);
    } catch (error) {
      $btn.html(origText).prop('disabled', false);
      showToast('登录失败：' + (error.message || '账号或密码错误'));
    }
  });

  function showToast(msg) {
    const $t = $('<div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">' + msg + '</div>');
    $('body').append($t);
    setTimeout(function() { $t.fadeOut(300, function() { $(this).remove(); }); }, 2000);
  }
});
