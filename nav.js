/**
 * NLB eReads - 全局导航跳转逻辑
 * 所有页面引入此文件，统一处理页面间跳转
 * 在 index.html iframe 环境中通过 parent.navigateTo() 跳转
 * 独立打开时直接 window.location.href 跳转
 */

// i18n 辅助（nav.js 加载时 i18n.js 可能还未加载，用安全包装）
function _t(key, vars) {
  if (typeof t === 'function') return t(key, vars);
  return key;
}

// 页面路由映射
const ROUTES = {
  login:       'login.html',
  home:        'home.html',
  search:      'search.html',
  'book-detail': 'book-detail.html',
  reading:     'reading.html',
  bookshelf:   'bookshelf.html',
  profile:     'profile.html',
  help:        'help.html',
  devices:     'devices.html',
  'ai-chat':   'ai-chat.html',
  'admin-login':     'admin-login.html',
  'admin-dashboard': 'admin-dashboard.html',
  'admin-books':     'admin-books.html',
  'admin-users':     'admin-users.html',
  'admin-borrows':   'admin-borrows.html',
  'admin-notices':   'admin-notices.html',
};

/**
 * 核心跳转函数
 * @param {string} page - 路由 key，如 'home'、'book-detail'
 */
function navigateTo(page) {
  const url = ROUTES[page];
  if (!url) return;
  // 在 iframe 内时，通知父页面切换 iframe src
  if (window.self !== window.top && typeof window.parent.switchPage === 'function') {
    window.parent.switchPage(page, url);
  } else {
    window.location.href = url;
  }
}

// jQuery 就绪后绑定所有 data-nav 属性的元素
$(function () {
  // data-nav="page-key" 点击跳转
  $(document).on('click', '[data-nav]', function (e) {
    e.preventDefault();
    navigateTo($(this).data('nav'));
  });

  // 高亮当前页面对应的导航项
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  $('[data-nav-item]').each(function () {
    const target = ROUTES[$(this).data('nav-item')];
    if (target === currentFile) {
      $(this).addClass('nav-current');
    }
  });

  // ── AI 客服居中弹层（所有页面，除 index.html）──
  if (currentFile !== 'index.html') {
    // 注入样式
    $('head').append(`<style>
      @keyframes aiChatIn{from{transform:scale(.9) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
      #ai-chat-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);}
      #ai-chat-modal{width:440px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 48px);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.28);animation:aiChatIn .3s cubic-bezier(.34,1.56,.64,1);}
      .ai-chat-hd{background:linear-gradient(135deg,#0f4c81,#1a6bb5);padding:14px 16px;flex-shrink:0;}
      .ai-chat-bd{flex:1;overflow-y:auto;background:#f1f5f9;padding:14px;scroll-behavior:smooth;}
      .ai-chat-chips{background:#fff;border-top:1px solid #f1f5f9;padding:8px 10px;display:flex;gap:6px;overflow-x:auto;flex-shrink:0;}
      .ai-chat-chips::-webkit-scrollbar{display:none;}
      .ai-chat-ft{background:#fff;border-top:1px solid #f1f5f9;padding:10px 12px;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}
      .ai-bbl-ai{background:#fff;border:1px solid #e2e8f0;border-radius:4px 14px 14px 14px;padding:9px 13px;font-size:13px;color:#374151;line-height:1.65;max-width:88%;}
      .ai-bbl-user{background:#0f4c81;color:#fff;border-radius:14px 4px 14px 14px;padding:9px 13px;font-size:13px;line-height:1.65;max-width:88%;}
      .ai-tdot{width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:aiTd 1.2s infinite;display:inline-block;}
      .ai-tdot:nth-child(2){animation-delay:.2s;}.ai-tdot:nth-child(3){animation-delay:.4s;}
      @keyframes aiTd{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
      .ai-chip{border:1px solid #cbd5e1;border-radius:20px;padding:5px 11px;font-size:11px;color:#475569;cursor:pointer;white-space:nowrap;background:#fff;transition:all .15s;flex-shrink:0;font-family:inherit;}
      .ai-chip:hover{border-color:#0f4c81;color:#0f4c81;background:#eff6ff;}
      @keyframes fabPulse{0%,100%{box-shadow:0 4px 20px rgba(15,76,129,.5),0 0 0 0 rgba(15,76,129,.35)}70%{box-shadow:0 4px 20px rgba(15,76,129,.5),0 0 0 10px rgba(15,76,129,0)}}
      @keyframes fabBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      @keyframes fabLabelIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
      #ai-fab-wrap{position:fixed;bottom:24px;right:24px;z-index:9998;display:flex;align-items:center;gap:10px;flex-direction:row-reverse;}
      #ai-fab{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#0f4c81,#1a6bb5);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(15,76,129,.5);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;animation:fabPulse 2.4s ease-in-out infinite,fabBounce 3s ease-in-out infinite;flex-shrink:0;}
      #ai-fab:hover{transform:scale(1.12)!important;animation:none;box-shadow:0 8px 32px rgba(15,76,129,.65);}
      #ai-fab-label{background:linear-gradient(135deg,#0f4c81,#1a6bb5);color:#fff;font-size:12px;font-weight:600;padding:7px 13px;border-radius:20px;white-space:nowrap;box-shadow:0 4px 16px rgba(15,76,129,.35);animation:fabLabelIn .4s ease both;pointer-events:none;font-family:inherit;}
      #ai-fab-label::after{content:'';position:absolute;right:-6px;top:50%;transform:translateY(-50%);border:6px solid transparent;border-left-color:#1a6bb5;border-right:none;}
      #ai-fab-label{position:relative;}
    </style>`);

    // 把语言切换按钮注入到导航栏右侧区域
    if (!document.getElementById('lang-toggle-btn')) {
      const $btn = $(`<button id="lang-toggle-btn" onclick="switchLang()"
        style="flex-shrink:0;background:transparent;border:1px solid rgba(15,76,129,0.3);border-radius:7px;padding:3px 9px;font-size:11px;font-weight:700;color:#0f4c81;cursor:pointer;letter-spacing:.5px;font-family:inherit;transition:all .15s;white-space:nowrap;"
        onmouseenter="this.style.background='#eff6ff'" onmouseleave="this.style.background='transparent'"
      >${_t('lang.toggle')}</button>`);

      const $bell = $('nav .fa-bell').first().closest('button, a');
      if ($bell.length) {
        // 大部分页面：铃铛在右侧 flex 容器里，插入到铃铛前保持对齐
        $bell.before($btn);
      } else {
        const $headerRight = $('.top-header > div').last();
        if ($headerRight.length) {
          // admin-books / users / borrows / notices：放在顶部右侧操作区
          $headerRight.prepend($btn);
        } else if ($('nav').length) {
          // book-detail / reading 等页面：nav 内只有一行 flex 容器，末尾添加
          $('nav').first().find('> div').first().append($btn);
        } else {
          // 登录页：与管理员入口并排放在同一行
          const $adminWrap = $('a[href="admin-login.html"], a[onclick*="admin-login"]').first().parent();
          if ($adminWrap.length) {
            $adminWrap.css({ display:'flex', alignItems:'center', gap:'8px' });
            $btn.css({
              position:'static',
              background:'rgba(255,255,255,0.92)',
              boxShadow:'0 2px 8px rgba(0,0,0,.12)',
              border:'1px solid rgba(255,255,255,0.6)',
              color:'#0f4c81'
            });
            $adminWrap.prepend($btn);
          } else {
            // 其他无导航栏页面兜底：右上角固定
            $btn.css({
              position:'fixed', top:'16px', right:'16px', zIndex:9999,
              background:'rgba(255,255,255,0.92)',
              boxShadow:'0 2px 8px rgba(0,0,0,.12)',
              border:'1px solid rgba(255,255,255,0.6)',
              color:'#0f4c81'
            });
            $('body').append($btn);
          }
        }
      }
    }

    // FAB — 带标签的吸引人版本
    $('body').append(`
      <div id="ai-fab-wrap">
        <button id="ai-fab" data-i18n-title="ai.chat.fab.title" title="${_t('ai.chat.fab.title')}">
          <i class="fas fa-robot" style="color:#fff;font-size:20px;"></i>
        </button>
        <div id="ai-fab-label" data-i18n="ai.chat.fab.label">${_t('ai.chat.fab.label')}</div>
      </div>`);

    // 3秒后隐藏标签，保留 FAB
    setTimeout(() => $('#ai-fab-label').fadeOut(400), 4000);

    // ── 知识库（双语）──
    const AI_KB_ZH = {
      '借阅':'每位持有效借书证的会员可同时借阅最多 <strong>8本</strong> 电子书，每本借阅期 <strong>21天</strong>，可续借1次。<br><br>操作步骤：<br>① 搜索页找到书籍 → 点击封面<br>② 书籍详情页点击「立即借阅」<br>③ 借阅成功后可在「我的书架」查看',
      '额度':'您的借阅额度为 <strong>8本/次</strong>，当前已借 3 本，剩余 5 本。可在「我的书架」实时查看。',
      '续借':'续借步骤：<br>① 进入「我的书架 → 借阅中」<br>② 找到书籍，点击「续借」按钮<br>③ 借阅期自动延长 <strong>21天</strong><br><br>⚠️ 每本书最多续借 <strong>1次</strong>，请在到期前操作。',
      '推送':'推送至 Kindle 步骤：<br>① 「设备管理」页绑定 Kindle 邮箱<br>② 书籍详情页点击「推送至设备」<br>③ 选择 Kindle，点击「开始推送」<br><br>如推送失败，请将 <strong>nlb@ereads.sg</strong> 加入 Kindle 信任发件人。',
      'kindle':'推送至 Kindle 步骤：<br>① 「设备管理」页绑定 Kindle 邮箱<br>② 书籍详情页点击「推送至设备」<br>③ 选择 Kindle，点击「开始推送」',
      '借书证':'忘记借书证号，可通过以下方式找回：<br>① 登录 NLB Mobile App 查看<br>② 拨打客服热线 <strong>6332 3255</strong><br>③ 携带身份证前往任意 NLB 图书馆柜台查询',
      '阅读器':'目前支持：<br>• <strong>Kindle</strong>（MOBI/AZW3）<br>• <strong>Kobo</strong>（EPUB）<br>• <strong>文石 BOOX</strong>（EPUB/PDF）<br>• <strong>掌阅 iReader</strong>（EPUB/TXT）<br><br>在「设备管理」最多可绑定 <strong>3台</strong> 设备。',
      '下载':'借阅成功后，在书籍详情页选择 EPUB 或 PDF 格式下载。已下载书籍可在「我的书架 → 离线下载」中管理，最多可存储 <strong>5GB</strong>。',
      '逾期':'NLB 电子书借阅期满后系统将<strong>自动归还</strong>，不产生逾期罚款。建议开启到期提醒通知。',
      '罚款':'NLB 电子书借阅期满后系统将<strong>自动归还</strong>，不产生逾期罚款。',
      '注册':'办理借书证：携带 NRIC/FIN/护照前往任意 NLB 图书馆，即时免费办理。',
      '免费':'是的，完全免费！持有效新加坡图书馆借书证即可免费借阅平台所有 50,000+ 本正版电子书。',
      '语言':'平台支持 <strong>4种语言</strong>：中文、English、Malay、Tamil，共收录 50,000+ 正版电子书。',
    };
    const AI_KB_EN = {
      'borrow': 'Each member with a valid library card can borrow up to <strong>8 eBooks</strong> at a time, for <strong>21 days</strong> each, renewable once.<br><br>Steps:<br>① Find a book on the Search page → click the cover<br>② Click "Borrow Now" on the book detail page<br>③ View borrowed books in "My Shelf"',
      'quota': 'Your borrow quota is <strong>8 books</strong>. You currently have 3 borrowed, with 5 remaining. Check "My Shelf" anytime.',
      'renew': 'To renew:<br>① Go to "My Shelf → Borrowing"<br>② Find the book and click "Renew"<br>③ Loan period extends by <strong>21 days</strong><br><br>⚠️ Each book can only be renewed <strong>once</strong>. Renew before it expires.',
      'push': 'To push to Kindle:<br>① Link your Kindle email in "Device Management"<br>② Click "Push to Device" on the book detail page<br>③ Select Kindle and tap "Start Push"<br><br>If push fails, add <strong>nlb@ereads.sg</strong> to your Kindle trusted senders.',
      'kindle': 'To push to Kindle:<br>① Link your Kindle email in "Device Management"<br>② Click "Push to Device" on the book detail page<br>③ Select Kindle and tap "Start Push"',
      'card': 'If you forgot your library card number:<br>① Check the NLB Mobile App<br>② Call hotline <strong>6332 3255</strong><br>③ Visit any NLB library counter with your NRIC/FIN',
      'device': 'Supported e-readers:<br>• <strong>Kindle</strong> (MOBI/AZW3)<br>• <strong>Kobo</strong> (EPUB)<br>• <strong>BOOX</strong> (EPUB/PDF)<br>• <strong>iReader</strong> (EPUB/TXT)<br><br>Up to <strong>3 devices</strong> can be linked in "Device Management".',
      'download': 'After borrowing, choose EPUB or PDF format on the book detail page. Manage downloads in "My Shelf → Downloads" (up to <strong>5GB</strong>).',
      'overdue': 'NLB eBooks are <strong>automatically returned</strong> when the loan period ends — no overdue fines. We recommend enabling expiry reminders.',
      'fine': 'NLB eBooks are <strong>automatically returned</strong> when the loan period ends — no overdue fines.',
      'register': 'To get a library card: bring your NRIC/FIN/Passport to any NLB library. It\'s free and instant.',
      'free': 'Yes, completely free! Any valid Singapore library card gives you free access to all 50,000+ eBooks on the platform.',
      'language': 'The platform supports <strong>4 languages</strong>: Chinese, English, Malay, and Tamil, with 50,000+ titles.',
    };

    function getAiKb() {
      return (typeof getLang === 'function' && getLang() === 'en') ? AI_KB_EN : AI_KB_ZH;
    }

    function aiAnswer(q) {
      const lower = q.toLowerCase();
      const kb = getAiKb();
      for (const [k,v] of Object.entries(kb)) { if (lower.includes(k.toLowerCase())) return v; }
      return _t('ai.chat.default');
    }
    function aiTime() {
      const d = new Date();
      return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
    }
    function aiRobotIcon() {
      return `<div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#0f4c81,#1a6bb5);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;"><i class="fas fa-robot" style="color:#fff;font-size:10px;"></i></div>`;
    }
    function aiUserIcon() {
      return `<div style="width:26px;height:26px;border-radius:50%;background:#0f4c81;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;"><span style="color:#fff;font-size:9px;font-weight:700;">陈</span></div>`;
    }
    function aiScroll() { const el=$('#ai-msg-bd')[0]; if(el) el.scrollTop=el.scrollHeight; }
    function aiAddUser(text) {
      $('#ai-msg-list').append(`<div style="display:flex;align-items:flex-start;gap:8px;justify-content:flex-end;"><div><div class="ai-bbl-user">${text}</div><p style="font-size:10px;color:#94a3b8;margin:3px 4px 0 0;text-align:right;">${aiTime()}</p></div>${aiUserIcon()}</div>`);
      aiScroll();
    }
    function aiAddTyping() {
      $('#ai-msg-list').append(`<div style="display:flex;align-items:flex-start;gap:8px;" id="ai-typing">${aiRobotIcon()}<div class="ai-bbl-ai" style="display:flex;align-items:center;gap:5px;padding:11px 13px;"><div class="ai-tdot"></div><div class="ai-tdot"></div><div class="ai-tdot"></div></div></div>`);
      aiScroll();
    }
    function aiAddReply(html) {
      $('#ai-typing').remove();
      $('#ai-msg-list').append(`<div style="display:flex;align-items:flex-start;gap:8px;">${aiRobotIcon()}<div><div class="ai-bbl-ai">${html}</div><p style="font-size:10px;color:#94a3b8;margin:3px 0 0 4px;">${aiTime()}</p></div></div>`);
      aiScroll();
    }
    function aiSend(text) {
      text = text.trim(); if (!text) return;
      $('#ai-chat-input').val('').css('height','');
      aiAddUser(text); aiAddTyping();
      setTimeout(() => aiAddReply(aiAnswer(text)), 800 + Math.random()*500);
    }

    function openAIChat() {
      if ($('#ai-chat-overlay').length) return;
      const $ov = $(`<div id="ai-chat-overlay">
        <div id="ai-chat-modal">
          <div class="ai-chat-hd">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class="fas fa-robot" style="color:#fff;font-size:15px;"></i>
              </div>
              <div style="flex:1;">
                <p style="color:#fff;font-weight:600;font-size:14px;margin:0;">${_t('ai.chat.title')}</p>
                <p style="color:rgba(255,255,255,.75);font-size:11px;margin:2px 0 0;display:flex;align-items:center;gap:4px;">
                  <span style="width:6px;height:6px;background:#4ade80;border-radius:50%;display:inline-block;"></span>${_t('ai.chat.online')}
                </p>
              </div>
              <button id="ai-chat-close" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,.8);width:28px;height:28px;border-radius:8px;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;">×</button>
            </div>
          </div>
          <div class="ai-chat-bd" id="ai-msg-bd">
            <div id="ai-msg-list" style="display:flex;flex-direction:column;gap:14px;">
              <div style="display:flex;align-items:flex-start;gap:8px;">
                ${aiRobotIcon()}
                <div>
                  <div class="ai-bbl-ai">${_t('ai.chat.greeting')}</div>
                  <p style="font-size:10px;color:#94a3b8;margin:3px 0 0 4px;">${_t('ai.chat.just.now')}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="ai-chat-chips">
            <button class="ai-chip" data-aiq="${_t('ai.chip.borrow.q')}">${_t('ai.chip.borrow')}</button>
            <button class="ai-chip" data-aiq="${_t('ai.chip.renew.q')}">${_t('ai.chip.renew')}</button>
            <button class="ai-chip" data-aiq="${_t('ai.chip.kindle.q')}">${_t('ai.chip.kindle')}</button>
            <button class="ai-chip" data-aiq="${_t('ai.chip.quota.q')}">${_t('ai.chip.quota')}</button>
            <button class="ai-chip" data-aiq="${_t('ai.chip.card.q')}">${_t('ai.chip.card')}</button>
            <button class="ai-chip" data-aiq="${_t('ai.chip.device.q')}">${_t('ai.chip.device')}</button>
            <button class="ai-chip" data-aiq="${_t('ai.chip.overdue.q')}">${_t('ai.chip.overdue')}</button>
          </div>
          <div class="ai-chat-ft">
            <textarea id="ai-chat-input" rows="1"
              style="flex:1;resize:none;border:1px solid #e2e8f0;border-radius:14px;padding:8px 12px;font-size:13px;font-family:inherit;outline:none;transition:border-color .15s;max-height:90px;"
              placeholder="${_t('ai.chat.placeholder')}"
              onfocus="this.style.borderColor='#0f4c81'"
              onblur="this.style.borderColor='#e2e8f0'"></textarea>
            <button id="ai-send-btn" style="width:36px;height:36px;border-radius:50%;background:#0f4c81;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fas fa-paper-plane" style="color:#fff;font-size:12px;"></i>
            </button>
          </div>
        </div>
      </div>`);
      $('body').append($ov);

      $('#ai-chat-close').on('click', () => $ov.remove());
      $ov.on('click', e => { if ($(e.target).is('#ai-chat-overlay')) $ov.remove(); });
      $('#ai-send-btn').on('click', () => aiSend($('#ai-chat-input').val()));
      $('#ai-chat-input').on('keydown', function(e) {
        if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); aiSend($(this).val()); }
      }).on('input', function() {
        this.style.height='auto';
        this.style.height=Math.min(this.scrollHeight,90)+'px';
      });
      $ov.on('click', '.ai-chip', function() { aiSend($(this).data('aiq')); });
    }

    $('#ai-fab').on('click', openAIChat);

    // 语言切换时更新 FAB 标签
    $(document).on('nlb:langchange', function() {
      $('#ai-fab-label').text(_t('ai.chat.fab.label'));
      $('#ai-fab').attr('title', _t('ai.chat.fab.title'));
      const btn = document.getElementById('lang-toggle-btn');
      if (btn) btn.textContent = _t('lang.toggle');
    });

    // 铃铛：自动注入红点 + 绑定点击
    const $bellBtn = $('nav .fa-bell').first().closest('button, a');
    if ($bellBtn.length) {
      $bellBtn.css('position', 'relative');
      if (!$bellBtn.find('.nlb-bell-dot').length) {
        $bellBtn.append('<span class="nlb-bell-dot" style="position:absolute;top:6px;right:6px;width:7px;height:7px;background:#ef4444;border-radius:50%;pointer-events:none;"></span>');
      }
      $bellBtn.off('click.bell').on('click.bell', function(e) {
        e.stopPropagation();
        openNlbNotifications();
      });
    }
  }
});

// ── 全站通知面板 ──
const NLB_NOTICES = [
  { tag:'新书', tagColor:'#2563eb', date:'2025-03-15', unread:true,
    title:'3月新书上架：128本中英文新书已入库',
    body:'本月共新增128本中英文电子书，涵盖历史人文、科幻小说、儿童绘本等多个分类。其中中文新书82本，英文新书46本。所有新书即日起可免费借阅，每位会员借阅期21天，可续借1次。' },
  { tag:'提醒', tagColor:'#f97316', date:'2025-03-12', unread:true,
    title:'《活着》借阅即将到期，还有2天',
    body:'您借阅的《活着》（余华 著）将于2025年3月14日到期。如需继续阅读，请在到期前前往"我的书架"点击续借。每本书可续借1次，延长21天。' },
  { tag:'活动', tagColor:'#16a34a', date:'2025-03-10', unread:false,
    title:'NLB阅读节：4月线下活动报名开启',
    body:'NLB阅读节将于2025年4月12日至4月20日在国家图书馆（维多利亚街）举办。活动包括作者见面会、读书分享会、儿童阅读工作坊等多项精彩内容。报名免费，名额有限，请尽早完成报名。' },
  { tag:'系统', tagColor:'#6b7280', date:'2025-03-08', unread:false,
    title:'系统维护通知：3月20日凌晨2-4时暂停服务',
    body:'为提升平台稳定性，NLB eReads将于2025年3月20日凌晨2:00至4:00进行系统维护。维护期间平台将暂停所有服务。已下载的离线书籍不受影响，可正常阅读。如有疑问请联系客服热线 6332 3255。' },
];

function openNlbNoticeDetail(idx) {
  const n = NLB_NOTICES[idx];
  if (!n) return;
  n.unread = false;
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';
  div.innerHTML = `
    <div style="background:#fff;border-radius:18px;width:100%;max-width:360px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.25);">
      <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="background:${n.tagColor};color:#fff;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600;">${n.tag}</span>
          <span style="font-size:11px;color:#94a3b8;">${n.date}</span>
        </div>
        <button onclick="this.closest('[style*=inset]').remove()" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:20px;line-height:1;padding:0 4px;">×</button>
      </div>
      <div style="padding:18px 16px;">
        <h3 style="font-size:14px;font-weight:600;color:#1e293b;line-height:1.5;margin:0 0 10px;">${n.title}</h3>
        <p style="font-size:13px;color:#64748b;line-height:1.7;margin:0;">${n.body}</p>
      </div>
      <div style="padding:10px 16px 16px;">
        <button onclick="this.closest('[style*=inset]').remove()" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;font-size:13px;color:#374151;cursor:pointer;font-family:inherit;">关闭</button>
      </div>
    </div>`;
  div.addEventListener('click', function(e){ if (e.target === div) div.remove(); });
  document.body.appendChild(div);
}

function openNlbNotifications() {
  if (document.getElementById('nlb-notif-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'nlb-notif-panel';
  panel.style.cssText = 'position:fixed;top:58px;right:16px;width:320px;max-width:calc(100vw - 32px);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.18);z-index:99990;overflow:hidden;';

  const rows = NLB_NOTICES.map((n, i) => `
    <div onclick="openNlbNoticeDetail(${i})" style="padding:12px 16px;border-bottom:1px solid #f8fafc;cursor:pointer;background:${n.unread ? '#eff6ff' : '#fff'};"
      onmouseenter="this.style.background='#f1f5f9'" onmouseleave="this.style.background='${n.unread ? '#eff6ff' : '#fff'}'">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="background:${n.tagColor};color:#fff;font-size:11px;padding:1px 7px;border-radius:4px;font-weight:600;">${n.tag}</span>
        <span style="font-size:11px;color:#94a3b8;">${n.date}</span>
        ${n.unread ? '<span style="margin-left:auto;width:7px;height:7px;background:#ef4444;border-radius:50%;flex-shrink:0;"></span>' : ''}
      </div>
      <p style="font-size:13px;color:${n.unread ? '#1e293b' : '#374151'};font-weight:${n.unread ? '500' : '400'};line-height:1.4;margin:0;">${n.title}</p>
    </div>`).join('');

  panel.innerHTML = `
    <div style="padding:14px 16px 10px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;font-weight:700;color:#1e293b;">消息通知</span>
      <button onclick="document.getElementById('nlb-notif-panel').remove()" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:20px;line-height:1;padding:0 4px;">×</button>
    </div>
    <div style="max-height:380px;overflow-y:auto;">${rows}</div>
    <div style="padding:10px 16px;border-top:1px solid #f1f5f9;text-align:center;">
      <button onclick="NLB_NOTICES.forEach(n=>n.unread=false);document.getElementById('nlb-notif-panel').remove();document.querySelectorAll('.nlb-bell-dot').forEach(d=>d.remove())"
        style="font-size:12px;color:#0f4c81;background:none;border:none;cursor:pointer;font-family:inherit;">全部已读</button>
    </div>`;

  document.body.appendChild(panel);
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      const p = document.getElementById('nlb-notif-panel');
      if (p && !p.contains(e.target)) { p.remove(); document.removeEventListener('click', handler); }
    });
  }, 0);
}
