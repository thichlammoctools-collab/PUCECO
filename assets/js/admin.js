/**
 * PUCECO — Admin Dashboard Controller
 * Quản lý Sản phẩm, Tin tức, Yêu cầu khách hàng, Cấu hình và Sao lưu dữ liệu
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.PUCECO_STORE;
  if (!store) {
    alert('Lỗi: Không tìm thấy DataStore!');
    return;
  }

  const authWrapper = document.getElementById('auth-wrapper');
  const adminLayout = document.getElementById('admin-layout');
  const loginForm = document.getElementById('login-form');
  const loginPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  // ===== Kiểm tra phiên đăng nhập =====
  function checkAuth() {
    if (store.isAdminLoggedIn()) {
      authWrapper.style.display = 'none';
      adminLayout.style.display = 'grid';
      loadCurrentTab();
    } else {
      authWrapper.style.display = 'flex';
      adminLayout.style.display = 'none';
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = loginPassword.value.trim();
      if (store.verifyAdminPassword(pass)) {
        store.setAdminSession(true);
        loginError.style.display = 'none';
        loginForm.reset();
        checkAuth();
        showAdminToast('Đăng nhập quản trị thành công!', 'success');
      } else {
        loginError.style.display = 'block';
        loginPassword.focus();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang Quản trị?')) {
        store.setAdminSession(false);
        checkAuth();
      }
    });
  }

  // ===== Quản lý Tabs Navigation =====
  let currentTab = 'dashboard';
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(tabId) {
    currentTab = tabId;
    navItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabId));
    tabContents.forEach(content => content.classList.toggle('active', content.id === `tab-${tabId}`));
    loadCurrentTab();
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  function loadCurrentTab() {
    updateBadges();
    switch (currentTab) {
      case 'dashboard': renderDashboard(); break;
      case 'hero': renderHeroSlides(); break;
      case 'products': renderProductsTable(); break;
      case 'formulations': renderFormulationsTable(); break;
      case 'news': renderNewsTable(); break;
      case 'certs': renderCerts(); break;
      case 'leads': renderLeadsTable(); break;
      case 'settings': renderSettings(); break;
    }
  }

  function updateBadges() {
    const leads = store.getLeads();
    const newCount = leads.filter(l => l.status === 'new').length;
    const badge = document.getElementById('badge-new-leads');
    if (badge) {
      badge.textContent = newCount;
      badge.style.display = newCount > 0 ? 'inline-block' : 'none';
    }
  }

  // ===== TAB 1: DASHBOARD =====
  function renderDashboard() {
    const products = store.getProducts();
    const formulations = store.getFormulations ? store.getFormulations() : [];
    const news = store.getNews();
    const leads = store.getLeads();
    const settings = store.getSettings();

    document.getElementById('kpi-products').textContent = products.length;
    const kpiFormEl = document.getElementById('kpi-formulations');
    if (kpiFormEl) kpiFormEl.textContent = formulations.length;
    document.getElementById('kpi-news').textContent = news.length;
    document.getElementById('kpi-leads').textContent = leads.filter(l => l.status === 'new').length;
    document.getElementById('kpi-partners').textContent = settings.stats?.partners || 320;

    // Render 5 recent leads
    const tbody = document.getElementById('recent-leads-tbody');
    if (tbody) {
      const recent = leads.slice(0, 5);
      if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--admin-muted);">Chưa có yêu cầu liên hệ nào.</td></tr>';
      } else {
        tbody.innerHTML = recent.map(l => `
          <tr>
            <td><b>${escapeHtml(l.fullName)}</b><br><small style="color:var(--admin-muted)">${escapeHtml(l.company || 'Cá nhân')}</small></td>
            <td>${escapeHtml(l.phone)}<br><small>${escapeHtml(l.email)}</small></td>
            <td><span class="badge badge-info">${escapeHtml(l.productOfInterest)}</span></td>
            <td>${getStatusBadge(l.status)}</td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="quickViewLead('${l.id}')">Xem</button>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  // ===== TAB 2: PRODUCTS =====
  const searchProductInput = document.getElementById('search-product-input');
  const filterProductCat = document.getElementById('filter-product-cat');
  const searchProductClear = document.getElementById('search-product-clear');

  if (searchProductInput) {
    searchProductInput.addEventListener('input', () => {
      if (searchProductClear) {
        searchProductClear.style.display = searchProductInput.value ? 'block' : 'none';
      }
      renderProductsTable();
    });
  }
  if (searchProductClear) {
    searchProductClear.addEventListener('click', () => {
      if (searchProductInput) {
        searchProductInput.value = '';
        searchProductInput.focus();
      }
      searchProductClear.style.display = 'none';
      renderProductsTable();
    });
  }
  if (filterProductCat) {
    filterProductCat.addEventListener('change', () => renderProductsTable());
  }

  window.resetProductFilters = function () {
    if (searchProductInput) searchProductInput.value = '';
    if (filterProductCat) filterProductCat.value = '';
    if (searchProductClear) searchProductClear.style.display = 'none';
    renderProductsTable();
  };

  function getCategoryBadge(cat) {
    const map = {
      extract: { name: 'Chiết xuất thực vật', cls: 'badge-cat-extract' },
      essential_oil: { name: 'Tinh dầu thiên nhiên', cls: 'badge-cat-oil' },
      nano: { name: 'Hoạt chất Nano', cls: 'badge-cat-nano' },
      sweetener: { name: 'Chất tạo ngọt tự nhiên', cls: 'badge-cat-sweetener' },
      herb: { name: 'Dược liệu thô', cls: 'badge-cat-herb' }
    };
    const c = map[cat] || { name: 'Khác', cls: 'badge-cat-other' };
    return `<span class="badge ${c.cls}">${escapeHtml(c.name)}</span>`;
  }

  function getTagBadge(tag) {
    const t = tag || 'Bán chạy';
    let cls = 'badge-tag-default';
    if (t === 'Bán chạy') cls = 'badge-tag-hot';
    else if (t === 'Organic' || t === 'Hữu cơ') cls = 'badge-tag-organic';
    else if (t === 'Công nghệ cao') cls = 'badge-tag-tech';
    else if (t === 'Mới' || t === 'Mới ra mắt') cls = 'badge-tag-new';
    else if (t === 'Dược dụng' || t === 'Chuẩn Dược dụng') cls = 'badge-tag-medical';
    return `<span class="badge ${cls}">${escapeHtml(t)}</span>`;
  }

  function renderProductsTable() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    const allProducts = store.getProducts();
    let products = allProducts;
    const q = searchProductInput?.value.trim().toLowerCase() || '';
    const cat = filterProductCat?.value || '';

    if (q) {
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q)) || (p.details?.activeIngredient && p.details.activeIngredient.toLowerCase().includes(q)));
    }
    if (cat) {
      products = products.filter(p => p.category === cat);
    }

    // Update count chip
    const countChip = document.getElementById('product-count-chip');
    if (countChip) {
      if (q || cat) {
        countChip.textContent = `Hiển thị ${products.length} / ${allProducts.length} sản phẩm`;
      } else {
        countChip.textContent = `${allProducts.length} sản phẩm`;
      }
    }

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="product-empty-state">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <div class="product-empty-title">Không tìm thấy sản phẩm nào phù hợp</div>
              <div class="product-empty-sub">Hãy thử tìm với từ khóa khác hoặc điều chỉnh bộ lọc danh mục.</div>
              ${(q || cat) ? `<button type="button" class="btn btn-outline btn-sm" onclick="resetProductFilters()" style="margin-top:10px;">Xóa bộ lọc</button>` : ''}
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map((p, index) => {
      const displayImg = p.image || (p.images && p.images[0]) || 'assets/images/prod-green-tea.jpg';
      const allImgs = (Array.isArray(p.images) && p.images.length > 0) ? p.images : (p.image ? [p.image] : ['assets/images/prod-green-tea.jpg']);
      const imgCount = allImgs.length;

      return `
      <tr data-product-id="${p.id}">
        <td style="text-align:center;font-weight:600;color:var(--admin-muted);font-size:0.88rem;">${index + 1}</td>
        <td style="text-align:center;">
          <div class="product-thumb-container" onclick="openAdminLightbox('${p.id}', 0)" title="Nhấn để phóng to ảnh (${imgCount} hình)">
            <img src="${escapeHtml(displayImg)}" class="product-table-thumb" alt="${escapeHtml(p.name)}" loading="lazy">
            ${imgCount > 1 ? `
              <span class="product-thumb-badge" title="${imgCount} hình ảnh">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                ${imgCount}
              </span>` : ''}
            <div class="product-thumb-overlay" title="Xem ảnh phóng to">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
          </div>
        </td>
        <td>
          <div class="product-table-name-wrap">
            <a href="javascript:void(0)" class="product-table-title" onclick="openEditProductModal('${p.id}')" title="Nhấn để chỉnh sửa sản phẩm">
              ${escapeHtml(p.name)}
            </a>
            ${p.details?.activeIngredient ? `
              <div class="product-spec-tag" title="Hoạt chất định lượng">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>${escapeHtml(p.details.activeIngredient)}</span>
              </div>` : ''}
            ${p.details?.coaStandard ? `<div class="product-coa-note">${escapeHtml(p.details.coaStandard)}</div>` : ''}
          </div>
        </td>
        <td>${getCategoryBadge(p.category)}</td>
        <td>${getTagBadge(p.tag)}</td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            ${p.isFeatured ? `
              <span class="badge badge-featured" title="Hiển thị nổi bật trang chủ">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Nổi bật
              </span>` : ''}
            ${p.isNew ? '<span class="badge badge-tag-new">Mới</span>' : ''}
            ${(!p.isFeatured && !p.isNew) ? '<span class="badge badge-subtle">Mặc định</span>' : ''}
          </div>
        </td>
        <td style="text-align:center;">
          <div class="table-actions-group">
            <button class="btn btn-outline btn-sm btn-action-edit" onclick="openEditProductModal('${p.id}')" title="Chỉnh sửa sản phẩm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              <span>Sửa</span>
            </button>
            <button class="btn btn-danger-soft btn-sm btn-action-delete" onclick="confirmDeleteProduct('${p.id}')" title="Xóa sản phẩm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>Xóa</span>
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
  }

  // Modal Sản phẩm & Quản lý tối đa 3 hình ảnh
  const modalProduct = document.getElementById('admin-modal-product');
  const productForm = document.getElementById('product-form');
  let currentProductImages = [];

  function updateProductImagesUI() {
    const grid = document.getElementById('product-images-grid');
    const counter = document.getElementById('product-images-counter');
    const browseBtn = document.getElementById('btn-browse-product-images');
    const presetSelect = document.getElementById('product-image-preset-select');
    const urlInput = document.getElementById('product-image-url-input');
    const urlBtn = document.getElementById('btn-add-product-url');

    if (!grid) return;

    const count = currentProductImages.length;
    if (counter) {
      if (count === 3) {
        counter.className = 'badge badge-warning';
        counter.textContent = '3/3 hình (Đã tối đa)';
      } else if (count > 0) {
        counter.className = 'badge badge-success';
        counter.textContent = `${count}/3 hình`;
      } else {
        counter.className = 'badge badge-secondary';
        counter.textContent = '0/3 hình';
      }
    }

    const isFull = count >= 3;
    if (browseBtn) {
      browseBtn.disabled = isFull;
      browseBtn.style.opacity = isFull ? '0.5' : '1';
      browseBtn.style.cursor = isFull ? 'not-allowed' : 'pointer';
    }
    if (presetSelect) presetSelect.disabled = isFull;
    if (urlBtn) urlBtn.disabled = isFull;
    if (urlInput) urlInput.disabled = isFull;

    let html = '';
    currentProductImages.forEach((src, idx) => {
      const isPrimary = idx === 0;
      html += `
        <div class="product-image-card ${isPrimary ? 'is-primary' : ''}">
          <img src="${escapeHtml(src)}" alt="Hình sản phẩm ${idx + 1}">
          ${isPrimary ? '<span class="product-image-badge-primary">★ Ảnh chính</span>' : ''}
          <button type="button" class="product-image-delete-btn" onclick="removeProductImage(${idx})" title="Xóa hình này" aria-label="Xóa hình">✕</button>
          ${!isPrimary ? `
            <div class="product-image-actions-bar">
              <button type="button" class="product-image-set-primary-btn" onclick="setProductPrimaryImage(${idx})">Đặt làm ảnh chính</button>
            </div>
          ` : ''}
        </div>
      `;
    });

    for (let i = count; i < 3; i++) {
      html += `
        <div class="product-image-empty-card" onclick="triggerBrowseProductImage()" title="Bấm để tải thêm ảnh (${i + 1}/3)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span class="product-image-empty-text">+ Thêm hình (${i + 1}/3)</span>
        </div>
      `;
    }

    grid.innerHTML = html;
  }

  window.triggerBrowseProductImage = function () {
    if (currentProductImages.length >= 3) {
      showAdminToast('Mỗi sản phẩm chỉ được tải tối đa 3 hình ảnh.', 'warning');
      return;
    }
    document.getElementById('product-images-file')?.click();
  };

  window.removeProductImage = function (idx) {
    if (idx >= 0 && idx < currentProductImages.length) {
      currentProductImages.splice(idx, 1);
      updateProductImagesUI();
    }
  };

  window.setProductPrimaryImage = function (idx) {
    if (idx > 0 && idx < currentProductImages.length) {
      const selected = currentProductImages.splice(idx, 1)[0];
      currentProductImages.unshift(selected);
      updateProductImagesUI();
      showAdminToast('Đã đặt làm ảnh đại diện chính của sản phẩm.', 'success');
    }
  };

  async function handleProductFiles(files) {
    if (!files || files.length === 0) return;
    const remainingSlots = 3 - currentProductImages.length;
    if (remainingSlots <= 0) {
      showAdminToast('Mỗi sản phẩm chỉ được tải tối đa 3 hình ảnh.', 'warning');
      return;
    }

    const filesArray = Array.from(files);
    const filesToProcess = filesArray.slice(0, remainingSlots);
    if (filesArray.length > remainingSlots) {
      showAdminToast(`Chỉ tiếp nhận thêm ${remainingSlots} hình vì đã đạt giới hạn tối đa 3 hình.`, 'info');
    }

    for (const file of filesToProcess) {
      try {
        const result = await processImageFile(file, 1000, 1000, 0.82);
        if (currentProductImages.length < 3) {
          currentProductImages.push(result.dataUrl);
        }
      } catch (err) {
        showAdminToast(err.message || 'Lỗi khi xử lý hình ảnh.', 'danger');
      }
    }
    updateProductImagesUI();
    showAdminToast('Đã tải lên và tối ưu hóa hình ảnh sản phẩm thành công!', 'success');
  }

  function initProductImagesManager() {
    const fileInput = document.getElementById('product-images-file');
    const browseBtn = document.getElementById('btn-browse-product-images');
    const managerCard = document.getElementById('product-images-manager');
    const presetSelect = document.getElementById('product-image-preset-select');
    const urlInput = document.getElementById('product-image-url-input');
    const addUrlBtn = document.getElementById('btn-add-product-url');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => {
        if (currentProductImages.length >= 3) {
          showAdminToast('Mỗi sản phẩm chỉ được tải tối đa 3 hình ảnh.', 'warning');
          return;
        }
        fileInput.value = '';
        fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleProductFiles(e.target.files);
        }
      });
    }

    if (managerCard) {
      ['dragenter', 'dragover'].forEach(eventName => {
        managerCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          managerCard.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        managerCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          managerCard.classList.remove('dragover');
        });
      });

      managerCard.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
          handleProductFiles(dt.files);
        }
      });
    }

    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          if (currentProductImages.length >= 3) {
            showAdminToast('Mỗi sản phẩm chỉ được tải tối đa 3 hình ảnh.', 'warning');
            presetSelect.value = '';
            return;
          }
          if (!currentProductImages.includes(val)) {
            currentProductImages.push(val);
            updateProductImagesUI();
            showAdminToast('Đã thêm hình thảo mộc mẫu.', 'success');
          } else {
            showAdminToast('Hình ảnh này đã có trong danh sách.', 'info');
          }
          presetSelect.value = '';
        }
      });
    }

    function addUrlImage() {
      if (!urlInput) return;
      const url = urlInput.value.trim();
      if (!url) return;
      if (currentProductImages.length >= 3) {
        showAdminToast('Mỗi sản phẩm chỉ được tải tối đa 3 hình ảnh.', 'warning');
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('assets/')) {
        showAdminToast('Vui lòng nhập đường dẫn URL hợp lệ.', 'danger');
        return;
      }
      currentProductImages.push(url);
      urlInput.value = '';
      updateProductImagesUI();
      showAdminToast('Đã thêm hình ảnh từ URL.', 'success');
    }

    if (addUrlBtn) {
      addUrlBtn.addEventListener('click', addUrlImage);
    }
    if (urlInput) {
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addUrlImage();
        }
      });
    }
  }

  initProductImagesManager();

  window.openAddProductModal = function () {
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('modal-product-title').textContent = 'Thêm sản phẩm mới';
    currentProductImages = ['assets/images/prod-green-tea.jpg'];
    updateProductImagesUI();
    modalProduct.classList.add('is-open');
  };

  window.openEditProductModal = function (id) {
    const p = store.getProductById(id);
    if (!p) return;

    document.getElementById('product-id').value = p.id;
    document.getElementById('modal-product-title').textContent = 'Chỉnh sửa sản phẩm';
    document.getElementById('product-name').value = p.name;
    document.getElementById('product-category').value = p.category || 'extract';
    document.getElementById('product-tag').value = p.tag || 'Bán chạy';
    document.getElementById('product-desc').value = p.desc;
    document.getElementById('product-active').value = p.details?.activeIngredient || '';
    document.getElementById('product-coa').value = p.details?.coaStandard || '';
    document.getElementById('product-formulation').value = p.details?.formulation || '';
    document.getElementById('product-origin').value = p.details?.origin || '';
    document.getElementById('product-is-featured').checked = p.isFeatured !== false;
    document.getElementById('product-is-new').checked = !!p.isNew;

    if (Array.isArray(p.images) && p.images.length > 0) {
      currentProductImages = [...p.images].slice(0, 3);
    } else if (p.image) {
      currentProductImages = [p.image];
    } else {
      currentProductImages = ['assets/images/prod-green-tea.jpg'];
    }
    updateProductImagesUI();

    modalProduct.classList.add('is-open');
  };

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('product-id').value;
      const imgs = currentProductImages.length > 0 ? currentProductImages.slice(0, 3) : ['assets/images/prod-green-tea.jpg'];
      const primaryImg = imgs[0];

      const productData = {
        id: id || undefined,
        name: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value,
        tag: document.getElementById('product-tag').value,
        desc: document.getElementById('product-desc').value.trim(),
        image: primaryImg,
        images: imgs,
        isFeatured: document.getElementById('product-is-featured').checked,
        isNew: document.getElementById('product-is-new').checked,
        details: {
          activeIngredient: document.getElementById('product-active').value.trim(),
          coaStandard: document.getElementById('product-coa').value.trim(),
          formulation: document.getElementById('product-formulation').value.trim(),
          origin: document.getElementById('product-origin').value.trim()
        }
      };

      store.saveProduct(productData);
      closeAdminModals();
      renderProductsTable();
      showAdminToast(id ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm mới thành công!', 'success');
    });
  }

  window.confirmDeleteProduct = function (id) {
    const p = store.getProductById(id);
    if (!p) return;
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${p.name}" không?`)) {
      store.deleteProduct(id);
      renderProductsTable();
      showAdminToast(`Đã xóa sản phẩm "${p.name}"!`, 'warning');
    }
  };

  // ===== TAB: FORMULATIONS (CÔNG THỨC MẪU) =====
  const searchFormulationInput = document.getElementById('search-formulation-input');
  const filterFormulationCat = document.getElementById('filter-formulation-cat');
  const searchFormulationClear = document.getElementById('search-formulation-clear');

  if (searchFormulationInput) {
    searchFormulationInput.addEventListener('input', () => {
      if (searchFormulationClear) {
        searchFormulationClear.style.display = searchFormulationInput.value ? 'block' : 'none';
      }
      renderFormulationsTable();
    });
  }
  if (searchFormulationClear) {
    searchFormulationClear.addEventListener('click', () => {
      if (searchFormulationInput) {
        searchFormulationInput.value = '';
        searchFormulationInput.focus();
      }
      searchFormulationClear.style.display = 'none';
      renderFormulationsTable();
    });
  }
  if (filterFormulationCat) {
    filterFormulationCat.addEventListener('change', () => renderFormulationsTable());
  }

  window.resetFormulationFilters = function () {
    if (searchFormulationInput) searchFormulationInput.value = '';
    if (filterFormulationCat) filterFormulationCat.value = '';
    if (searchFormulationClear) searchFormulationClear.style.display = 'none';
    renderFormulationsTable();
  };

  function getFormulationCatBadge(cat) {
    const map = {
      cosmetics: { name: 'Mỹ phẩm & Skin-care', cls: 'badge-cat-cosmetics' },
      pharma: { name: 'Dược phẩm & TPCN', cls: 'badge-cat-pharma' },
      beverage: { name: 'Đồ uống chức năng', cls: 'badge-cat-beverage' }
    };
    const c = map[cat] || { name: 'Khác', cls: 'badge-cat-other' };
    return `<span class="badge ${c.cls}">${escapeHtml(c.name)}</span>`;
  }

  function renderFormulationsTable() {
    const tbody = document.getElementById('formulations-tbody');
    if (!tbody) return;

    const allForms = store.getFormulations ? store.getFormulations() : [];
    let forms = allForms;
    const q = searchFormulationInput?.value.trim().toLowerCase() || '';
    const cat = filterFormulationCat?.value || '';

    if (q) {
      forms = forms.filter(f =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.desc && f.desc.toLowerCase().includes(q)) ||
        (f.mainIngredient && f.mainIngredient.toLowerCase().includes(q)) ||
        (f.badge && f.badge.toLowerCase().includes(q))
      );
    }
    if (cat) {
      forms = forms.filter(f => f.category === cat);
    }

    const countChip = document.getElementById('formulation-count-chip');
    if (countChip) {
      if (q || cat) {
        countChip.textContent = `Hiển thị ${forms.length} / ${allForms.length} công thức`;
      } else {
        countChip.textContent = `${allForms.length} công thức`;
      }
    }

    if (forms.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="product-empty-state">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><path d="M10 2v7.31L4.1 19.3A2 2 0 0 0 5.8 22h12.4a2 2 0 0 0 1.7-2.7L14 9.31V2"/><path d="M8.5 2h7"/></svg>
              <div class="product-empty-title">Không tìm thấy công thức mẫu nào phù hợp</div>
              <div class="product-empty-sub">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc nhóm ngành.</div>
              ${(q || cat) ? `<button type="button" class="btn btn-outline btn-sm" onclick="resetFormulationFilters()" style="margin-top:10px;">Xóa bộ lọc</button>` : ''}
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = forms.map((f, index) => {
      const img = f.image || 'assets/images/form-serum.jpg';
      const ingredientCount = Array.isArray(f.ingredients) ? f.ingredients.length : 0;

      return `
        <tr data-formulation-id="${f.id}">
          <td style="text-align:center;font-weight:600;color:var(--admin-muted);font-size:0.88rem;">${index + 1}</td>
          <td style="text-align:center;">
            <div class="formulation-thumb-box" title="${escapeHtml(f.name)}">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(f.name)}" loading="lazy">
            </div>
          </td>
          <td>
            <b style="font-size:0.95rem;color:var(--admin-text);">${escapeHtml(f.name)}</b>
            <div style="font-size:0.82rem;color:var(--admin-muted);margin-top:3px;max-width:320px;line-height:1.4;">
              ${escapeHtml(f.desc ? (f.desc.length > 90 ? f.desc.substring(0, 90) + '...' : f.desc) : '—')}
            </div>
          </td>
          <td>
            <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
              ${getFormulationCatBadge(f.category)}
              ${f.badge ? `<span style="font-size:0.75rem;color:var(--admin-muted);font-weight:500;">🏷️ ${escapeHtml(f.badge)}</span>` : ''}
            </div>
          </td>
          <td>
            <div style="font-size:0.88rem;font-weight:600;color:var(--admin-text);">${escapeHtml(f.dosageForm || '—')}</div>
            <div style="font-size:0.8rem;color:var(--admin-primary);margin-top:2px;">
              ${escapeHtml(f.mainIngredient || '—')}
            </div>
          </td>
          <td style="text-align:center;">
            <span class="badge badge-info" style="font-size:0.8rem;">${ingredientCount} nguyên liệu</span>
          </td>
          <td style="text-align:center;">
            <div style="display:inline-flex;gap:6px;">
              <button class="btn btn-outline btn-sm" onclick="openEditFormulationModal('${f.id}')" title="Chỉnh sửa công thức">Sửa</button>
              <button class="btn btn-danger btn-sm" onclick="confirmDeleteFormulation('${f.id}')" title="Xóa công thức">Xóa</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Modal & Form handling for Formulation
  const modalFormulation = document.getElementById('admin-modal-formulation');
  const formulationForm = document.getElementById('formulation-form');
  const formulationImgPreview = document.getElementById('formulation-img-preview');
  const formulationImageSelect = document.getElementById('formulation-image-select');
  const formulationImageFile = document.getElementById('formulation-image-file');
  const formulationImageCustomWrap = document.getElementById('formulation-image-custom-wrap');
  const formulationImageUrl = document.getElementById('formulation-image-url');
  const formulationImageValue = document.getElementById('formulation-image-value');
  const btnBrowseFormulationImage = document.getElementById('btn-browse-formulation-image');
  const formulationIngredientsTbody = document.getElementById('formulation-ingredients-tbody');

  function setFormulationImage(src) {
    if (!src) src = 'assets/images/form-serum.jpg';
    if (formulationImageValue) formulationImageValue.value = src;
    if (formulationImgPreview) formulationImgPreview.src = src;

    const presets = [
      'assets/images/form-serum.jpg',
      'assets/images/form-capsule.jpg',
      'assets/images/form-drink.jpg',
      'assets/images/form-gel.jpg',
      'assets/images/form-serum.svg',
      'assets/images/form-capsule.svg',
      'assets/images/form-drink.svg',
      'assets/images/form-gel.svg'
    ];
    if (presets.includes(src)) {
      if (formulationImageSelect) formulationImageSelect.value = src;
      if (formulationImageCustomWrap) formulationImageCustomWrap.style.display = 'none';
    } else {
      if (formulationImageSelect) formulationImageSelect.value = 'custom';
      if (formulationImageCustomWrap) formulationImageCustomWrap.style.display = 'block';
      if (formulationImageUrl) formulationImageUrl.value = src.startsWith('data:') ? '' : src;
    }
  }

  if (formulationImageSelect) {
    formulationImageSelect.addEventListener('change', () => {
      const val = formulationImageSelect.value;
      if (val === 'custom') {
        if (formulationImageCustomWrap) formulationImageCustomWrap.style.display = 'block';
      } else {
        if (formulationImageCustomWrap) formulationImageCustomWrap.style.display = 'none';
        setFormulationImage(val);
      }
    });
  }

  if (btnBrowseFormulationImage && formulationImageFile) {
    btnBrowseFormulationImage.addEventListener('click', () => {
      formulationImageFile.click();
    });
  }

  if (formulationImageFile) {
    formulationImageFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        setFormulationImage(dataUrl);
        showAdminToast('Đã chọn hình ảnh công thức!', 'success');
      };
      reader.readAsDataURL(file);
      formulationImageFile.value = '';
    });
  }

  if (formulationImageUrl) {
    formulationImageUrl.addEventListener('input', () => {
      const url = formulationImageUrl.value.trim();
      if (url) {
        setFormulationImage(url);
      }
    });
  }

  // Dynamic Ingredient Rows
  window.addIngredientRow = function (data = { name: '', ratio: '', role: '' }) {
    if (!formulationIngredientsTbody) return;
    const tr = document.createElement('tr');
    tr.className = 'ingredient-row';
    tr.innerHTML = `
      <td>
        <input type="text" class="form-control form-control-sm ing-name" placeholder="VD: Chiết xuất Trà xanh EGCG 98%" value="${escapeHtml(data.name || '')}" required>
      </td>
      <td>
        <input type="text" class="form-control form-control-sm ing-ratio" placeholder="VD: 2.0% hoặc 150 mg" value="${escapeHtml(data.ratio || '')}" required>
      </td>
      <td>
        <input type="text" class="form-control form-control-sm ing-role" placeholder="VD: Chống oxy hóa, sáng da" value="${escapeHtml(data.role || '')}">
      </td>
      <td style="text-align:center;">
        <button type="button" class="btn-remove-row" onclick="removeIngredientRow(this)" title="Xóa thành phần này">✕</button>
      </td>
    `;
    formulationIngredientsTbody.appendChild(tr);
  };

  window.removeIngredientRow = function (btn) {
    const row = btn.closest('tr');
    if (!row) return;
    const totalRows = formulationIngredientsTbody.querySelectorAll('tr').length;
    if (totalRows <= 1) {
      showAdminToast('Công thức phải có ít nhất 1 thành phần!', 'warning');
      return;
    }
    row.remove();
  };

  function collectIngredients() {
    if (!formulationIngredientsTbody) return [];
    const rows = formulationIngredientsTbody.querySelectorAll('.ingredient-row');
    const result = [];
    rows.forEach(r => {
      const name = r.querySelector('.ing-name')?.value.trim() || '';
      const ratio = r.querySelector('.ing-ratio')?.value.trim() || '';
      const role = r.querySelector('.ing-role')?.value.trim() || '';
      if (name || ratio) {
        result.push({ name, ratio, role });
      }
    });
    return result;
  }

  window.openAddFormulationModal = function () {
    if (!formulationForm) return;
    formulationForm.reset();
    document.getElementById('formulation-id').value = '';
    document.getElementById('modal-formulation-title').textContent = 'Thêm công thức mẫu mới';
    setFormulationImage('assets/images/form-serum.jpg');

    // Reset ingredients to 3 sample rows
    if (formulationIngredientsTbody) {
      formulationIngredientsTbody.innerHTML = '';
      addIngredientRow({ name: '', ratio: '', role: '' });
      addIngredientRow({ name: '', ratio: '', role: '' });
      addIngredientRow({ name: '', ratio: '', role: '' });
    }

    if (modalFormulation) modalFormulation.classList.add('is-open');
  };

  window.openEditFormulationModal = function (id) {
    if (!store.getFormulationById || !formulationForm) return;
    const f = store.getFormulationById(id);
    if (!f) return;

    document.getElementById('formulation-id').value = f.id;
    document.getElementById('modal-formulation-title').textContent = 'Chỉnh sửa công thức mẫu';
    document.getElementById('formulation-name').value = f.name || '';
    document.getElementById('formulation-category').value = f.category || 'cosmetics';
    document.getElementById('formulation-badge').value = f.badge || '';
    document.getElementById('formulation-dosage').value = f.dosageForm || '';
    document.getElementById('formulation-main-ingredient').value = f.mainIngredient || '';
    document.getElementById('formulation-desc').value = f.desc || '';
    document.getElementById('formulation-spec').value = f.spec || '';
    document.getElementById('formulation-directions').value = f.directions || '';

    setFormulationImage(f.image || 'assets/images/form-serum.jpg');

    if (formulationIngredientsTbody) {
      formulationIngredientsTbody.innerHTML = '';
      if (Array.isArray(f.ingredients) && f.ingredients.length > 0) {
        f.ingredients.forEach(ing => addIngredientRow(ing));
      } else {
        addIngredientRow({ name: '', ratio: '', role: '' });
      }
    }

    if (modalFormulation) modalFormulation.classList.add('is-open');
  };

  if (formulationForm) {
    formulationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('formulation-id').value;
      const ingredients = collectIngredients();

      if (ingredients.length === 0) {
        showAdminToast('Vui lòng thêm ít nhất 1 thành phần cho công thức!', 'warning');
        return;
      }

      const formObj = {
        id: id || undefined,
        name: document.getElementById('formulation-name').value.trim(),
        category: document.getElementById('formulation-category').value,
        badge: document.getElementById('formulation-badge').value.trim() || 'Công thức R&D',
        dosageForm: document.getElementById('formulation-dosage').value.trim(),
        mainIngredient: document.getElementById('formulation-main-ingredient').value.trim(),
        image: formulationImageValue ? formulationImageValue.value : 'assets/images/form-serum.jpg',
        desc: document.getElementById('formulation-desc').value.trim(),
        spec: document.getElementById('formulation-spec').value.trim(),
        directions: document.getElementById('formulation-directions').value.trim(),
        ingredients: ingredients
      };

      store.saveFormulation(formObj);
      closeAdminModals();
      renderFormulationsTable();
      renderDashboard();
      showAdminToast(id ? 'Đã cập nhật công thức thành công!' : 'Đã thêm công thức mẫu mới thành công!', 'success');
    });
  }

  window.confirmDeleteFormulation = function (id) {
    if (!store.getFormulationById) return;
    const f = store.getFormulationById(id);
    if (!f) return;
    if (confirm(`Bạn có chắc chắn muốn xóa công thức "${f.name}" không?`)) {
      store.deleteFormulation(id);
      renderFormulationsTable();
      renderDashboard();
      showAdminToast(`Đã xóa công thức "${f.name}"!`, 'warning');
    }
  };

  // ===== TAB 3: NEWS =====
  function renderNewsTable() {
    const tbody = document.getElementById('news-tbody');
    if (!tbody) return;
    const news = store.getNews();

    if (news.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--admin-muted);">Chưa có bài viết tin tức nào.</td></tr>';
      return;
    }

    tbody.innerHTML = news.map((n, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><img src="${n.image}" class="news-table-thumb" alt=""></td>
        <td>
          <b>${escapeHtml(n.title)}</b>
          <div style="font-size:0.8rem;color:var(--admin-muted);margin-top:2px;">
            ${escapeHtml(n.excerpt.substring(0, 80))}...
          </div>
        </td>
        <td>${escapeHtml(n.date)}<br><small style="color:var(--admin-muted)">${escapeHtml(n.author || 'PUCECO')}</small></td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openEditNewsModal('${n.id}')">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteNews('${n.id}')">Xóa</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  const modalNews = document.getElementById('admin-modal-news');
  const newsForm = document.getElementById('news-form');
  const DEFAULT_NEWS_IMAGE = 'assets/images/news-gmp.jpg';

  // Helper: Xử lý và nén ảnh đại diện phía client (giảm dung lượng, không lo vượt quota localStorage)
  function processImageFile(file, maxWidth = 1200, maxHeight = 800, quality = 0.85) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WebP, SVG).'));
      }

      // Nếu là SVG, giữ nguyên dạng data URL vector
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ dataUrl: e.target.result, size: file.size });
        reader.onerror = () => reject(new Error('Không thể đọc tệp SVG.'));
        reader.readAsDataURL(file);
        return;
      }

      // Xử lý ảnh raster (JPG, PNG, WebP) qua Canvas
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Nén sang JPEG nhẹ & nét để lưu trữ bền vững
          const outputType = (file.type === 'image/png' && file.size < 400 * 1024) ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputType, quality);
          const estSize = Math.round((dataUrl.length * 3) / 4);
          resolve({ dataUrl, size: estSize });
        };
        img.onerror = () => reject(new Error('Không thể phân tích tệp ảnh này.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Không thể đọc tệp từ máy tính.'));
      reader.readAsDataURL(file);
    });
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function setNewsImage(imageSrc, type = 'auto', customLabel = '') {
    const valueInput = document.getElementById('news-image-value');
    const previewImg = document.getElementById('news-image-preview');
    const selectEl = document.getElementById('news-image-select');
    const urlInput = document.getElementById('news-image-url');
    const badgeEl = document.getElementById('news-image-badge');
    const filenameEl = document.getElementById('news-image-filename');
    const removeBtn = document.getElementById('btn-remove-news-image');

    const src = imageSrc || DEFAULT_NEWS_IMAGE;
    if (valueInput) valueInput.value = src;
    if (previewImg) previewImg.src = src;

    const isPreset = [
      'assets/images/news-gmp.jpg', 'assets/images/news-farm.jpg', 'assets/images/news-lab.jpg',
      'assets/images/news-gmp.svg', 'assets/images/news-farm.svg', 'assets/images/news-lab.svg'
    ].includes(src);
    const isDataUrl = src.startsWith('data:image/');

    if (type === 'upload' || isDataUrl) {
      if (badgeEl) {
        badgeEl.textContent = 'Ảnh tải từ máy';
        badgeEl.className = 'badge badge-success';
      }
      if (filenameEl) {
        filenameEl.textContent = customLabel ? `Đã chọn: ${customLabel}` : 'Ảnh đại diện đã được tải lên từ máy tính (đã tối ưu)';
        filenameEl.style.color = 'var(--admin-primary)';
      }
      if (selectEl) selectEl.value = 'custom';
      if (urlInput) urlInput.value = '';
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else if (type === 'url' || (!isPreset && (src.startsWith('http://') || src.startsWith('https://')))) {
      if (badgeEl) {
        badgeEl.textContent = 'Liên kết URL';
        badgeEl.className = 'badge badge-info';
      }
      if (filenameEl) {
        filenameEl.textContent = 'Sử dụng hình ảnh từ liên kết web bên ngoài';
        filenameEl.style.color = 'var(--admin-muted)';
      }
      if (selectEl) selectEl.value = 'custom';
      if (urlInput && urlInput.value !== src) urlInput.value = src;
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
      // Preset
      if (badgeEl) {
        badgeEl.textContent = 'Hình mẫu có sẵn';
        badgeEl.className = 'badge badge-secondary';
      }
      if (filenameEl) {
        filenameEl.textContent = 'Hỗ trợ PNG, JPG, WebP, SVG (tối ưu hóa nén nhẹ & tự động)';
        filenameEl.style.color = 'var(--admin-muted)';
      }
      if (selectEl && isPreset) selectEl.value = src;
      if (urlInput) urlInput.value = '';
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }

  // Khởi tạo các sự kiện Upload hình đại diện Blog
  function initNewsImageUploader() {
    const fileInput = document.getElementById('news-image-file');
    const browseBtn = document.getElementById('btn-browse-news-image');
    const removeBtn = document.getElementById('btn-remove-news-image');
    const dropzone = document.getElementById('news-image-dropzone');
    const uploaderCard = document.getElementById('news-image-uploader');
    const selectEl = document.getElementById('news-image-select');
    const urlInput = document.getElementById('news-image-url');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
    }

    async function handleFile(file) {
      if (!file) return;
      try {
        const result = await processImageFile(file);
        const label = `${file.name} (${formatFileSize(result.size)})`;
        setNewsImage(result.dataUrl, 'upload', label);
        showAdminToast('Đã tải lên & tối ưu hóa ảnh đại diện thành công!', 'success');
      } catch (err) {
        showAdminToast(err.message || 'Lỗi khi xử lý hình ảnh.', 'danger');
      }
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handleFile(file);
      });
    }

    if (uploaderCard) {
      ['dragenter', 'dragover'].forEach(eventName => {
        uploaderCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          uploaderCard.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        uploaderCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          uploaderCard.classList.remove('dragover');
        });
      });

      uploaderCard.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt && dt.files && dt.files[0];
        if (file) handleFile(file);
      });
    }

    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val && val !== 'custom') {
          if (fileInput) fileInput.value = '';
          setNewsImage(val, 'preset');
        }
      });
    }

    if (urlInput) {
      let debounceTimer = null;
      urlInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const val = e.target.value.trim();
          if (val) {
            if (fileInput) fileInput.value = '';
            setNewsImage(val, 'url');
          }
        }, 300);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (fileInput) fileInput.value = '';
        if (urlInput) urlInput.value = '';
        setNewsImage(DEFAULT_NEWS_IMAGE, 'preset');
        showAdminToast('Đã đặt lại hình ảnh mặc định.', 'info');
      });
    }
  }

  initNewsImageUploader();

  window.openAddNewsModal = function () {
    newsForm.reset();
    document.getElementById('news-id').value = '';
    document.getElementById('modal-news-title').textContent = 'Viết bài tin tức mới';
    document.getElementById('news-date').value = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
    const fileInput = document.getElementById('news-image-file');
    if (fileInput) fileInput.value = '';
    const urlInput = document.getElementById('news-image-url');
    if (urlInput) urlInput.value = '';
    setNewsImage(DEFAULT_NEWS_IMAGE, 'preset');
    modalNews.classList.add('is-open');
  };

  window.openEditNewsModal = function (id) {
    const n = store.getNewsById(id);
    if (!n) return;

    document.getElementById('news-id').value = n.id;
    document.getElementById('modal-news-title').textContent = 'Chỉnh sửa tin tức';
    document.getElementById('news-title-input').value = n.title;
    document.getElementById('news-date').value = n.date;
    document.getElementById('news-author').value = n.author || 'PUCECO';
    document.getElementById('news-excerpt').value = n.excerpt;
    document.getElementById('news-content').value = n.content || n.excerpt;
    
    const fileInput = document.getElementById('news-image-file');
    if (fileInput) fileInput.value = '';
    const urlInput = document.getElementById('news-image-url');
    if (urlInput) urlInput.value = '';
    
    setNewsImage(n.image || DEFAULT_NEWS_IMAGE);

    modalNews.classList.add('is-open');
  };

  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('news-id').value;
      const imgVal = document.getElementById('news-image-value')?.value ||
                     document.getElementById('news-image-select')?.value ||
                     DEFAULT_NEWS_IMAGE;

      const newsData = {
        id: id || undefined,
        title: document.getElementById('news-title-input').value.trim(),
        date: document.getElementById('news-date').value.trim(),
        author: document.getElementById('news-author').value.trim(),
        excerpt: document.getElementById('news-excerpt').value.trim(),
        content: document.getElementById('news-content').value.trim(),
        image: imgVal
      };

      store.saveNews(newsData);
      closeAdminModals();
      renderNewsTable();
      showAdminToast(id ? 'Đã cập nhật bài viết!' : 'Đã thêm bài viết mới!', 'success');
    });
  }

  window.confirmDeleteNews = function (id) {
    const n = store.getNewsById(id);
    if (!n) return;
    if (confirm(`Bạn có chắc muốn xóa bài "${n.title}"?`)) {
      store.deleteNews(id);
      renderNewsTable();
      showAdminToast('Đã xóa bài viết!', 'warning');
    }
  };

  // ===== TAB: CERTS (CHỨNG NHẬN & TIÊU CHUẨN) =====
  function renderCerts() {
    const settings = store.getSettings();
    const certEyebrowInput = document.getElementById('cert-eyebrow-input');
    const certTitleInput = document.getElementById('cert-title-input');
    const previewEyebrow = document.getElementById('preview-cert-eyebrow');
    const previewTitle = document.getElementById('preview-cert-title');

    const eyebrow = settings.certEyebrow || 'Cam kết chất lượng';
    const title = settings.certTitle || 'Chứng nhận & tiêu chuẩn';

    if (certEyebrowInput) certEyebrowInput.value = eyebrow;
    if (certTitleInput) certTitleInput.value = title;
    if (previewEyebrow) previewEyebrow.textContent = eyebrow;
    if (previewTitle) previewTitle.textContent = title;

    const certs = store.getCertifications();
    const tbody = document.getElementById('certs-tbody');
    const previewRow = document.getElementById('preview-cert-row');

    if (tbody) {
      if (certs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--admin-muted);">Chưa có chứng nhận nào trong danh sách. Bấm nút <b>"+ Thêm Chứng Nhận Mới"</b> để tạo.</td></tr>';
      } else {
        tbody.innerHTML = certs.map((c, index) => `
          <tr>
            <td style="text-align:center;font-weight:600;">${index + 1}</td>
            <td>
              <span class="cert-code-tag">${escapeHtml(c.code)}</span>
            </td>
            <td>
              <b>${escapeHtml(c.title)}</b>
            </td>
            <td>
              <span style="font-size:0.88rem;color:var(--admin-muted);">${escapeHtml(c.desc || '—')}</span>
            </td>
            <td style="text-align:center;">
              <button type="button" class="btn-toggle-badge ${c.enabled !== false ? 'active' : ''}" onclick="toggleCertStatus('${c.id}')" title="Bấm để bật/tắt hiển thị">
                ${c.enabled !== false ? '● Hiển thị' : '○ Đang ẩn'}
              </button>
            </td>
            <td style="text-align:center;">
              <div class="order-btn-group">
                <button type="button" class="btn-order-arrow" onclick="moveCertOrder('${c.id}', 'up')" ${index === 0 ? 'disabled' : ''} title="Đưa lên trên">▲</button>
                <button type="button" class="btn-order-arrow" onclick="moveCertOrder('${c.id}', 'down')" ${index === certs.length - 1 ? 'disabled' : ''} title="Đưa xuống dưới">▼</button>
              </div>
            </td>
            <td style="text-align:center;">
              <div style="display:flex;gap:6px;justify-content:center;">
                <button class="btn btn-outline btn-sm" onclick="openEditCertModal('${c.id}')" title="Chỉnh sửa thông tin">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCertItem('${c.id}')" title="Xóa chứng nhận">Xóa</button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    if (previewRow) {
      const activeCerts = certs.filter(c => c.enabled !== false);
      if (activeCerts.length === 0) {
        previewRow.innerHTML = '<p style="color:var(--admin-muted);font-style:italic;padding:16px;">Tất cả chứng nhận đang bị ẩn trên website.</p>';
      } else {
        previewRow.innerHTML = activeCerts.map(c => `
          <div class="cert-badge" ${c.desc ? `title="${escapeHtml(c.desc)}"` : ''}>
            <b>${escapeHtml(c.code)}</b>
            <span>${escapeHtml(c.title)}</span>
          </div>
        `).join('');
      }
    }
  }

  // Sự kiện lưu tiêu đề khối chứng nhận
  const certHeadingForm = document.getElementById('cert-heading-form');
  if (certHeadingForm) {
    certHeadingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const certEyebrow = document.getElementById('cert-eyebrow-input').value.trim();
      const certTitle = document.getElementById('cert-title-input').value.trim();

      store.saveSettings({ certEyebrow, certTitle });
      renderCerts();
      showAdminToast('Đã cập nhật tiêu đề khối chứng nhận thành công!', 'success');
    });
  }

  // Mở modal thêm chứng nhận mới
  window.openAddCertModal = function () {
    const form = document.getElementById('cert-form');
    if (form) form.reset();
    document.getElementById('cert-id').value = '';
    document.getElementById('modal-cert-title').textContent = 'Thêm chứng nhận mới';
    document.getElementById('cert-enabled-input').checked = true;

    const modal = document.getElementById('admin-modal-cert');
    if (modal) modal.classList.add('is-open');
    setTimeout(() => document.getElementById('cert-code-input')?.focus(), 100);
  };

  // Mở modal sửa chứng nhận
  window.openEditCertModal = function (id) {
    const cert = store.getCertificationById(id);
    if (!cert) return;

    document.getElementById('cert-id').value = cert.id;
    document.getElementById('modal-cert-title').textContent = `Chỉnh sửa chứng nhận: ${cert.code}`;
    document.getElementById('cert-code-input').value = cert.code || '';
    document.getElementById('cert-name-input').value = cert.title || '';
    document.getElementById('cert-desc-input').value = cert.desc || '';
    document.getElementById('cert-enabled-input').checked = (cert.enabled !== false);

    const modal = document.getElementById('admin-modal-cert');
    if (modal) modal.classList.add('is-open');
    setTimeout(() => document.getElementById('cert-code-input')?.focus(), 100);
  };

  // Submit form thêm/sửa chứng nhận
  const certForm = document.getElementById('cert-form');
  if (certForm) {
    certForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('cert-id').value;
      const code = document.getElementById('cert-code-input').value.trim();
      const title = document.getElementById('cert-name-input').value.trim();
      const desc = document.getElementById('cert-desc-input').value.trim();
      const enabled = document.getElementById('cert-enabled-input').checked;

      if (!code || !title) {
        showAdminToast('Vui lòng nhập đầy đủ mã và tên chứng nhận!', 'warning');
        return;
      }

      store.saveCertification({
        id: id || undefined,
        code,
        title,
        desc,
        enabled
      });

      closeAdminModals();
      renderCerts();
      showAdminToast(id ? 'Đã cập nhật chứng nhận thành công!' : 'Đã thêm chứng nhận mới thành công!', 'success');
    });
  }

  // Xóa chứng nhận
  window.deleteCertItem = function (id) {
    const cert = store.getCertificationById(id);
    if (!cert) return;
    if (confirm(`Bạn có chắc chắn muốn xóa chứng nhận "${cert.code} — ${cert.title}"?`)) {
      store.deleteCertification(id);
      renderCerts();
      showAdminToast(`Đã xóa chứng nhận "${cert.code}".`, 'warning');
    }
  };

  // Bật/tắt hiển thị chứng nhận
  window.toggleCertStatus = function (id) {
    const newStatus = store.toggleCertification(id);
    renderCerts();
    showAdminToast(newStatus ? 'Đã kích hoạt hiển thị chứng nhận.' : 'Đã ẩn chứng nhận khỏi website.', 'info');
  };

  // Di chuyển thứ tự chứng nhận
  window.moveCertOrder = function (id, direction) {
    const success = store.reorderCertifications(id, direction);
    if (success) {
      renderCerts();
    }
  };

  // ===== TAB: HERO SLIDER (TRANG CHỦ) =====
  let adminHeroPreviewIndex = 0;

  function renderHeroSlides() {
    const slides = store.getSlides();
    const container = document.getElementById('hero-slides-cards-grid');
    if (!container) return;

    if (!slides || slides.length === 0) {
      container.innerHTML = '<p style="color:var(--admin-muted);padding:20px;">Chưa có slide nào. Bấm nút "Đặt lại 3 Slide gốc" để tạo lại.</p>';
      return;
    }

    container.innerHTML = slides.map((s, idx) => {
      const g1 = s.g1 || '#18181B';
      const g2 = s.g2 || (idx === 0 ? '#B72622' : idx === 1 ? '#991B1B' : '#D4322D');
      const badgeTop = s.badgeTop || (idx === 0 ? 'GMP' : idx === 1 ? '100%' : 'R&D');
      const badgeBottom = s.badgeBottom || (idx === 0 ? 'đạt chuẩn' : idx === 1 ? 'thiên nhiên' : 'nội bộ');
      const bgImg = s.bgImage || (idx === 0 ? 'assets/images/hero-bg-1.jpg' : idx === 1 ? 'assets/images/hero-bg-2.jpg' : 'assets/images/hero-bg-3.jpg');
      const titleDisplay = escapeHtml(s.title || '').replace(/\r?\n/g, '<br>').replace(/&lt;br\s*\/?&gt;/gi, '<br>');

      return `
        <div class="admin-slide-card" data-slide-id="${s.id}">
          <div class="admin-slide-thumb" style="--g1:${g1};--g2:${g2}">
            <img src="${escapeHtml(bgImg)}" alt="Slide ${idx + 1}" loading="lazy">
            <div class="admin-slide-thumb-overlay">
              <span class="admin-slide-order-badge">Slide #${idx + 1}</span>
              <div class="admin-slide-thumb-badge">
                <b>${escapeHtml(badgeTop)}</b>
                <span>${escapeHtml(badgeBottom)}</span>
              </div>
            </div>
          </div>
          <div class="admin-slide-content">
            <div class="admin-slide-eyebrow">${escapeHtml(s.eyebrow || '')}</div>
            <h4 class="admin-slide-title">${titleDisplay}</h4>
            <p class="admin-slide-lede">${escapeHtml(s.lede || '—')}</p>
            <div class="admin-slide-buttons-preview">
              ${s.btn1Text ? `<span class="admin-slide-btn-tag primary">Nút 1: ${escapeHtml(s.btn1Text)}</span>` : ''}
              ${s.btn2Text ? `<span class="admin-slide-btn-tag">Nút 2: ${escapeHtml(s.btn2Text)}</span>` : ''}
            </div>
          </div>
          <div class="admin-slide-footer">
            <button type="button" class="btn btn-secondary btn-sm" onclick="setAdminHeroPreviewSlide(${idx})">
              Xem thử
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="openEditHeroModal('${s.id}')">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              Chỉnh sửa Slide
            </button>
          </div>
        </div>
      `;
    }).join('');

    renderAdminHeroSimulator();
  }

  window.setAdminHeroPreviewSlide = function (index) {
    adminHeroPreviewIndex = index;
    const tabBtns = document.querySelectorAll('#hero-preview-slide-tabs button');
    tabBtns.forEach((btn, idx) => {
      btn.className = `btn btn-sm ${idx === index ? 'btn-primary' : 'btn-secondary'}`;
    });
    renderAdminHeroSimulator();
  };

  function renderAdminHeroSimulator() {
    const simulator = document.getElementById('admin-hero-simulator');
    if (!simulator) return;

    const slides = store.getSlides();
    if (!slides || slides.length === 0) {
      simulator.innerHTML = '<p style="color:#A1A1AA;padding:30px;text-align:center;">Không có slide nào.</p>';
      return;
    }

    if (adminHeroPreviewIndex >= slides.length) adminHeroPreviewIndex = 0;
    const s = slides[adminHeroPreviewIndex];
    const g1 = s.g1 || '#18181B';
    const g2 = s.g2 || (adminHeroPreviewIndex === 0 ? '#B72622' : adminHeroPreviewIndex === 1 ? '#991B1B' : '#D4322D');
    const bgImg = s.bgImage || (adminHeroPreviewIndex === 0 ? 'assets/images/hero-bg-1.jpg' : adminHeroPreviewIndex === 1 ? 'assets/images/hero-bg-2.jpg' : 'assets/images/hero-bg-3.jpg');
    const artImg = s.artImage || (adminHeroPreviewIndex === 0 ? 'assets/images/hero-botanical-1.svg' : adminHeroPreviewIndex === 1 ? 'assets/images/hero-botanical-2.svg' : 'assets/images/hero-botanical-3.svg');
    const badgeTop = s.badgeTop || (adminHeroPreviewIndex === 0 ? 'GMP' : adminHeroPreviewIndex === 1 ? '100%' : 'R&D');
    const badgeBottom = s.badgeBottom || (adminHeroPreviewIndex === 0 ? 'đạt chuẩn' : adminHeroPreviewIndex === 1 ? 'thiên nhiên' : 'nội bộ');
    const titleFormatted = escapeHtml(s.title || '').replace(/\r?\n/g, '<br>').replace(/&lt;br\s*\/?&gt;/gi, '<br>');

    simulator.innerHTML = `
      <div class="sim-bg">
        <img src="${escapeHtml(bgImg)}" alt="">
        <div class="sim-overlay" style="background:linear-gradient(90deg, ${g1} 0%, rgba(24, 24, 27, 0.82) 45%, ${g2}66 100%)"></div>
      </div>
      <div class="sim-inner">
        <div class="sim-copy">
          ${s.eyebrow ? `<div class="sim-eyebrow">${escapeHtml(s.eyebrow)}</div>` : ''}
          <h2 class="sim-title">${titleFormatted}</h2>
          ${s.lede ? `<p class="sim-lede">${escapeHtml(s.lede)}</p>` : ''}
          <div class="sim-actions">
            ${s.btn1Text ? `<span class="sim-btn-primary">${escapeHtml(s.btn1Text)}</span>` : ''}
            ${s.btn2Text ? `<span class="sim-btn-ghost">${escapeHtml(s.btn2Text)}</span>` : ''}
          </div>
        </div>
        <div class="sim-visual">
          ${artImg ? `<img class="sim-art" src="${escapeHtml(artImg)}" alt="">` : ''}
          <div class="sim-badge">
            <b>${escapeHtml(badgeTop)}</b>
            <span>${escapeHtml(badgeBottom)}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Modal Sửa Slide Hero
  const modalHero = document.getElementById('admin-modal-hero');
  const heroSlideForm = document.getElementById('hero-slide-form');

  window.openEditHeroModal = function (id) {
    const s = store.getSlideById(id);
    if (!s) return;

    document.getElementById('hero-slide-id').value = s.id;
    document.getElementById('modal-hero-title').textContent = `Chỉnh sửa Slide ${s.order || ''}: ${s.eyebrow || ''}`;
    document.getElementById('hero-slide-eyebrow').value = s.eyebrow || '';
    document.getElementById('hero-slide-title').value = s.title || '';
    document.getElementById('hero-slide-lede').value = s.lede || '';
    document.getElementById('hero-slide-badge-top').value = s.badgeTop || '';
    document.getElementById('hero-slide-badge-bottom').value = s.badgeBottom || '';
    document.getElementById('hero-slide-btn1-text').value = s.btn1Text || '';
    document.getElementById('hero-slide-btn1-link').value = s.btn1Link || '';
    document.getElementById('hero-slide-btn2-text').value = s.btn2Text || '';
    document.getElementById('hero-slide-btn2-link').value = s.btn2Link || '';
    document.getElementById('hero-slide-art').value = s.artImage || '';
    document.getElementById('hero-slide-g1').value = s.g1 || '#18181B';
    document.getElementById('hero-slide-g2').value = s.g2 || '#B72622';

    const fileInput = document.getElementById('hero-image-file');
    if (fileInput) fileInput.value = '';
    const urlInput = document.getElementById('hero-image-url');
    if (urlInput) urlInput.value = '';

    setHeroImage(s.bgImage || 'assets/images/hero-bg-1.jpg');

    if (modalHero) modalHero.classList.add('is-open');
  };

  function setHeroImage(imageSrc, type = 'auto', customLabel = '') {
    const valueInput = document.getElementById('hero-image-value');
    const previewImg = document.getElementById('hero-image-preview');
    const selectEl = document.getElementById('hero-image-select');
    const urlInput = document.getElementById('hero-image-url');
    const badgeEl = document.getElementById('hero-image-badge');
    const filenameEl = document.getElementById('hero-image-filename');
    const removeBtn = document.getElementById('btn-remove-hero-image');

    const src = imageSrc || 'assets/images/hero-bg-1.jpg';
    if (valueInput) valueInput.value = src;
    if (previewImg) previewImg.src = src;

    const isPreset = [
      'assets/images/hero-bg-1.jpg', 'assets/images/hero-bg-2.jpg', 'assets/images/hero-bg-3.jpg'
    ].includes(src);
    const isDataUrl = src.startsWith('data:image/');

    if (type === 'upload' || isDataUrl) {
      if (badgeEl) {
        badgeEl.textContent = 'Ảnh từ máy';
        badgeEl.className = 'badge badge-success';
      }
      if (filenameEl) {
        filenameEl.textContent = customLabel ? `Đã chọn: ${customLabel}` : 'Ảnh nền đã được tải lên & tối ưu nét từ máy tính';
        filenameEl.style.color = 'var(--admin-primary)';
      }
      if (selectEl) selectEl.value = 'custom';
      if (urlInput) urlInput.value = '';
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else if (type === 'url' || (!isPreset && (src.startsWith('http://') || src.startsWith('https://')))) {
      if (badgeEl) {
        badgeEl.textContent = 'Ảnh tùy chỉnh';
        badgeEl.className = 'badge badge-info';
      }
      if (filenameEl) {
        filenameEl.textContent = 'Ảnh nền tùy chỉnh đang sử dụng';
        filenameEl.style.color = 'var(--admin-muted)';
      }
      if (selectEl) selectEl.value = 'custom';
      if (urlInput && urlInput.value !== src) urlInput.value = src;
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
      if (badgeEl) {
        badgeEl.textContent = 'Hình nền mẫu';
        badgeEl.className = 'badge badge-secondary';
      }
      if (filenameEl) {
        filenameEl.textContent = 'Hỗ trợ JPG, PNG, WebP (Khuyến nghị tỷ lệ 16:9 độ nét cao)';
        filenameEl.style.color = 'var(--admin-muted)';
      }
      if (selectEl && isPreset) selectEl.value = src;
      if (urlInput) urlInput.value = '';
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }

  function initHeroImageUploader() {
    const fileInput = document.getElementById('hero-image-file');
    const browseBtn = document.getElementById('btn-browse-hero-image');
    const removeBtn = document.getElementById('btn-remove-hero-image');
    const dropzone = document.getElementById('hero-image-dropzone');
    const uploaderCard = document.getElementById('hero-image-uploader');
    const selectEl = document.getElementById('hero-image-select');
    const urlInput = document.getElementById('hero-image-url');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
    }

    async function handleFile(file) {
      if (!file) return;
      try {
        const result = await processImageFile(file, 1920, 1080, 0.85);
        const label = `${file.name} (${formatFileSize(result.size)})`;
        setHeroImage(result.dataUrl, 'upload', label);
        showAdminToast('Đã tải lên và nén tối ưu ảnh nền Slider thành công!', 'success');
      } catch (err) {
        showAdminToast(err.message || 'Lỗi khi xử lý hình ảnh.', 'danger');
      }
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handleFile(file);
      });
    }

    if (uploaderCard) {
      ['dragenter', 'dragover'].forEach(eventName => {
        uploaderCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          uploaderCard.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        uploaderCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          uploaderCard.classList.remove('dragover');
        });
      });

      uploaderCard.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt && dt.files && dt.files[0];
        if (file) handleFile(file);
      });
    }

    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val && val !== 'custom') {
          if (fileInput) fileInput.value = '';
          setHeroImage(val, 'preset');
        }
      });
    }

    if (urlInput) {
      let debounceTimer = null;
      urlInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const val = e.target.value.trim();
          if (val) {
            if (fileInput) fileInput.value = '';
            setHeroImage(val, 'url');
          }
        }, 300);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (fileInput) fileInput.value = '';
        if (urlInput) urlInput.value = '';
        const id = document.getElementById('hero-slide-id').value;
        const defaultMap = {
          'slide-1': 'assets/images/hero-bg-1.jpg',
          'slide-2': 'assets/images/hero-bg-2.jpg',
          'slide-3': 'assets/images/hero-bg-3.jpg'
        };
        const resetSrc = defaultMap[id] || 'assets/images/hero-bg-1.jpg';
        setHeroImage(resetSrc, 'preset');
        showAdminToast('Đã đặt lại hình nền mặc định.', 'info');
      });
    }
  }

  initHeroImageUploader();

  if (heroSlideForm) {
    heroSlideForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('hero-slide-id').value;
      const currentSlide = store.getSlideById(id) || {};

      const imgVal = document.getElementById('hero-image-value')?.value ||
                     document.getElementById('hero-image-select')?.value ||
                     currentSlide.bgImage || 'assets/images/hero-bg-1.jpg';

      const updatedSlide = {
        ...currentSlide,
        id: id,
        eyebrow: document.getElementById('hero-slide-eyebrow').value.trim(),
        title: document.getElementById('hero-slide-title').value.trim(),
        lede: document.getElementById('hero-slide-lede').value.trim(),
        badgeTop: document.getElementById('hero-slide-badge-top').value.trim(),
        badgeBottom: document.getElementById('hero-slide-badge-bottom').value.trim(),
        btn1Text: document.getElementById('hero-slide-btn1-text').value.trim(),
        btn1Link: document.getElementById('hero-slide-btn1-link').value.trim(),
        btn2Text: document.getElementById('hero-slide-btn2-text').value.trim(),
        btn2Link: document.getElementById('hero-slide-btn2-link').value.trim(),
        bgImage: imgVal,
        artImage: document.getElementById('hero-slide-art').value,
        g1: document.getElementById('hero-slide-g1').value.trim() || '#18181B',
        g2: document.getElementById('hero-slide-g2').value.trim() || '#B72622'
      };

      store.saveSlide(updatedSlide);
      closeAdminModals();
      renderHeroSlides();
      showAdminToast(`Đã lưu cập nhật cho Slide thành công!`, 'success');
    });
  }

  // Nút đặt lại 3 slide gốc
  const resetHeroBtn = document.getElementById('btn-reset-hero-slides');
  if (resetHeroBtn) {
    resetHeroBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn khôi phục 3 slide về nội dung và hình ảnh gốc ban đầu?')) {
        store.resetSlidesToDefault();
        renderHeroSlides();
        showAdminToast('Đã khôi phục 3 slide về mặc định ban đầu!', 'info');
      }
    });
  }

  // ===== TAB 4: LEADS & INQUIRIES =====
  function renderLeadsTable() {
    const tbody = document.getElementById('leads-tbody');
    if (!tbody) return;
    const leads = store.getLeads();

    if (leads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--admin-muted);">Chưa có yêu cầu liên hệ nào từ website.</td></tr>';
      return;
    }

    tbody.innerHTML = leads.map((l, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>
          <b>${escapeHtml(l.fullName)}</b><br>
          <small style="color:var(--admin-muted)">${escapeHtml(l.company || 'Doanh nghiệp')}</small>
        </td>
        <td>
          <a href="tel:${l.phone}" style="color:var(--admin-primary);font-weight:600;">${escapeHtml(l.phone)}</a><br>
          <a href="mailto:${l.email}" style="color:var(--admin-muted);font-size:0.85rem;">${escapeHtml(l.email)}</a>
        </td>
        <td><span class="badge badge-info">${escapeHtml(l.productOfInterest)}</span></td>
        <td style="max-width:240px;font-size:0.85rem;color:var(--admin-muted);">${escapeHtml(l.message || '—')}</td>
        <td>
          <select class="form-control form-control-sm" style="padding:4px 8px;font-size:0.82rem;" onchange="updateLeadStatus('${l.id}', this.value)">
            <option value="new" ${l.status === 'new' ? 'selected' : ''}>Mới tiếp nhận</option>
            <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Đang liên hệ</option>
            <option value="sample_sent" ${l.status === 'sample_sent' ? 'selected' : ''}>Đã gửi mẫu</option>
            <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>Hoàn tất</option>
          </select>
        </td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteLead('${l.id}')">Xóa</button>
        </td>
      </tr>
    `).join('');
  }

  window.updateLeadStatus = function (id, status) {
    store.updateLeadStatus(id, status);
    updateBadges();
    showAdminToast('Đã cập nhật trạng thái yêu cầu!', 'success');
  };

  window.confirmDeleteLead = function (id) {
    if (confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      store.deleteLead(id);
      renderLeadsTable();
      updateBadges();
      showAdminToast('Đã xóa yêu cầu khách hàng!', 'warning');
    }
  };

  window.quickViewLead = function (id) {
    switchTab('leads');
  };

  // Xuất file CSV / Excel
  const exportLeadsBtn = document.getElementById('export-leads-btn');
  if (exportLeadsBtn) {
    exportLeadsBtn.addEventListener('click', () => {
      const leads = store.getLeads();
      if (leads.length === 0) {
        showAdminToast('Chưa có dữ liệu để xuất file!', 'warning');
        return;
      }

      let csvContent = '\uFEFF'; // BOM cho tiếng Việt Unicode
      csvContent += 'STT,Họ và Tên,Email,Số Điện Thoại,Công Ty,Sản Phẩm Quan Tâm,Lời Nhắn,Trạng Thái,Thời Gian Gửi\r\n';

      leads.forEach((l, idx) => {
        const row = [
          idx + 1,
          `"${(l.fullName || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.phone || '').replace(/"/g, '""')}"`,
          `"${(l.company || '').replace(/"/g, '""')}"`,
          `"${(l.productOfInterest || '').replace(/"/g, '""')}"`,
          `"${(l.message || '').replace(/"/g, '""')}"`,
          `"${l.status}"`,
          `"${l.createdAt || ''}"`
        ];
        csvContent += row.join(',') + '\r\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PUCECO_KhachHang_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showAdminToast('Đã xuất file Excel/CSV thành công!', 'success');
    });
  }

  // ===== TAB 5: SETTINGS & BACKUP =====
  function renderSettings() {
    const settings = store.getSettings();
    document.getElementById('settings-brand').value = settings.brandName || 'PUCECO';
    document.getElementById('settings-slogan').value = settings.slogan || '';
    document.getElementById('settings-hotline').value = settings.hotline || '';
    document.getElementById('settings-email').value = settings.email || '';
    document.getElementById('settings-address').value = settings.address || '';
    const mapsEl = document.getElementById('settings-maps');
    if (mapsEl) mapsEl.value = settings.mapsUrl || '';

    document.getElementById('settings-stat-years').value = settings.stats?.years || 12;
    document.getElementById('settings-stat-partners').value = settings.stats?.partners || 320;
    document.getElementById('settings-stat-lines').value = settings.stats?.lines || 48;
    document.getElementById('settings-stat-traceability').value = settings.stats?.traceability || 100;
  }

  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const mapsInput = document.getElementById('settings-maps');
      const updated = {
        brandName: document.getElementById('settings-brand').value.trim(),
        slogan: document.getElementById('settings-slogan').value.trim(),
        hotline: document.getElementById('settings-hotline').value.trim(),
        email: document.getElementById('settings-email').value.trim(),
        address: document.getElementById('settings-address').value.trim(),
        mapsUrl: mapsInput ? mapsInput.value.trim() : '',
        stats: {
          years: Number(document.getElementById('settings-stat-years').value) || 12,
          partners: Number(document.getElementById('settings-stat-partners').value) || 320,
          lines: Number(document.getElementById('settings-stat-lines').value) || 48,
          traceability: Number(document.getElementById('settings-stat-traceability').value) || 100
        }
      };

      store.saveSettings(updated);
      showAdminToast('Đã lưu cài đặt website thành công!', 'success');
    });
  }

  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldPass = document.getElementById('old-pass').value.trim();
      const newPass = document.getElementById('new-pass').value.trim();
      const confirmPass = document.getElementById('confirm-pass').value.trim();

      if (!store.verifyAdminPassword(oldPass)) {
        showAdminToast('Mật khẩu hiện tại không đúng!', 'error');
        return;
      }
      if (newPass.length < 6) {
        showAdminToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'warning');
        return;
      }
      if (newPass !== confirmPass) {
        showAdminToast('Xác nhận mật khẩu mới không khớp!', 'warning');
        return;
      }

      store.saveSettings({ adminPassword: newPass });
      passwordForm.reset();
      showAdminToast('Đổi mật khẩu thành công!', 'success');
    });
  }

  // Backup JSON
  const exportBackupBtn = document.getElementById('export-backup-btn');
  if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', () => {
      const data = store.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_puceco_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showAdminToast('Đã tải xuống file sao lưu dữ liệu!', 'success');
    });
  }

  // Restore JSON
  const importFileInput = document.getElementById('import-file-input');
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = store.importAllData(event.target.result);
        if (res.success) {
          showAdminToast('Phục hồi dữ liệu từ file thành công!', 'success');
          loadCurrentTab();
        } else {
          showAdminToast('Lỗi phục hồi dữ liệu: ' + res.error, 'error');
        }
      };
      reader.readAsText(file);
      importFileInput.value = '';
    });
  }

  // Reset Default Data
  const resetDataBtn = document.getElementById('reset-data-btn');
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      if (confirm('CẢNH BÁO: Hành động này sẽ đặt lại tất cả sản phẩm, tin tức, yêu cầu khách hàng về dữ liệu mẫu ban đầu! Bạn có chắc chắn?')) {
        store.resetToDefault();
        loadCurrentTab();
        showAdminToast('Đã khôi phục dữ liệu mặc định ban đầu!', 'warning');
      }
    });
  }

  // ===== Helper Functions =====
  window.closeAdminModals = function () {
    document.querySelectorAll('.admin-modal').forEach(m => m.classList.remove('is-open'));
  };

  document.querySelectorAll('[data-close-admin-modal]').forEach(btn => {
    btn.addEventListener('click', closeAdminModals);
  });

  function getCategoryName(cat) {
    const map = {
      extract: 'Chiết xuất thực vật',
      essential_oil: 'Tinh dầu thiên nhiên',
      nano: 'Hoạt chất Nano',
      sweetener: 'Chất tạo ngọt tự nhiên',
      herb: 'Dược liệu thô'
    };
    return map[cat] || 'Khác';
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'new': return '<span class="badge badge-danger">Mới tiếp nhận</span>';
      case 'contacted': return '<span class="badge badge-warning">Đang liên hệ</span>';
      case 'sample_sent': return '<span class="badge badge-info">Đã gửi mẫu</span>';
      case 'completed': return '<span class="badge badge-success">Hoàn tất</span>';
      default: return '<span class="badge badge-secondary">Chờ xử lý</span>';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
  }

  function showAdminToast(msg, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Listen for sync updates
  if (store.onSync) {
    store.onSync(() => {
      loadCurrentTab();
    });
  }

  // ===== ADMIN IMAGE LIGHTBOX (PHÓNG TO HÌNH ẢNH SẢN PHẨM) =====
  let currentLightboxImages = [];
  let currentLightboxIndex = 0;

  window.openAdminLightbox = function (productId, imgIdx = 0) {
    const p = store.getProductById(productId);
    if (!p) return;

    const modal = document.getElementById('admin-lightbox-modal');
    const imgEl = document.getElementById('admin-lightbox-img');
    const titleEl = document.getElementById('admin-lightbox-title');
    if (!modal || !imgEl) return;

    currentLightboxImages = (Array.isArray(p.images) && p.images.length > 0)
      ? p.images
      : (p.image ? [p.image] : ['assets/images/prod-green-tea.jpg']);
    currentLightboxIndex = Math.max(0, Math.min(imgIdx, currentLightboxImages.length - 1));

    if (titleEl) titleEl.textContent = p.name;
    updateLightboxUI();
    modal.classList.add('is-open');
  };

  function updateLightboxUI() {
    const imgEl = document.getElementById('admin-lightbox-img');
    const countEl = document.getElementById('admin-lightbox-count');
    const thumbsContainer = document.getElementById('admin-lightbox-thumbs');
    if (!imgEl) return;

    imgEl.src = currentLightboxImages[currentLightboxIndex] || '';

    if (countEl) {
      if (currentLightboxImages.length > 1) {
        countEl.textContent = `Hình ${currentLightboxIndex + 1} / ${currentLightboxImages.length}`;
      } else {
        countEl.textContent = '';
      }
    }

    if (thumbsContainer) {
      if (currentLightboxImages.length > 1) {
        thumbsContainer.innerHTML = currentLightboxImages.map((src, idx) => `
          <button type="button" class="admin-lightbox-thumb-btn ${idx === currentLightboxIndex ? 'active' : ''}" onclick="switchLightboxImage(${idx})" title="Xem hình ${idx + 1}">
            <img src="${escapeHtml(src)}" alt="">
          </button>
        `).join('');
      } else {
        thumbsContainer.innerHTML = '';
      }
    }
  }

  window.switchLightboxImage = function (idx) {
    currentLightboxIndex = idx;
    updateLightboxUI();
  };

  window.closeAdminLightbox = function (e) {
    if (e && e.target && e.target.closest && e.target.closest('.admin-lightbox-content') && !e.target.closest('.admin-lightbox-close')) {
      return;
    }
    const modal = document.getElementById('admin-lightbox-modal');
    if (modal) modal.classList.remove('is-open');
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const lb = document.getElementById('admin-lightbox-modal');
      if (lb && lb.classList.contains('is-open')) {
        closeAdminLightbox();
      }
    }
  });

  // Khởi động
  checkAuth();
});
