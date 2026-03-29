// Admin Dashboard API Integration
$(function () {
  const gradients = [
    'linear-gradient(135deg,#0f4c81,#1a6bb5)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#dc2626,#f87171)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#d97706,#fbbf24)'
  ];

  // Load dashboard stats
  async function loadStats() {
    try {
      const res = await adminAPI.getDashboardStats();
      const stats = res.data?.stats || res.data || {};

      $('#stat-total-books').text(stats.totalBooks || stats.total_books || 0);
      $('#stat-total-users').text(stats.totalUsers || stats.total_users || 0);
      $('#stat-today-borrows').text(stats.totalBorrows || stats.today_borrows || 0);
      $('#stat-overdue').text(stats.overdue_count || 0);
      $('#dash-welcome-sub').text(`今天有 ${stats.totalBorrows || stats.today_borrows || 0} 本新借阅记录，系统运行平稳。`);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  // Load recent borrows
  async function loadRecentBorrows() {
    try {
      const res = await adminAPI.getRecentBorrows(5);
      const borrows = res.data?.borrows || res.data || [];

      const html = borrows.map((b, i) => {
        const gradient = gradients[i % gradients.length];
        const statusMap = {
          borrowing: { class: 'bg-blue-50 text-blue-600', text: '借阅中' },
          returned: { class: 'bg-green-50 text-green-600', text: '已归还' },
          overdue: { class: 'bg-red-50 text-red-600', text: '逾期' }
        };
        const status = statusMap[b.status] || statusMap.borrowing;

        return `<tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-10 rounded" style="background:${gradient}"></div>
              <span class="font-medium text-gray-800">${b.title || b.book_title}</span>
            </div>
          </td>
          <td class="px-6 py-3 text-gray-600">${b.user_name} <span class="text-xs text-gray-400 block">${b.card_no || ''}</span></td>
          <td class="px-6 py-3 text-gray-600">${b.borrow_date || b.borrow_time}</td>
          <td class="px-6 py-3"><span class="${status.class} px-2.5 py-1 rounded-full text-xs font-medium">${status.text}</span></td>
        </tr>`;
      }).join('');

      $('#recent-borrows-tbody').html(html || '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">暂无借阅记录</td></tr>');
    } catch (error) {
      console.error('Load recent borrows error:', error);
    }
  }

  // Init
  loadStats();
  loadRecentBorrows();
});
