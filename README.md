# PUCECO — Website Giới Thiệu Nguyên Liệu Thiên Nhiên & Hệ Thống Quản Trị Admin

Website doanh nghiệp công nghệ cao của **PUCECO**, chuyên cung cấp nguyên liệu dược phẩm, mỹ phẩm chiết xuất từ thiên nhiên đạt chuẩn **GMP, ISO 9001 và USDA Organic**.

---

## 🌟 Các Tính Năng Nổi Bật Đã Được Tối Ưu & Nâng Cấp

### 1. Trang Chủ Khách Hàng (`index.html`)
- **Bộ nhận diện thương hiệu sang trọng**: Thiết kế chuẩn Botanical Luxury, font chữ Fraunces & Source Sans 3, hiệu ứng mượt mà.
- **Toàn bộ hình ảnh đồ họa vector SVG sắc nét**: Không bị vỡ ảnh trên mọi thiết bị Retina / 4K.
- **Tìm kiếm trực tiếp (Live Search)**: Gõ từ khóa tìm kiếm nhanh sản phẩm (trà xanh, curcumin, lô hội...) và tin tức bài viết.
- **Popup Chi tiết Sản phẩm**: Xem thông số hoạt chất, tiêu chuẩn COA/MSDS, dạng bào chế và xuất xứ. Kèm nút *"Yêu cầu mẫu thử ngay"* tự động điền sản phẩm vào form.
- **Popup Đọc Tin Tức**: Xem bài viết nghiên cứu khoa học, chuyển giao công nghệ.
- **Form gửi yêu cầu & nhận mẫu thử thực tế**: Thu thập họ tên, điện thoại, email, công ty, sản phẩm quan tâm và lưu trữ trực tiếp vào hệ thống quản trị.
- **Tương thích hoàn hảo**: Tối ưu 100% trên Mobile, Tablet, Laptop, Desktop.

### 2. Hệ Thống Quản Trị Admin (`admin.html`)
- **Xác thực đăng nhập an toàn**: Mật khẩu mặc định: `admin123` (có thể đổi trong tab Cài đặt).
- **Dashboard Tổng quan**: Thống kê số lượng sản phẩm, tin tức, số yêu cầu liên hệ mới.
- **Quản lý Sản phẩm**: Thêm mới, chỉnh sửa, xóa sản phẩm; gắn tag *Bán chạy, Mới, Organic, Dược dụng*; cấu hình thông số COA.
- **Quản lý Tin tức**: Viết bài mới, cập nhật nội dung nghiên cứu, sửa, xóa bài viết.
- **Quản lý Khách hàng & Mẫu thử (Leads)**: Theo dõi danh sách đối tác gửi form, chuyển trạng thái (*Mới tiếp nhận* → *Đang liên hệ* → *Đã gửi mẫu* → *Hoàn tất*).
- **Xuất dữ liệu Excel/CSV**: Tải toàn bộ danh sách khách hàng về máy tính chỉ với 1 click.
- **Cấu hình & Sao lưu**:
  - Đổi Hotline, Email, Địa chỉ công ty, Slogan.
  - Đổi số liệu thống kê thành tựu trên trang chủ.
  - **Sao lưu (Export JSON)** & **Phục hồi (Import JSON)** toàn bộ cơ sở dữ liệu.

---

## 🚀 Hướng Dẫn Sử Dụng

### Cách 1: Mở trực tiếp trên trình duyệt (Không cần cài đặt gì)
- Nhấp đúp chuột vào file [`index.html`](file:///d:/GITHUB/PUCECO/index.html) để xem website khách hàng.
- Nhấp đúp chuột vào file [`admin.html`](file:///d:/GITHUB/PUCECO/admin.html) để vào trang quản trị (Mật khẩu: `admin123`).
- *Dữ liệu được lưu trữ tự động trên máy tính qua LocalStorage và tự động đồng bộ tức thì giữa các tab.*

### Cách 2: Khởi chạy bằng Node.js Server (Nếu muốn chạy máy chủ nội bộ hoặc deploy)
Mở terminal tại thư mục dự án và chạy:
```bash
npm start
```
hoặc:
```bash
node server.js
```
- Truy cập Website: **http://localhost:3000**
- Truy cập Trang Admin: **http://localhost:3000/admin.html**

---

## 📁 Cấu Trúc Thư Mục

```text
PUCECO/
├── index.html                 # Trang chủ khách hàng
├── admin.html                 # Trang quản trị Admin Dashboard
├── server.js                  # Máy chủ Node.js phục vụ tĩnh & API
├── package.json               # Cấu hình dự án
├── README.md                  # Hướng dẫn chi tiết
└── assets/
    ├── css/
    │   ├── style.css          # Phong cách giao diện chính & token màu
    │   └── admin.css          # Giao diện trang quản trị Admin
    ├── js/
    │   ├── data-store.js      # Lớp quản lý dữ liệu trung tâm & đồng bộ tab
    │   ├── main.js            # Điều khiển tương tác trang chủ
    │   └── admin.js           # Điều khiển nghiệp vụ trang quản trị
    └── images/                # Bộ hình ảnh vector SVG chất lượng cao
        ├── hero-botanical-1.svg
        ├── hero-botanical-2.svg
        ├── hero-botanical-3.svg
        ├── prod-green-tea.svg
        ├── prod-lemongrass.svg
        ├── prod-curcumin.svg
        ├── prod-aloe.svg
        ├── prod-turmeric-black.svg
        ├── prod-stevia.svg
        ├── news-gmp.svg
        ├── news-farm.svg
        └── news-lab.svg
```
