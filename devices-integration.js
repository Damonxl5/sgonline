// Devices Page API Integration
$(function () {
  // Load devices
  async function loadDevices() {
    try {
      const res = await devicesAPI.getDevices();
      const devices = res.data || [];

      const html = devices.map(d => {
        const iconClass = d.device_type === 'kindle' ? 'fa-tablet-alt text-amber-600' :
                         d.device_type === 'kobo' ? 'fa-book-reader text-blue-600' :
                         'fa-mobile-alt text-green-600';
        const bgClass = d.device_type === 'kindle' ? 'bg-amber-50' :
                       d.device_type === 'kobo' ? 'bg-blue-50' :
                       'bg-green-50';

        return `<div class="bg-white rounded-2xl shadow-sm device-card p-5">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 ${bgClass} rounded-xl flex items-center justify-center">
              <i class="fas ${iconClass} text-xl"></i>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">已连接</span>
              <button class="text-gray-400 hover:text-gray-600 device-menu" data-id="${d.id}"><i class="fas fa-ellipsis-v text-sm"></i></button>
            </div>
          </div>
          <h3 class="font-semibold text-gray-800">${d.device_name}</h3>
          <p class="text-xs text-gray-400 mt-0.5">${d.device_email}</p>
          <div class="mt-3 pt-3 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>默认格式：${d.device_type.toUpperCase()}</span>
              <span>设备ID：${d.id}</span>
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-dark transition push-book" data-id="${d.id}">
              <i class="fas fa-paper-plane mr-1"></i>推送书籍
            </button>
            <button class="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition delete-device" data-id="${d.id}" data-name="${d.device_name}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>`;
      }).join('');

      $('#devices-list').html(html);
    } catch (error) {
      console.error('Load devices error:', error);
    }
  }

  // Add device
  async function addDevice(type, email, name) {
    try {
      await devicesAPI.addDevice(type, email, name);
      showToast('设备添加成功');
      loadDevices();
    } catch (error) {
      showToast('添加失败：' + (error.message || '请重试'));
    }
  }

  // Delete device
  async function deleteDevice(id, name) {
    showConfirm('确认删除设备「' + name + '」？', '删除后需重新添加', async function() {
      try {
        await devicesAPI.deleteDevice(id);
        showToast('设备已删除');
        loadDevices();
      } catch (error) {
        showToast('删除失败：' + (error.message || '请重试'));
      }
    });
  }

  // Event handlers
  $(document).on('click', 'button:contains("添加设备"), .border-dashed', function() {
    showAddDeviceModal();
  });

  $(document).on('click', '.delete-device', function() {
    const id = $(this).data('id');
    const name = $(this).data('name');
    deleteDevice(id, name);
  });

  // Init
  loadDevices();

  function showAddDeviceModal() {
    const $modal = $(`
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 class="font-semibold text-gray-800 mb-4">添加设备</h3>
          <select id="device-type" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="kindle">Kindle</option>
            <option value="kobo">Kobo</option>
            <option value="boox">文石 BOOX</option>
          </select>
          <input type="text" id="device-name" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="设备名称">
          <input type="email" id="device-email" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="设备邮箱">
          <div class="flex gap-3 mt-4">
            <button class="btn-cancel flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button class="btn-save flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">添加</button>
          </div>
        </div>
      </div>`);
    $('body').append($modal);
    $modal.find('.btn-cancel').on('click', function() { $modal.remove(); });
    $modal.find('.btn-save').on('click', function() {
      const type = $modal.find('#device-type').val();
      const name = $modal.find('#device-name').val().trim();
      const email = $modal.find('#device-email').val().trim();
      if (!name || !email) { showToast('请填写完整'); return; }
      $modal.remove();
      addDevice(type, email, name);
    });
  }

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
