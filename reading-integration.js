$(function () {
  // --- Resolve book ID ---
  const urlParams = new URLSearchParams(window.location.search);
  let currentBookId = urlParams.get('id') || sessionStorage.getItem('current_book_id');

  if (!currentBookId) {
    showError('未找到书籍，请从书籍详情页进入阅读');
    return;
  }
  currentBookId = parseInt(currentBookId, 10);

  // --- State ---
  let currentProgress = 0;
  let progressSaveTimer = null;

  // --- Init ---
  loadBook();

  // --- Load book info + reading URL ---
  async function loadBook() {
    showLoading();

    // Step 1: get reading URL (critical)
    let readUrl;
    try {
      const readRes = await readingAPI.readBook(currentBookId);
      readUrl = readRes.data && readRes.data.url;
    } catch (err) {
      console.error('reading: readBook error', err);
      showError(err && err.message ? err.message : '获取阅读链接失败，请重试');
      return;
    }

    if (!readUrl) {
      showError('该书籍暂无在线阅读链接');
      return;
    }

    // Step 2: load iframe immediately with the URL
    loadIframe(readUrl);

    // Step 3: load book detail for metadata (non-critical, runs in background)
    booksAPI.getBookDetail(currentBookId).then(function (bookRes) {
      const book = bookRes.data || {};
      if (book.title) $('#reading-title').text(book.title);
      if (book.author) $('#reading-chapter').text(book.author);
      renderToc(book.toc);
    }).catch(function () { /* metadata failure is non-critical */ });

    // Step 4: load saved progress (non-critical)
    loadProgress();
  }

  // --- Iframe ---
  function loadIframe(url) {
    const $iframe = $('#reader-iframe');

    // For PDF files, append #toolbar=1&view=FitH so browsers render inline;
    // also wrap with Google Docs viewer as a cross-origin fallback.
    const isPdf = /\.pdf(\?.*)?$/i.test(url);
    let src = url;
    if (isPdf) {
      // Try native PDF viewer first (works same-origin or when server sends
      // Content-Disposition: inline). Append fragment to hint inline display.
      src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now() + '#toolbar=1&view=FitH';
    }

    $iframe.attr('src', src);

    // Show iframe immediately for PDF (load event often won't fire cross-origin)
    if (isPdf) {
      setTimeout(function () {
        hideLoading();
        $iframe.removeClass('hidden');
      }, 800);
    } else {
      $iframe.on('load', function () {
        hideLoading();
        $iframe.removeClass('hidden');
      });
      // Fallback: show after 6s if load event doesn't fire
      setTimeout(function () {
        if ($('#reader-loading').is(':visible')) {
          hideLoading();
          $iframe.removeClass('hidden');
        }
      }, 6000);
    }
  }

  // --- TOC ---
  function renderToc(toc) {
    if (!toc) return;
    let items = toc;
    if (typeof toc === 'string') {
      try { items = JSON.parse(toc); } catch (e) { return; }
    }
    if (!Array.isArray(items) || items.length === 0) return;

    const $list = $('#toc-list').empty();
    items.forEach(function (item, idx) {
      const title = typeof item === 'string' ? item : (item.title || item.name || '');
      const $item = $('<div>')
        .addClass('px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer')
        .text(title)
        .on('click', function () {
          $('#toc-panel').addClass('hidden');
        });
      $list.append($item);
    });
  }

  // --- Progress ---
  async function loadProgress() {
    try {
      const res = await readingAPI.getProgress(currentBookId);
      const data = res.data || {};
      currentProgress = data.progress || 0;
      updateProgressUI(currentProgress);
    } catch (e) {
      // Non-critical; ignore
    }
  }

  function updateProgressUI(pct) {
    pct = Math.min(100, Math.max(0, pct));
    $('.progress-bar').css('width', pct + '%');
    $('#reading-pct').text(pct + '%');
    $('#reading-page-cur').text('进度 ' + pct + '%');
    $('#reading-page-total').text('');
  }

  function scheduleProgressSave(pct) {
    currentProgress = pct;
    clearTimeout(progressSaveTimer);
    progressSaveTimer = setTimeout(function () {
      readingAPI.saveProgress(currentBookId, pct).catch(function (e) {
        console.warn('reading: saveProgress failed', e);
      });
    }, 2000);
  }

  // Save progress on page unload
  $(window).on('beforeunload', function () {
    if (currentProgress > 0) {
      // Use sendBeacon for reliability
      const token = localStorage.getItem('token');
      const base = window.API_BASE_URL || '';
      const body = JSON.stringify({ book_id: currentBookId, progress: currentProgress });
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(base + '/reading-progress/progress', blob);
      }
    }
  });

  // --- Downloads ---
  async function triggerDownload(format) {
    try {
      const res = await readingAPI.downloadBook(currentBookId, format);
      const dlUrl = res.data && res.data.download_url;
      if (dlUrl) {
        const a = document.createElement('a');
        a.href = dlUrl;
        a.download = '';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('暂无 ' + format.toUpperCase() + ' 下载链接');
      }
    } catch (err) {
      console.error('reading: download error', err);
      alert('下载失败：' + (err && err.message ? err.message : '请重试'));
    }
  }

  $('#btn-dl-epub').on('click', function () { triggerDownload('epub'); });
  $('#btn-dl-pdf').on('click', function () { triggerDownload('pdf'); });
  $('#btn-dl-mobi').on('click', function () { triggerDownload('mobi'); });

  // --- TOC toggle ---
  $('[title="目录"]').on('click', function () {
    $('#toc-panel').toggleClass('hidden');
  });

  // --- Retry ---
  $('#reader-retry').on('click', function () {
    loadBook();
  });

  // --- Back navigation ---
  $('[data-nav="book-detail"]').on('click', function (e) {
    e.preventDefault();
    // Save progress before leaving
    if (currentProgress > 0) {
      readingAPI.saveProgress(currentBookId, currentProgress).finally(function () {
        navigateTo('book-detail', currentBookId);
      });
    } else {
      navigateTo('book-detail', currentBookId);
    }
  });

  // --- Helpers ---
  function showLoading() {
    $('#reader-loading').removeClass('hidden');
    $('#reader-error').addClass('hidden');
    $('#reader-iframe').addClass('hidden');
  }

  function hideLoading() {
    $('#reader-loading').addClass('hidden');
  }

  function showError(msg) {
    $('#reader-loading').addClass('hidden');
    $('#reader-iframe').addClass('hidden');
    $('#reader-error-msg').text(msg || '加载失败');
    $('#reader-error').removeClass('hidden');
  }
});
