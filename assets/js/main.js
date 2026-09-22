/**
 * PUCECO — Client Website Interactive Controller
 * Tích hợp dữ liệu động từ data-store.js, Live Search, Modal & Real Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.PUCECO_STORE;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Render Dynamic Data from DataStore =====
  function renderWebsiteContent() {
    if (!store) return;
    const settings = store.getSettings();
    const products = store.getProducts();
    const news = store.getNews();

    // 1. Render Settings (Hotline, Email, Address, Stats, Brand)
    document.querySelectorAll('[data-bind="hotline"]').forEach(el => el.textContent = settings.hotline);
    document.querySelectorAll('[data-bind="email"]').forEach(el => el.textContent = settings.email);
    document.querySelectorAll('[data-bind="address"]').forEach(el => el.textContent = settings.address);
    document.querySelectorAll('[data-bind="slogan"]').forEach(el => el.textContent = settings.slogan);

    const statYears = document.querySelector('[data-stat="years"]');
    if (statYears) statYears.dataset.count = settings.stats?.years || 12;

    const statPartners = document.querySelector('[data-stat="partners"]');
    if (statPartners) statPartners.dataset.count = settings.stats?.partners || 320;

    const statLines = document.querySelector('[data-stat="lines"]');
    if (statLines) statLines.dataset.count = settings.stats?.lines || 48;

    const statTrace = document.querySelector('[data-stat="traceability"]');
    if (statTrace) statTrace.dataset.count = settings.stats?.traceability || 100;

    // 2. Render Featured Products
    const featuredGrid = document.querySelector('#featured-products-grid');
    if (featuredGrid) {
      const featured = products.filter(p => p.isFeatured !== false);
      featuredGrid.innerHTML = featured.map(p => `
        <article class="product-card" data-product-id="${p.id}">
          <div class="product-thumb" style="--c1:${p.bg1 || '#E6F1EA'};--c2:${p.bg2 || '#C9E3D3'}">
            <img class="product-art" src="${p.image}" alt="${p.name}" loading="lazy">
            <span class="product-tag ${p.tag === 'Organic' ? 'alt' : ''}">${p.tag || 'Bán chạy'}</span>
          </div>
          <div class="product-body">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <button type="button" class="link-arrow" onclick="openProductModal('${p.id}')">
              Chi tiết tiêu chuẩn <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      `).join('');
    }

    // 3. Render New Products
    const newGrid = document.querySelector('#new-products-grid');
    if (newGrid) {
      const newProds = products.filter(p => p.isNew === true);
      newGrid.innerHTML = newProds.map(p => `
        <article class="product-card wide" data-product-id="${p.id}">
          <div class="product-thumb tall" style="--c1:${p.bg1 || '#F3EFE2'};--c2:${p.bg2 || '#E0CFA6'}">
            <img class="product-art" src="${p.image}" alt="${p.name}" loading="lazy">
            <span class="product-tag">${p.tag || 'Mới'}</span>
          </div>
          <div class="product-body">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <button type="button" class="link-arrow" onclick="openProductModal('${p.id}')">
              Yêu cầu mẫu thử <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      `).join('');
    }

    // 4. Render News
    const newsGrid = document.querySelector('#news-grid');
    if (newsGrid) {
      newsGrid.innerHTML = news.map(n => `
        <article class="news-card" data-news-id="${n.id}">
          <div class="news-thumb" style="--c1:${n.bg1 || '#E6F1EA'};--c2:${n.bg2 || '#C9E3D3'}" onclick="openNewsModal('${n.id}')">
            <img class="news-art" src="${n.image}" alt="${n.title}" loading="lazy">
          </div>
          <div class="news-body">
            <p class="news-date">${n.date}</p>
            <h3>${n.title}</h3>
            <p>${n.excerpt}</p>
            <button type="button" class="link-arrow" onclick="openNewsModal('${n.id}')">
              Đọc tiếp <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      `).join('');
    }

    // 5. Update Contact Form Product Options
    const prodSelect = document.querySelector('#contact-product');
    if (prodSelect) {
      const currentValue = prodSelect.value;
      prodSelect.innerHTML = '<option value="">-- Chọn sản phẩm quan tâm --</option>' +
        products.map(p => `<option value="${p.name}">${p.name} (${p.tag || 'Chuẩn'})</option>`).join('') +
        '<option value="Yêu cầu tư vấn khác">Yêu cầu nghiên cứu / Khác</option>';
      if (currentValue) prodSelect.value = currentValue;
    }

    // Run counters
    initCounters();
  }

  // ===== Header Scroll =====
  const header = document.querySelector('[data-header]');
  const onScroll = () => {
    if (header) header.toggleAttribute('data-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Mobile Navigation =====
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = mobileNav.hasAttribute('hidden');
      mobileNav.toggleAttribute('hidden', !open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        mobileNav.setAttribute('hidden', '');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Mở menu');
      })
    );
  }

  // ===== Live Search System =====
  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchBar = document.querySelector('[data-search]');
  const searchClose = document.querySelector('[data-search-close]');
  const searchInput = document.querySelector('#search-input');
  const searchResults = document.querySelector('#search-results');

  const openSearch = (open) => {
    if (!searchBar || !searchToggle) return;
    searchBar.toggleAttribute('hidden', !open);
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      searchInput?.focus();
      handleSearch(searchInput?.value || '');
    }
  };

  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', () => openSearch(searchBar.hasAttribute('hidden')));
    searchClose?.addEventListener('click', () => openSearch(false));
  }

  function handleSearch(query) {
    if (!searchResults) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      searchResults.setAttribute('hidden', '');
      searchResults.innerHTML = '';
      return;
    }

    const products = store.getProducts();
    const news = store.getNews();

    const matchedProducts = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      (p.details?.activeIngredient && p.details.activeIngredient.toLowerCase().includes(q))
    );

    const matchedNews = news.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q)
    );

    if (matchedProducts.length === 0 && matchedNews.length === 0) {
      searchResults.removeAttribute('hidden');
      searchResults.innerHTML = `<div style="padding:16px;text-align:center;color:var(--color-muted);">Không tìm thấy kết quả nào cho "<b>${escapeHtml(query)}</b>"</div>`;
      return;
    }

    let html = '';
    if (matchedProducts.length > 0) {
      html += `<div style="font-size:0.8rem;font-weight:700;color:var(--color-accent);margin:6px 12px 8px;text-transform:uppercase;letter-spacing:0.05em">Sản phẩm (${matchedProducts.length})</div>`;
      matchedProducts.forEach(p => {
        html += `
          <div class="search-item" onclick="openProductModal('${p.id}'); closeSearch();">
            <img class="search-thumb" src="${p.image}" alt="">
            <div class="search-info">
              <h5>${escapeHtml(p.name)}</h5>
              <p>${escapeHtml(p.desc.substring(0, 75))}...</p>
            </div>
            <span class="search-badge">${p.tag || 'Sản phẩm'}</span>
          </div>
        `;
      });
    }

    if (matchedNews.length > 0) {
      html += `<div style="font-size:0.8rem;font-weight:700;color:var(--color-accent-2-ink);margin:14px 12px 8px;text-transform:uppercase;letter-spacing:0.05em">Tin tức & Nghiên cứu (${matchedNews.length})</div>`;
      matchedNews.forEach(n => {
        html += `
          <div class="search-item" onclick="openNewsModal('${n.id}'); closeSearch();">
            <img class="search-thumb" src="${n.image}" alt="">
            <div class="search-info">
              <h5>${escapeHtml(n.title)}</h5>
              <p>${escapeHtml(n.excerpt.substring(0, 75))}...</p>
            </div>
            <span class="search-badge">Tin tức</span>
          </div>
        `;
      });
    }

    searchResults.removeAttribute('hidden');
    searchResults.innerHTML = html;
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  }

  window.closeSearch = () => openSearch(false);

  // ===== Hero Slider =====
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = [...hero.querySelectorAll('[data-slide]')];
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = slides.findIndex(s => s.classList.contains('is-active'));
    if (index < 0) index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Đến slide ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      dotsWrap?.appendChild(dot);
    });
    const dots = [...dotsWrap?.children || []];

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === index));
      dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === index)));
    };

    prev?.addEventListener('click', () => go(index - 1));
    next?.addEventListener('click', () => go(index + 1));
    go(index);
  }

  // ===== Count-Up Stats =====
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(el => {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const dur = 900;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // ===== Scroll Reveal =====
  const revealTargets = document.querySelectorAll('[data-reveal], [data-stagger]');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    revealTargets.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
      el.classList.add('in');
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
    });
  }));

  // ===== Modals & Viewers =====
  const modalProduct = document.querySelector('#modal-product');
  const modalNews = document.querySelector('#modal-news');

  window.openProductModal = function (id) {
    const p = store.getProductById(id);
    if (!p || !modalProduct) return;

    modalProduct.querySelector('#modal-p-name').textContent = p.name;
    modalProduct.querySelector('#modal-p-tag').textContent = p.tag || 'Tiêu chuẩn';
    modalProduct.querySelector('#modal-p-desc').textContent = p.desc;
    modalProduct.querySelector('#modal-p-img').src = p.image;
    modalProduct.querySelector('#modal-p-img').alt = p.name;

    modalProduct.querySelector('#modal-p-active').textContent = p.details?.activeIngredient || 'Theo tiêu chuẩn dược điển';
    modalProduct.querySelector('#modal-p-coa').textContent = p.details?.coaStandard || 'ISO 9001 / GMP';
    modalProduct.querySelector('#modal-p-form').textContent = p.details?.formulation || 'Chiết xuất tiêu chuẩn';
    modalProduct.querySelector('#modal-p-origin').textContent = p.details?.origin || 'Việt Nam';

    const reqBtn = modalProduct.querySelector('#modal-p-request-btn');
    if (reqBtn) {
      reqBtn.onclick = () => {
        closeModals();
        const contactSelect = document.querySelector('#contact-product');
        if (contactSelect) contactSelect.value = p.name;
        document.querySelector('#lien-he')?.scrollIntoView({ behavior: 'smooth' });
      };
    }

    modalProduct.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  window.openNewsModal = function (id) {
    const n = store.getNewsById(id);
    if (!n || !modalNews) return;

    modalNews.querySelector('#modal-n-title').textContent = n.title;
    modalNews.querySelector('#modal-n-date').textContent = n.date;
    modalNews.querySelector('#modal-n-author').textContent = n.author || 'PUCECO R&D';
    modalNews.querySelector('#modal-n-img').src = n.image;
    modalNews.querySelector('#modal-n-content').innerHTML = `
      <p style="font-size:1.1rem;font-weight:500;color:var(--color-accent-text);margin-bottom:16px;">${escapeHtml(n.excerpt)}</p>
      <p style="line-height:1.75;color:var(--color-text);">${escapeHtml(n.content || n.excerpt)}</p>
    `;

    modalNews.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModals = function () {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('is-open'));
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', closeModals));
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModals();
    });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  // ===== Contact Form Submission =====
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = contactForm.querySelector('[name="fullName"]')?.value.trim();
      const email = contactForm.querySelector('[name="email"]')?.value.trim();
      const phone = contactForm.querySelector('[name="phone"]')?.value.trim();
      const company = contactForm.querySelector('[name="company"]')?.value.trim();
      const productOfInterest = contactForm.querySelector('[name="productOfInterest"]')?.value;
      const message = contactForm.querySelector('[name="message"]')?.value.trim();

      if (!fullName || !email) {
        showToast('Vui lòng nhập Họ tên và Email liên hệ!', 'error');
        return;
      }

      store.addLead({
        fullName,
        email,
        phone,
        company,
        productOfInterest,
        message
      });

      contactForm.reset();
      showToast('Gửi yêu cầu thành công! Chuyên viên PUCECO sẽ liên hệ trong 24 giờ.', 'success');
    });
  }

  // ===== Toast Notification Helper =====
  window.showToast = function (message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' 
          ? '<path d="M20 6L9 17l-5-5"/>' 
          : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>'}
      </svg>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  };

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
  }

  // ===== Listen for Admin Data Sync =====
  if (store && store.onSync) {
    store.onSync((msg) => {
      console.log('Syncing data change from Admin:', msg);
      renderWebsiteContent();
    });
  }

  // Initial render
  renderWebsiteContent();
});
