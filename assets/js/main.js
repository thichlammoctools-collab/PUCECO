/**
 * PUCECO — Client Website Interactive Controller
 * Tích hợp dữ liệu động từ data-store.js, Live Search, Modal & Real Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.PUCECO_STORE;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper gán text an toàn
  function setElemText(selector, text) {
    if (text === undefined || text === null) return;
    document.querySelectorAll(selector).forEach(el => el.textContent = text);
  }

  // Helper gán html (hỗ trợ <br>) an toàn
  function setElemHtml(selector, html) {
    if (html === undefined || html === null) return;
    document.querySelectorAll(selector).forEach(el => {
      // Hỗ trợ xuống dòng thành <br>
      const formatted = escapeHtml(html).replace(/\r?\n/g, '<br>').replace(/&lt;br\s*\/?&gt;/gi, '<br>');
      el.innerHTML = formatted;
    });
  }

  // Helper: Luôn chuẩn hóa ảnh tin tức sang ảnh thực tế JPG chất lượng cao, không dùng icon vector SVG
  function getNewsDisplayImage(imgUrl) {
    if (!imgUrl) return 'assets/images/news-gmp.jpg';
    if (typeof imgUrl === 'string') {
      if (imgUrl.includes('news-gmp.svg') || imgUrl.endsWith('news-gmp.svg')) {
        return 'assets/images/news-gmp.jpg';
      }
      if (imgUrl.includes('news-farm.svg') || imgUrl.endsWith('news-farm.svg')) {
        return 'assets/images/news-farm.jpg';
      }
      if (imgUrl.includes('news-lab.svg') || imgUrl.endsWith('news-lab.svg')) {
        return 'assets/images/news-lab.jpg';
      }
      if (imgUrl.endsWith('.svg')) {
        return imgUrl.replace(/\.svg$/, '.jpg');
      }
    }
    return imgUrl;
  }

  // ===== Render Dynamic Data from DataStore =====
  function renderWebsiteContent() {
    if (!store) return;
    const settings = store.getSettings();
    const products = store.getProducts();
    const news = store.getNews();
    const sections = store.getSections ? store.getSections() : {};

    // 0. Render Menu Điều Hướng (Navigation Bar)
    const menuEl = document.querySelector('#site-nav') || document.querySelector('.site-nav');
    if (menuEl && store.getMenu) {
      const menuItems = store.getMenu().filter(m => m.enabled !== false);
      if (menuItems.length > 0) {
        menuEl.innerHTML = menuItems.map(m => `
          <a href="${escapeHtml(m.url)}" target="${m.target || '_self'}">${escapeHtml(m.label)}</a>
        `).join('');
      }
    }

    // 0.5. Render Header CTA Button
    if (store.getHeaderCta) {
      const cta = store.getHeaderCta();
      const ctaEl = document.querySelector('[data-bind="header-cta"]') || document.querySelector('.head-cta');
      if (ctaEl) {
        if (cta.enabled !== false) {
          ctaEl.style.display = '';
          ctaEl.textContent = cta.text || 'Nhận mẫu thử';
          ctaEl.href = cta.url || '#lien-he';
        } else {
          ctaEl.style.display = 'none';
        }
      }
    }

    // 1. Render Settings (Hotline, Email, Address, Slogan)
    setElemText('[data-bind="hotline"]', settings.hotline);
    setElemText('[data-bind="email"]', settings.email);
    setElemText('[data-bind="address"]', settings.address);
    setElemText('[data-bind="slogan"]', settings.slogan);

    // 1.2. Render Sections (Tiêu đề, Nhãn phụ, Mô tả & Nút từng đề mục)
    // Intro Section
    const intro = sections.intro || {};
    setElemText('[data-bind="intro-eyebrow"]', intro.eyebrow);
    setElemHtml('[data-bind="intro-title"]', intro.title);
    setElemText('[data-bind="intro-lead"]', intro.lead);
    const introBtn1 = document.querySelector('[data-bind="intro-btn1"]');
    if (introBtn1) {
      introBtn1.textContent = intro.btn1Text || 'Tìm Hiểu Sản Phẩm';
      introBtn1.href = intro.btn1Url || '#noi-bat';
    }
    const introBtn2 = document.querySelector('[data-bind="intro-btn2"]');
    if (introBtn2) {
      introBtn2.textContent = intro.btn2Text || 'Xem Công Thức Mẫu';
      introBtn2.href = intro.btn2Url || '#cong-thuc-mau';
    }

    // Stats
    const statYears = document.querySelector('[data-stat="years"]');
    if (statYears) statYears.dataset.count = intro.statYears !== undefined ? intro.statYears : (settings.stats?.years || 30);
    setElemText('[data-bind="stat-years-label"]', intro.statYearsLabel);

    const statPartners = document.querySelector('[data-stat="partners"]');
    if (statPartners) statPartners.dataset.count = intro.statPartners !== undefined ? intro.statPartners : (settings.stats?.partners || 20);
    setElemText('[data-bind="stat-partners-label"]', intro.statPartnersLabel);

    const statLines = document.querySelector('[data-stat="lines"]');
    if (statLines) statLines.dataset.count = intro.statLines !== undefined ? intro.statLines : (settings.stats?.lines || 8);
    setElemText('[data-bind="stat-lines-label"]', intro.statLinesLabel);

    const statTrace = document.querySelector('[data-stat="traceability"]');
    if (statTrace) statTrace.dataset.count = intro.statTrace !== undefined ? intro.statTrace : (settings.stats?.traceability || 100);
    setElemText('[data-bind="stat-trace-label"]', intro.statTraceLabel);

    // 3 Trụ cột giá trị
    if (Array.isArray(intro.values)) {
      intro.values.forEach((v, idx) => {
        setElemText(`[data-bind="value-${idx + 1}-title"]`, v.title);
        setElemText(`[data-bind="value-${idx + 1}-desc"]`, v.desc);
      });
    }

    // Certs Section
    const certsSec = sections.certs || {};
    setElemText('[data-bind="cert-eyebrow"]', certsSec.eyebrow || settings.certEyebrow || 'Cam kết chất lượng');
    setElemText('[data-bind="cert-title"]', certsSec.title || settings.certTitle || 'Chứng nhận & tiêu chuẩn');

    // Featured Products Section
    const featSec = sections.featuredProducts || {};
    setElemText('[data-bind="featured-eyebrow"]', featSec.eyebrow);
    setElemText('[data-bind="featured-title"]', featSec.title);
    setElemText('[data-bind="featured-sub"]', featSec.sub);

    // New Products Section
    const newSec = sections.newProducts || {};
    setElemText('[data-bind="new-eyebrow"]', newSec.eyebrow);
    setElemText('[data-bind="new-title"]', newSec.title);
    setElemText('[data-bind="new-sub"]', newSec.sub);

    // Formulations Section
    const formSec = sections.formulations || {};
    setElemText('[data-bind="formulations-eyebrow"]', formSec.eyebrow);
    setElemText('[data-bind="formulations-title"]', formSec.title);
    setElemText('[data-bind="formulations-sub"]', formSec.sub);

    // News Section
    const newsSec = sections.news || {};
    setElemText('[data-bind="news-eyebrow"]', newsSec.eyebrow);
    setElemText('[data-bind="news-title"]', newsSec.title);
    setElemText('[data-bind="news-sub"]', newsSec.sub);

    // Contact Section
    const contactSec = sections.contact || {};
    setElemText('[data-bind="contact-title"]', contactSec.title);
    setElemText('[data-bind="contact-desc"]', contactSec.desc);
    setElemText('[data-bind="contact-btn"]', contactSec.formBtnText);

    // Footer Section
    const footerSec = sections.footer || {};
    setElemText('[data-bind="footer-slogan"]', footerSec.slogan || settings.slogan);
    setElemText('[data-bind="footer-col1-title"]', footerSec.col1Title);
    setElemText('[data-bind="footer-col2-title"]', footerSec.col2Title);
    setElemText('[data-bind="footer-col3-title"]', footerSec.col3Title);
    setElemText('[data-bind="footer-copy"]', footerSec.copyright);

    // 1.5. Render Certifications
    const certsRow = document.querySelector('#certs-row');
    if (certsRow && store.getCertifications) {
      const certs = store.getCertifications().filter(c => c.enabled !== false);
      if (certs.length > 0) {
        certsRow.innerHTML = certs.map(c => `
          <div class="cert-badge" data-cert-id="${c.id}" ${c.desc ? `title="${escapeHtml(c.desc)}"` : ''}>
            <b>${escapeHtml(c.code)}</b>
            <span>${escapeHtml(c.title)}</span>
          </div>
        `).join('');
      }
    }

    // 1.8. Render Hero Slider dynamically
    initHeroSlider();

    // Dynamic href attributes for direct click-to-call, email, and Google Maps
    document.querySelectorAll('[data-bind="hotline-link"]').forEach(el => {
      const cleanPhone = (settings.hotline || '').replace(/[^0-9+]/g, '');
      el.href = `tel:${cleanPhone}`;
    });
    document.querySelectorAll('[data-bind="email-link"]').forEach(el => {
      el.href = `mailto:${settings.email || ''}`;
    });
    document.querySelectorAll('[data-bind="address-link"]').forEach(el => {
      if (settings.mapsUrl) {
        el.href = settings.mapsUrl;
      }
    });
    document.querySelectorAll('[data-bind="zalo-link"]').forEach(el => {
      const zaloPhone = (settings.zalo || settings.hotline || '0827227259').replace(/[^0-9]/g, '');
      el.href = `https://zalo.me/${zaloPhone}`;
    });
    document.querySelectorAll('[data-bind="facebook-link"]').forEach(el => {
      if (settings.facebookUrl) {
        el.href = settings.facebookUrl;
      }
    });

    // 2. Render Featured Products
    const featuredGrid = document.querySelector('#featured-products-grid');
    if (featuredGrid) {
      const featured = products.filter(p => p.isFeatured !== false);
      featuredGrid.innerHTML = featured.map(p => `
        <article class="product-card" data-product-id="${p.id}" onclick="openProductModal('${p.id}')">
          <div class="product-thumb" style="--c1:${p.bg1 || '#E6F1EA'};--c2:${p.bg2 || '#C9E3D3'}">
            <img class="product-art" src="${p.image}" alt="${p.name}" loading="lazy">
            <span class="product-tag ${p.tag === 'Organic' ? 'alt' : ''}">${p.tag || 'Bán chạy'}</span>
          </div>
          <div class="product-body">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <button type="button" class="link-arrow" onclick="event.stopPropagation(); openProductModal('${p.id}')">
              Chi tiết <span aria-hidden="true">→</span>
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
        <article class="product-card wide" data-product-id="${p.id}" onclick="openProductModal('${p.id}')">
          <div class="product-thumb tall" style="--c1:${p.bg1 || '#F3EFE2'};--c2:${p.bg2 || '#E0CFA6'}">
            <img class="product-art" src="${p.image}" alt="${p.name}" loading="lazy">
            <span class="product-tag">${p.tag || 'Mới'}</span>
          </div>
          <div class="product-body">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <button type="button" class="link-arrow" onclick="event.stopPropagation(); openProductModal('${p.id}')">
              Yêu cầu mẫu thử <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      `).join('');
    }

    // 3.5. Render Formulations (Công thức mẫu)
    const formGrid = document.querySelector('#formulations-grid');
    if (formGrid && store.getFormulations) {
      const forms = store.getFormulations();
      formGrid.innerHTML = forms.map(f => `
        <article class="formulation-card" data-formulation-id="${f.id}" onclick="openFormulationModal('${f.id}')">
          <div class="formulation-thumb">
            <img src="${f.image}" alt="${f.name}" loading="lazy">
            <span class="formulation-tag">${f.badge || 'Công thức mẫu'}</span>
          </div>
          <div class="formulation-body">
            <h3>${f.name}</h3>
            <p>${f.desc}</p>
            <div class="formulation-meta">
              <div><b>Dạng bào chế:</b> ${f.dosageForm || '—'}</div>
              <div><b>Hoạt chất PUCECO:</b> ${f.mainIngredient || '—'}</div>
            </div>
            <div class="formulation-actions">
              <button type="button" class="link-arrow" onclick="event.stopPropagation(); openFormulationModal('${f.id}')">
                Chi tiết <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </article>
      `).join('');
    }

    // 4. Render News
    const newsGrid = document.querySelector('#news-grid');
    if (newsGrid) {
      newsGrid.innerHTML = news.map(n => {
        const cardImg = getNewsDisplayImage(n.image);
        return `
        <article class="news-card" data-news-id="${n.id}" onclick="openNewsModal('${n.id}')">
          <div class="news-thumb" style="--c1:${n.bg1 || '#E6F1EA'};--c2:${n.bg2 || '#C9E3D3'}">
            <img class="news-art" src="${escapeHtml(cardImg)}" alt="${escapeHtml(n.title)}" loading="lazy">
          </div>
          <div class="news-body">
            <p class="news-date">${escapeHtml(n.date)}</p>
            <h3>${escapeHtml(n.title)}</h3>
            <p>${escapeHtml(n.excerpt)}</p>
            <button type="button" class="link-arrow" onclick="event.stopPropagation(); openNewsModal('${n.id}')">
              Đọc tiếp <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      `;
      }).join('');
    }

    // 5. Update Contact Form Product Options
    const prodSelect = document.querySelector('#contact-product');
    if (prodSelect) {
      const currentValue = prodSelect.value;
      prodSelect.innerHTML = '<option value="">-- Chọn sản phẩm / công thức quan tâm --</option>' +
        products.map(p => `<option value="${p.name}">${p.name} (${p.tag || 'Chuẩn'})</option>`).join('') +
        (store.getFormulations ? store.getFormulations().map(f => `<option value="Công thức: ${f.name}">[Công thức] ${f.name}</option>`).join('') : '') +
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

  // ===== Mobile Bottom Navigation: Active Section Tracking =====
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-nav-section]');
  const sectionMap = {
    'top': document.querySelector('#top'),
    'gioi-thieu': document.querySelector('#gioi-thieu'),
    'noi-bat': document.querySelector('#noi-bat'),
    'cong-thuc-mau': document.querySelector('#cong-thuc-mau'),
    'tin-tuc': document.querySelector('#tin-tuc'),
    'lien-he': document.querySelector('#lien-he'),
  };

  function setActiveNav(sectionId) {
    bottomNavItems.forEach(item => {
      item.classList.toggle('is-active', item.dataset.navSection === sectionId);
    });
  }

  // Use IntersectionObserver to detect which section is visible
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    Object.values(sectionMap).forEach(el => { if (el) navObserver.observe(el); });
  }

  // Set initial active state
  setActiveNav('top');


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

  // Wire mobile bottom search button
  const bottomSearchBtn = document.querySelector('[data-bottom-search]');
  if (bottomSearchBtn) {
    bottomSearchBtn.addEventListener('click', () => {
      openSearch(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

    const formulations = store.getFormulations ? store.getFormulations() : [];
    const matchedForms = formulations.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.desc.toLowerCase().includes(q) ||
      (f.mainIngredient && f.mainIngredient.toLowerCase().includes(q))
    );

    const newsSectionExists = !!document.querySelector('#news-grid');
    const matchedNews = newsSectionExists ? news.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q)
    ) : [];

    if (matchedProducts.length === 0 && matchedForms.length === 0 && matchedNews.length === 0) {
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

    if (matchedForms.length > 0) {
      html += `<div style="font-size:0.8rem;font-weight:700;color:var(--color-accent-strong);margin:14px 12px 8px;text-transform:uppercase;letter-spacing:0.05em">Công thức mẫu (${matchedForms.length})</div>`;
      matchedForms.forEach(f => {
        html += `
          <div class="search-item" onclick="openFormulationModal('${f.id}'); closeSearch();">
            <img class="search-thumb" src="${f.image}" alt="">
            <div class="search-info">
              <h5>${escapeHtml(f.name)}</h5>
              <p>${escapeHtml(f.desc.substring(0, 75))}...</p>
            </div>
            <span class="search-badge">${f.badge || 'Công thức'}</span>
          </div>
        `;
      });
    }

    if (matchedNews.length > 0) {
      html += `<div style="font-size:0.8rem;font-weight:700;color:var(--color-accent-2-ink);margin:14px 12px 8px;text-transform:uppercase;letter-spacing:0.05em">Tin tức & Nghiên cứu (${matchedNews.length})</div>`;
      matchedNews.forEach(n => {
        html += `
          <div class="search-item" onclick="openNewsModal('${n.id}'); closeSearch();">
            <img class="search-thumb" src="${escapeHtml(getNewsDisplayImage(n.image))}" alt="">
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

  // ===== Hero Slider Dynamic Controller =====
  let heroCurrentIndex = 0;
  function initHeroSlider() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;

    const track = hero.querySelector('[data-hero-track]');
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    const prevBtn = hero.querySelector('[data-hero-prev]');
    const nextBtn = hero.querySelector('[data-hero-next]');

    if (store && store.getSlides && track) {
      const slidesData = store.getSlides();
      const activeSlides = slidesData.filter(s => s.enabled !== false);
      if (activeSlides.length > 0) {
        track.innerHTML = activeSlides.map((s, idx) => {
          let titleFormatted = escapeHtml(s.title || '').replace(/\r?\n/g, '<br>');
          titleFormatted = titleFormatted.replace(/&lt;br\s*\/?&gt;/gi, '<br>');

          const g1 = s.g1 || '#18181B';
          const g2 = s.g2 || (idx === 0 ? '#B72622' : idx === 1 ? '#991B1B' : '#D4322D');
          const bgImg = s.bgImage || (idx === 0 ? 'assets/images/hero-bg-1.jpg' : idx === 1 ? 'assets/images/hero-bg-2.jpg' : 'assets/images/hero-bg-3.jpg');
          const artImg = s.artImage || (idx === 0 ? 'assets/images/hero-botanical-1.svg' : idx === 1 ? 'assets/images/hero-botanical-2.svg' : 'assets/images/hero-botanical-3.svg');
          const badgeTop = s.badgeTop || (idx === 0 ? 'GMP' : idx === 1 ? '100%' : 'R&D');
          const badgeBottom = s.badgeBottom || (idx === 0 ? 'đạt chuẩn' : idx === 1 ? 'thiên nhiên' : 'nội bộ');
          const btn1Text = s.btn1Text || 'Khám phá sản phẩm';
          const btn1Link = s.btn1Link || '#noi-bat';
          const btn2Text = s.btn2Text || 'Về chúng tôi';
          const btn2Link = s.btn2Link || '#gioi-thieu';

          return `
            <article class="hero-slide ${idx === heroCurrentIndex ? 'is-active' : ''}" data-slide aria-roledescription="slide" aria-label="${idx + 1} trên ${activeSlides.length}">
              <div class="hero-bg" style="--g1:${g1};--g2:${g2}"><img src="${escapeHtml(bgImg)}" alt="" loading="${idx === 0 ? 'eager' : 'lazy'}"></div>
              <div class="hero-grid">
                <div class="hero-copy">
                  ${badgeTop ? `<div class="hero-mobile-badge"><span class="badge-pill"><b>${escapeHtml(badgeTop)}</b> ${escapeHtml(badgeBottom)}</span></div>` : ''}
                  ${s.eyebrow ? `<p class="eyebrow light">${escapeHtml(s.eyebrow)}</p>` : ''}
                  <h1 class="hero-title">${titleFormatted}</h1>
                  ${s.lede ? `<p class="hero-lede">${escapeHtml(s.lede)}</p>` : ''}
                  <div class="hero-actions">
                    ${btn1Text ? `<a class="btn primary lg" href="${escapeHtml(btn1Link)}">${escapeHtml(btn1Text)}</a>` : ''}
                    ${btn2Text ? `<a class="btn ghost lg light" href="${escapeHtml(btn2Link)}">${escapeHtml(btn2Text)}</a>` : ''}
                  </div>
                </div>
                <div class="hero-visual" aria-hidden="true">
                  ${artImg ? `<img class="hero-art" src="${escapeHtml(artImg)}" alt="" width="240" height="240">` : ''}
                  <span class="hero-badge"><b>${escapeHtml(badgeTop)}</b><span>${escapeHtml(badgeBottom)}</span></span>
                </div>
              </div>
            </article>
          `;
        }).join('');
      }
    }

    const slides = [...hero.querySelectorAll('[data-slide]')];
    if (slides.length === 0) return;

    if (heroCurrentIndex >= slides.length) heroCurrentIndex = 0;

    // Reset previous autoplay timer if reinitializing
    if (hero._autoplayTimer) {
      clearInterval(hero._autoplayTimer);
      hero._autoplayTimer = null;
    }

    const startAutoplay = () => {
      stopAutoplay();
      if (slides.length > 1) {
        hero._autoplayTimer = setInterval(() => {
          go(heroCurrentIndex + 1);
        }, 5500);
      }
    };

    const stopAutoplay = () => {
      if (hero._autoplayTimer) {
        clearInterval(hero._autoplayTimer);
        hero._autoplayTimer = null;
      }
    };

    const go = (i) => {
      heroCurrentIndex = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === heroCurrentIndex));
      dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === heroCurrentIndex)));
      startAutoplay();
    };

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Đến slide ${i + 1}`);
        dot.addEventListener('click', () => go(i));
        dotsWrap.appendChild(dot);
      });
    }

    const dots = [...dotsWrap?.children || []];

    if (prevBtn && !prevBtn._hasHeroListener) {
      prevBtn.addEventListener('click', () => go(heroCurrentIndex - 1));
      prevBtn._hasHeroListener = true;
    }
    if (nextBtn && !nextBtn._hasHeroListener) {
      nextBtn.addEventListener('click', () => go(heroCurrentIndex + 1));
      nextBtn._hasHeroListener = true;
    }

    // Touch Swipe Gesture for Mobile
    if (track && !track._hasHeroTouchListeners) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      track.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
          stopAutoplay();
        }
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;
          const elapsed = Date.now() - touchStartTime;

          // Dominant horizontal swipe with >35px threshold
          if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.1 && elapsed < 800) {
            if (diffX < 0) {
              go(heroCurrentIndex + 1);
            } else {
              go(heroCurrentIndex - 1);
            }
          }
        }
        startAutoplay();
      }, { passive: true });

      track._hasHeroTouchListeners = true;
    }

    // Pause autoplay on mouse hover (desktop)
    if (!hero._hasHeroHoverListeners) {
      hero.addEventListener('mouseenter', stopAutoplay);
      hero.addEventListener('mouseleave', startAutoplay);
      hero._hasHeroHoverListeners = true;
    }

    go(heroCurrentIndex);
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
  const modalLightbox = document.querySelector('#modal-lightbox');
  const lightboxImg = document.querySelector('#lightbox-img');
  const lightboxCaption = document.querySelector('#lightbox-caption');

  window.openLightbox = function (src, caption) {
    if (!modalLightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Ảnh sản phẩm phóng to';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    modalLightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function () {
    if (modalLightbox) {
      modalLightbox.classList.remove('is-open');
      if (!modalProduct?.classList.contains('is-open') && !modalNews?.classList.contains('is-open')) {
        document.body.style.overflow = '';
      }
    }
  };

  const pHero = document.querySelector('#modal-p-hero');
  const pZoomBtn = document.querySelector('#modal-p-zoom-btn');
  const pImg = document.querySelector('#modal-p-img');

  if (pHero && pImg) {
    pHero.addEventListener('click', (e) => {
      if (e.target.closest('#modal-p-zoom-btn')) return; // handled by button
      if (pImg.src) {
        openLightbox(pImg.src, modalProduct?.querySelector('#modal-p-name')?.textContent);
      }
    });
  }
  if (pZoomBtn && pImg) {
    pZoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pImg.src) {
        openLightbox(pImg.src, modalProduct?.querySelector('#modal-p-name')?.textContent);
      }
    });
  }

  const lightboxCloseBtn = document.querySelector('#lightbox-close-btn');
  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // Zoom và xem ảnh phóng to cho bài viết tin tức
  const nHero = document.querySelector('#modal-n-hero');
  const nZoomBtn = document.querySelector('#modal-n-zoom-btn');
  const nImg = document.querySelector('#modal-n-img');

  if (nHero && nImg) {
    nHero.addEventListener('click', (e) => {
      if (e.target.closest('#modal-n-zoom-btn')) return;
      if (nImg.src) {
        openLightbox(nImg.src, modalNews?.querySelector('#modal-n-title')?.textContent);
      }
    });
  }
  if (nZoomBtn && nImg) {
    nZoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nImg.src) {
        openLightbox(nImg.src, modalNews?.querySelector('#modal-n-title')?.textContent);
      }
    });
  }

  window.openProductModal = function (id) {
    const p = store.getProductById(id);
    if (!p || !modalProduct) return;

    const images = (Array.isArray(p.images) && p.images.length > 0) ? p.images : (p.image ? [p.image] : []);
    const primaryImg = images[0] || p.image || '';

    modalProduct.querySelector('#modal-p-name').textContent = p.name;
    modalProduct.querySelector('#modal-p-tag').textContent = p.tag || 'Tiêu chuẩn';
    modalProduct.querySelector('#modal-p-desc').textContent = p.desc;
    
    const mainImgEl = modalProduct.querySelector('#modal-p-img');
    if (mainImgEl) {
      mainImgEl.src = primaryImg;
      mainImgEl.alt = p.name;
    }

    // Gallery thumbnails nếu có nhiều hơn 1 hình ảnh
    const galleryEl = modalProduct.querySelector('#modal-p-gallery');
    if (galleryEl) {
      if (images.length > 1) {
        galleryEl.removeAttribute('hidden');
        galleryEl.innerHTML = images.map((imgSrc, idx) => `
          <button type="button" class="modal-gallery-thumb ${idx === 0 ? 'is-active' : ''}" data-index="${idx}" aria-label="Xem ảnh ${idx + 1}">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)} - ảnh ${idx + 1}">
          </button>
        `).join('');

        galleryEl.querySelectorAll('.modal-gallery-thumb').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index, 10);
            galleryEl.querySelectorAll('.modal-gallery-thumb').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            if (mainImgEl && images[idx]) {
              mainImgEl.src = images[idx];
            }
          });
        });
      } else {
        galleryEl.setAttribute('hidden', '');
        galleryEl.innerHTML = '';
      }
    }

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

    // Tiêu đề bài viết
    const titleEl = modalNews.querySelector('#modal-n-title');
    if (titleEl) titleEl.textContent = n.title;

    // Ngày xuất bản
    const dateEl = modalNews.querySelector('#modal-n-date');
    if (dateEl) dateEl.textContent = n.date || '';

    // Tác giả / Phòng ban
    const authorEl = modalNews.querySelector('#modal-n-author');
    if (authorEl) authorEl.textContent = n.author || 'PUCECO R&D';

    // Tính thời gian đọc ước tính
    const readTimeEl = modalNews.querySelector('#modal-n-reading-time');
    if (readTimeEl) {
      const fullText = `${n.title || ''} ${n.excerpt || ''} ${n.content || ''}`;
      const words = fullText.trim().split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.ceil(words / 120));
      readTimeEl.textContent = `${minutes} phút đọc`;
    }

    // Huy hiệu chủ đề / danh mục
    const badgeEl = modalNews.querySelector('#modal-n-badge');
    if (badgeEl) {
      let badge = 'Tin tức & Sự kiện';
      const textForTag = `${n.title || ''} ${n.author || ''}`.toLowerCase();
      if (textForTag.includes('vùng trồng') || textForTag.includes('nông nghiệp') || textForTag.includes('tây nguyên') || textForTag.includes('vật liệu')) {
        badge = 'Vùng Trồng Dược Liệu';
      } else if (textForTag.includes('gmp') || textForTag.includes('tiêu chuẩn') || textForTag.includes('kiểm soát') || textForTag.includes('chất lượng')) {
        badge = 'Chuẩn Hóa GMP & ISO';
      } else if (textForTag.includes('nano') || textForTag.includes('curcumin') || textForTag.includes('r&d') || textForTag.includes('viện') || textForTag.includes('nghiên cứu')) {
        badge = 'R&D & Đột Phá Khoa Học';
      }
      badgeEl.textContent = n.tag || badge;
    }

    // Màu nền gradient và Hình ảnh Cover Hero (luôn là ảnh JPG thực tế)
    const heroBg = modalNews.querySelector('#modal-n-hero-bg');
    if (heroBg) {
      heroBg.style.setProperty('--c1', n.bg1 || '#E6F1EA');
      heroBg.style.setProperty('--c2', n.bg2 || '#C9E3D3');
    }
    const heroImg = modalNews.querySelector('#modal-n-img');
    if (heroImg) {
      const realHeroImg = getNewsDisplayImage(n.image);
      heroImg.src = realHeroImg;
      heroImg.alt = n.title;
    }

    // Đoạn dẫn nhập (Sapo / Excerpt)
    const leadBox = modalNews.querySelector('#modal-n-lead-box');
    const excerptEl = modalNews.querySelector('#modal-n-excerpt');
    if (n.excerpt && n.excerpt.trim()) {
      if (leadBox) leadBox.style.display = 'flex';
      if (excerptEl) excerptEl.textContent = n.excerpt;
    } else if (leadBox) {
      leadBox.style.display = 'none';
    }

    // Nội dung bài viết (hỗ trợ định dạng đoạn văn, tiêu đề phụ, ảnh minh họa & thư viện ảnh)
    const contentEl = modalNews.querySelector('#modal-n-content');
    if (contentEl) {
      const bodyText = n.content || n.excerpt || '';
      const paragraphs = bodyText.split(/\r?\n\s*\r?\n|\r?\n/).map(p => p.trim()).filter(Boolean);
      
      const renderedHtml = [];
      const inlineImagesFound = [];

      const isSameAsHeroCover = (imgSrc) => {
        if (!imgSrc || !n.image) return false;
        const clean = s => (s || '').replace(/^\.?\//, '').trim().toLowerCase();
        const heroSrc = getNewsDisplayImage(n.image);
        const s = clean(imgSrc);
        return s === clean(n.image) || s === clean(heroSrc) || s.endsWith(clean(n.image)) || clean(n.image).endsWith(s);
      };

      paragraphs.forEach(rawP => {
        // Kiểm tra xem đoạn có phải là hình ảnh Markdown: ![Chú thích](duong-dan-anh)
        const mdImgMatch = rawP.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        // Kiểm tra cú pháp ảnh dạng [image: duong-dan-anh | Chú thích]
        const customImgMatch = rawP.match(/^\[image:\s*([^\s|]+)(?:\s*\|\s*([^\]]+))?\]$/i);

        if (mdImgMatch) {
          const caption = (mdImgMatch[1] || '').trim();
          const imgSrc = (mdImgMatch[2] || '').trim();

          // Tránh lặp lại ảnh cover hero ở đầu bài viết
          if (isSameAsHeroCover(imgSrc)) return;

          inlineImagesFound.push(imgSrc);
          renderedHtml.push(`
            <figure class="news-content-figure" data-zoom-src="${escapeHtml(imgSrc)}" data-caption="${escapeHtml(caption)}">
              <div class="news-figure-img-wrap">
                <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(caption || n.title)}" loading="lazy">
                <div class="news-figure-zoom-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                  <span>Xem ảnh lớn</span>
                </div>
              </div>
              ${caption ? `
                <figcaption>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span>${escapeHtml(caption)}</span>
                </figcaption>
              ` : ''}
            </figure>
          `);
        } else if (customImgMatch) {
          const imgSrc = (customImgMatch[1] || '').trim();
          const caption = (customImgMatch[2] || '').trim();

          // Tránh lặp lại ảnh cover hero ở đầu bài viết
          if (isSameAsHeroCover(imgSrc)) return;

          inlineImagesFound.push(imgSrc);
          renderedHtml.push(`
            <figure class="news-content-figure" data-zoom-src="${escapeHtml(imgSrc)}" data-caption="${escapeHtml(caption)}">
              <div class="news-figure-img-wrap">
                <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(caption || n.title)}" loading="lazy">
                <div class="news-figure-zoom-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                  <span>Xem ảnh lớn</span>
                </div>
              </div>
              ${caption ? `
                <figcaption>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span>${escapeHtml(caption)}</span>
                </figcaption>
              ` : ''}
            </figure>
          `);
        } else if (rawP.startsWith('### ') || rawP.startsWith('## ')) {
          const headingText = rawP.replace(/^#{2,3}\s+/, '');
          renderedHtml.push(`<h3 class="news-modal-h3">${escapeHtml(headingText)}</h3>`);
        } else {
          // Định dạng chữ đậm **text**
          let formattedP = escapeHtml(rawP);
          formattedP = formattedP.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
          renderedHtml.push(`<p class="news-modal-p">${formattedP}</p>`);
        }
      });

      // Nếu bài viết có mảng ảnh `images` bổ sung mà chưa hiển thị ở inline markdown
      if (Array.isArray(n.images) && n.images.length > 0) {
        const extraImages = n.images.filter(img => img && !inlineImagesFound.includes(img) && !isSameAsHeroCover(img));
        if (extraImages.length > 0) {
          renderedHtml.push(`
            <div class="news-modal-gallery">
              <h4 class="news-gallery-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Hình ảnh thực tế từ dự án &amp; quy trình
              </h4>
              <div class="news-gallery-grid">
                ${extraImages.map((extraImg, idx) => `
                  <div class="news-gallery-item" data-zoom-src="${escapeHtml(extraImg)}" data-caption="${escapeHtml(n.title)} - Ảnh ${idx + 1}" title="Nhấn để phóng to ảnh">
                    <img src="${escapeHtml(extraImg)}" alt="${escapeHtml(n.title)}" loading="lazy">
                    <div class="news-gallery-caption">Xem ảnh lớn</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `);
        }
      }

      // Nếu bài viết chưa có bất kỳ ảnh minh họa nào trong nội dung và có ảnh phụ khác ảnh cover
      if (inlineImagesFound.length === 0) {
        const secondPhoto = (n.id === 'news-1') ? 'assets/images/news-lab.jpg' :
                            (n.id === 'news-2') ? 'assets/images/prod-lemongrass.jpg' :
                            (n.id === 'news-3') ? 'assets/images/prod-curcumin.jpg' : null;

        if (secondPhoto && !isSameAsHeroCover(secondPhoto)) {
          const figure2 = `
            <figure class="news-content-figure" data-zoom-src="${escapeHtml(secondPhoto)}" data-caption="Hệ thống kiểm nghiệm &amp; phân tích hoạt chất">
              <div class="news-figure-img-wrap">
                <img src="${escapeHtml(secondPhoto)}" alt="Hệ thống kiểm nghiệm" loading="lazy">
                <div class="news-figure-zoom-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                  <span>Xem ảnh lớn</span>
                </div>
              </div>
              <figcaption>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>Hệ thống phân tích kiểm nghiệm &amp; quản lý chất lượng đạt chuẩn PUCECO</span>
              </figcaption>
            </figure>
          `;
          if (renderedHtml.length > 2) {
            renderedHtml.splice(2, 0, figure2);
          } else {
            renderedHtml.push(figure2);
          }
        }
      }

      contentEl.innerHTML = renderedHtml.join('');

      // Đăng ký sự kiện Click mở Lightbox phóng to cho các hình ảnh trong nội dung bài viết
      contentEl.querySelectorAll('.news-content-figure, .news-gallery-item').forEach(fig => {
        fig.addEventListener('click', (e) => {
          e.stopPropagation();
          const src = fig.getAttribute('data-zoom-src') || fig.querySelector('img')?.src;
          const caption = fig.getAttribute('data-caption') || fig.querySelector('img')?.alt || n.title;
          if (src) {
            openLightbox(src, caption);
          }
        });
      });
    }

    // Nút chia sẻ bài viết
    const shareBtn = modalNews.querySelector('#modal-n-share-btn');
    if (shareBtn) {
      shareBtn.onclick = () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}#news-${n.id || ''}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Đã sao chép liên kết bài viết!', 'success');
          }).catch(() => {
            showToast('Đã sao chép liên kết!', 'success');
          });
        } else {
          showToast('Đã sao chép liên kết bài viết!', 'success');
        }
      };
    }

    // Nút liên hệ tư vấn hợp tác
    const contactBtn = modalNews.querySelector('#modal-n-contact-btn');
    if (contactBtn) {
      contactBtn.onclick = () => {
        closeModals();
        const contactSelect = document.querySelector('#contact-product');
        const msgTextarea = document.querySelector('#contact-form textarea[name="message"]');
        if (contactSelect) contactSelect.value = 'Yêu cầu tư vấn khác';
        if (msgTextarea && n.title) {
          msgTextarea.value = `Tôi quan tâm đến nội dung bài viết: "${n.title}". Vui lòng liên hệ tư vấn thêm cho tôi.`;
        }
        document.querySelector('#lien-he')?.scrollIntoView({ behavior: 'smooth' });
      };
    }

    modalNews.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const modalFormulation = document.querySelector('#modal-formulation');
  window.openFormulationModal = function (id) {
    if (!store.getFormulationById || !modalFormulation) return;
    const f = store.getFormulationById(id);
    if (!f) return;

    modalFormulation.querySelector('#modal-f-name').textContent = f.name;
    modalFormulation.querySelector('#modal-f-badge').textContent = f.badge || 'Công thức R&D';
    modalFormulation.querySelector('#modal-f-desc').textContent = f.desc;
    modalFormulation.querySelector('#modal-f-dosage').textContent = f.dosageForm || '—';
    modalFormulation.querySelector('#modal-f-main').textContent = f.mainIngredient || '—';

    const fImg = modalFormulation.querySelector('#modal-f-img');
    if (fImg && f.image) {
      fImg.src = f.image;
      fImg.alt = f.name;
    }

    const tbody = modalFormulation.querySelector('#modal-f-table-body');
    if (tbody && Array.isArray(f.ingredients)) {
      tbody.innerHTML = f.ingredients.map(ing => `
        <tr>
          <td><b>${escapeHtml(ing.name)}</b></td>
          <td style="color:var(--color-accent-text);font-weight:600;font-family:var(--font-mono);">${escapeHtml(ing.ratio)}</td>
          <td style="color:var(--color-muted);">${escapeHtml(ing.role)}</td>
        </tr>
      `).join('');
    }

    modalFormulation.querySelector('#modal-f-spec').textContent = f.spec || 'Đạt tiêu chuẩn cảm quan & phân tích kiểm nghiệm PUCECO Lab.';
    modalFormulation.querySelector('#modal-f-directions').textContent = f.directions || 'Liên hệ chuyên viên R&D PUCECO để nhận hướng dẫn chuyển giao công nghệ.';

    const reqBtn = modalFormulation.querySelector('#modal-f-request-btn');
    if (reqBtn) {
      reqBtn.onclick = () => {
        closeModals();
        requestFormulationSample(f.name);
      };
    }

    modalFormulation.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  window.requestFormulationSample = function (formulaName) {
    const contactSelect = document.querySelector('#contact-product');
    const msgTextarea = document.querySelector('#contact-form textarea[name="message"]');
    if (contactSelect) {
      let found = false;
      for (let i = 0; i < contactSelect.options.length; i++) {
        if (contactSelect.options[i].text.includes(formulaName)) {
          contactSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) contactSelect.value = 'Yêu cầu tư vấn khác';
    }
    if (msgTextarea) {
      msgTextarea.value = `Xin gửi tôi bộ tài liệu kỹ thuật & mẫu thử cho công thức: ${formulaName}.`;
    }
    document.querySelector('#lien-he')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.closeModals = function () {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('is-open'));
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-close-modal]').forEach(b => {
    b.addEventListener('click', (e) => {
      if (b.closest('#modal-lightbox')) {
        e.stopPropagation();
        closeLightbox();
      } else {
        closeModals();
      }
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        if (m === modalLightbox) {
          closeLightbox();
        } else {
          closeModals();
        }
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalLightbox?.classList.contains('is-open')) {
        closeLightbox();
      } else {
        closeModals();
      }
    }
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
