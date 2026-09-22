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
      case 'products': renderProductsTable(); break;
      case 'news': renderNewsTable(); break;
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
    const news = store.getNews();
    const leads = store.getLeads();
    const settings = store.getSettings();

    document.getElementById('kpi-products').textContent = products.length;
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

  if (searchProductInput) searchProductInput.addEventListener('input', () => renderProductsTable());
  if (filterProductCat) filterProductCat.addEventListener('change', () => renderProductsTable());

  function renderProductsTable() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    let products = store.getProducts();
    const q = searchProductInput?.value.trim().toLowerCase() || '';
    const cat = filterProductCat?.value || '';

    if (q) {
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    }
    if (cat) {
      products = products.filter(p => p.category === cat);
    }

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--admin-muted);">Không tìm thấy sản phẩm nào phù hợp.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map((p, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><img src="${p.image}" class="admin-table-thumb" alt=""></td>
        <td>
          <b>${escapeHtml(p.name)}</b>
          <div style="font-size:0.8rem;color:var(--admin-muted);margin-top:2px;">
            ${escapeHtml(p.details?.activeIngredient || '')}
          </div>
        </td>
        <td><span class="badge badge-secondary">${getCategoryName(p.category)}</span></td>
        <td><span class="badge ${p.tag === 'Organic' ? 'badge-warning' : p.tag === 'Mới' ? 'badge-info' : 'badge-success'}">${escapeHtml(p.tag || 'Bán chạy')}</span></td>
        <td>
          ${p.isFeatured ? '<span class="badge badge-success" style="margin-right:4px;">Nổi bật</span>' : ''}
          ${p.isNew ? '<span class="badge badge-info">Mới</span>' : ''}
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${p.id}')">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct('${p.id}')">Xóa</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Modal Sản phẩm
  const modalProduct = document.getElementById('admin-modal-product');
  const productForm = document.getElementById('product-form');

  window.openAddProductModal = function () {
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('modal-product-title').textContent = 'Thêm sản phẩm mới';
    document.getElementById('product-image-select').value = 'assets/images/prod-green-tea.svg';
    document.getElementById('product-image-custom').value = '';
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

    if (p.image && p.image.startsWith('assets/images/')) {
      document.getElementById('product-image-select').value = p.image;
      document.getElementById('product-image-custom').value = '';
    } else {
      document.getElementById('product-image-custom').value = p.image || '';
    }

    modalProduct.classList.add('is-open');
  };

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('product-id').value;
      const customImg = document.getElementById('product-image-custom').value.trim();
      const selectImg = document.getElementById('product-image-select').value;
      const img = customImg || selectImg || 'assets/images/prod-green-tea.svg';

      const productData = {
        id: id || undefined,
        name: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value,
        tag: document.getElementById('product-tag').value,
        desc: document.getElementById('product-desc').value.trim(),
        image: img,
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
        <td><img src="${n.image}" class="admin-table-thumb" alt=""></td>
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

  window.openAddNewsModal = function () {
    newsForm.reset();
    document.getElementById('news-id').value = '';
    document.getElementById('modal-news-title').textContent = 'Viết bài tin tức mới';
    document.getElementById('news-date').value = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
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
    document.getElementById('news-image-select').value = n.image || 'assets/images/news-gmp.svg';

    modalNews.classList.add('is-open');
  };

  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('news-id').value;
      const newsData = {
        id: id || undefined,
        title: document.getElementById('news-title-input').value.trim(),
        date: document.getElementById('news-date').value.trim(),
        author: document.getElementById('news-author').value.trim(),
        excerpt: document.getElementById('news-excerpt').value.trim(),
        content: document.getElementById('news-content').value.trim(),
        image: document.getElementById('news-image-select').value
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

    document.getElementById('settings-stat-years').value = settings.stats?.years || 12;
    document.getElementById('settings-stat-partners').value = settings.stats?.partners || 320;
    document.getElementById('settings-stat-lines').value = settings.stats?.lines || 48;
    document.getElementById('settings-stat-traceability').value = settings.stats?.traceability || 100;
  }

  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        brandName: document.getElementById('settings-brand').value.trim(),
        slogan: document.getElementById('settings-slogan').value.trim(),
        hotline: document.getElementById('settings-hotline').value.trim(),
        email: document.getElementById('settings-email').value.trim(),
        address: document.getElementById('settings-address').value.trim(),
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

  // Khởi động
  checkAuth();
});
