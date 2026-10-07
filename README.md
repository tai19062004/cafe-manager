# HỆ THỐNG QUẢN LÝ QUÁN CAFÉ (CAFE MANAGER)

> Đồ án môn học: **Công nghệ Oracle**  
> Đề tài: **Xây dựng cơ sở dữ liệu hệ thống quản lý quán Café**  
> Kiến trúc: **Fullstack Web App (ReactJS + Node.js/Express + Oracle AI Database Free 26ai)**

---

## 1. Yêu cầu hệ thống (Requirements)

- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên.
- **Oracle Database**: Oracle AI Database Free 26ai (hoặc 23ai/21c/19c).
- **Oracle Client / Service**: PDB `FREEPDB1`, Port `1521`.
- **User / Schema**: `CAFE`.
- **Postman**: Dùng để kiểm thử REST API.

---

## 2. Cấu trúc Database (Oracle Schema: CAFE)

Hệ thống sử dụng 8 bảng:

1. `CATEGORY`: Danh mục đồ uống/món.
2. `PRODUCT`: Sản phẩm đồ uống, bánh ngọt (khóa ngoại `category_id -> CATEGORY`).
3. `CUSTOMER`: Thông tin khách hàng.
4. `EMPLOYEE`: Nhân viên quán (vị trí, lương, liên hệ).
5. `CAFE_TABLE`: Quản lý bàn café (sức chứa, vị trí, trạng thái).
6. `ORDERS`: Đơn đặt món (khóa ngoại khách hàng, nhân viên, bàn).
7. `ORDER_DETAIL`: Chi tiết món trong từng đơn (khóa chính kết hợp `(order_id, product_id)`).
8. `PAYMENT`: Hóa đơn thanh toán của đơn hàng (1-1 với `ORDERS`).

*(Nếu database chưa có dữ liệu mẫu, bạn có thể thực thi file `backend/seed.sql` trong SQL*Plus / SQL Developer).\*

---

## 3. Cấu hình Backend (.env)

Vào thư mục `backend/` và kiểm tra file `.env`:

```env
PORT=3000
ORACLE_USER=CAFE
ORACLE_PASSWORD=mật_khẩu_oracle_của_bạn
ORACLE_CONNECT_STRING=localhost:1521/FREEPDB1
```

> ⚠️ **Lưu ý**: Hãy thay `mật_khẩu_oracle_của_bạn` bằng mật khẩu thực tế của user `CAFE` trên máy của bạn.

---

## 4. Cài đặt và Khởi chạy Backend

### Bước 4.1: Cài đặt packages

Mở Terminal tại thư mục gốc dự án:

```bash
cd backend
npm install
```

### Bước 4.2: Kiểm tra kết nối Oracle độc lập

Trước khi chạy server, chạy script kiểm tra kết nối:

```bash
node test-db.js
```

Nếu màn hình báo `✅ Kết nối Oracle thành công!`, bạn sẵn sàng khởi động backend.

### Bước 4.3: Chạy Backend server

- Chế độ phát triển (tự động reload khi sửa code):

```bash
npm run dev
```

- Hoặc chế độ thường:

```bash
npm start
```

Backend sẽ lắng nghe tại: `http://localhost:3000`

---

## 5. Danh sách API Endpoints

### 🩺 Hệ thống & Thống kê

| Phương thức | Endpoint               | Mô tả                                          |
| ----------- | ---------------------- | ---------------------------------------------- |
| `GET`       | `/api/health`          | Kiểm tra trạng thái API                        |
| `GET`       | `/api/dashboard/stats` | Thống kê số lượng, doanh thu, top món bán chạy |

### 📂 Danh mục (CATEGORY)

| Phương thức | Endpoint              | Mô tả                 |
| ----------- | --------------------- | --------------------- |
| `GET`       | `/api/categories`     | Lấy tất cả danh mục   |
| `GET`       | `/api/categories/:id` | Lấy chi tiết danh mục |
| `POST`      | `/api/categories`     | Thêm danh mục mới     |
| `PUT`       | `/api/categories/:id` | Cập nhật danh mục     |
| `DELETE`    | `/api/categories/:id` | Xóa danh mục          |

### ☕ Sản phẩm (PRODUCT)

| Phương thức | Endpoint            | Mô tả                                                   |
| ----------- | ------------------- | ------------------------------------------------------- |
| `GET`       | `/api/products`     | Danh sách sản phẩm (hỗ trợ `?category_id=`, `?search=`) |
| `GET`       | `/api/products/:id` | Chi tiết sản phẩm (JOIN CATEGORY)                       |
| `POST`      | `/api/products`     | Thêm sản phẩm mới                                       |
| `PUT`       | `/api/products/:id` | Cập nhật sản phẩm                                       |
| `DELETE`    | `/api/products/:id` | Xóa sản phẩm                                            |

### 👥 Khách hàng (CUSTOMER) & Nhân viên (EMPLOYEE)

| Phương thức | Endpoint             | Mô tả                                                |
| ----------- | -------------------- | ---------------------------------------------------- |
| `GET`       | `/api/customers`     | Danh sách khách hàng (tìm kiếm theo tên, sđt, email) |
| `POST`      | `/api/customers`     | Thêm khách hàng                                      |
| `PUT`       | `/api/customers/:id` | Cập nhật khách hàng                                  |
| `DELETE`    | `/api/customers/:id` | Xóa khách hàng                                       |
| `GET`       | `/api/employees`     | Danh sách nhân viên                                  |
| `POST`      | `/api/employees`     | Thêm nhân viên                                       |
| `PUT`       | `/api/employees/:id` | Cập nhật nhân viên                                   |
| `DELETE`    | `/api/employees/:id` | Xóa nhân viên                                        |

### 🪑 Bàn café (CAFE_TABLE)

| Phương thức | Endpoint          | Mô tả         |
| ----------- | ----------------- | ------------- |
| `GET`       | `/api/tables`     | Danh sách bàn |
| `POST`      | `/api/tables`     | Thêm bàn mới  |
| `PUT`       | `/api/tables/:id` | Cập nhật bàn  |
| `DELETE`    | `/api/tables/:id` | Xóa bàn       |

### 🧾 Đơn hàng (ORDERS) & Thanh toán (PAYMENT)

| Phương thức | Endpoint                 | Mô tả                                          |
| ----------- | ------------------------ | ---------------------------------------------- |
| `GET`       | `/api/orders`            | Danh sách đơn hàng                             |
| `GET`       | `/api/orders/:id`        | Chi tiết đơn hàng + danh sách món + thanh toán |
| `POST`      | `/api/orders`            | **Tạo đơn hàng (Oracle Transaction toàn vẹn)** |
| `PUT`       | `/api/orders/:id/status` | Đổi trạng thái đơn (CANCELLED / COMPLETED)     |
| `GET`       | `/api/payments`          | Danh sách thanh toán                           |

---

## 6. Hướng dẫn Test Postman

### Test 1: Kiểm tra API Health

- **Method**: `GET`
- **URL**: `http://localhost:3000/api/health`
- **Kết quả mong đợi**:

```json
{
  "success": true,
  "message": "API is running"
}
```

### Test 2: Lấy danh sách Categories

- **Method**: `GET`
- **URL**: `http://localhost:3000/api/categories`

### Test 3: Lấy danh sách Products (kèm JOIN Category)

- **Method**: `GET`
- **URL**: `http://localhost:3000/api/products`

### Test 4: Tạo đơn hàng bằng Transaction

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/orders`
- **Headers**: `Content-Type: application/json`
- **Body (raw JSON)**:

```json
{
  "customer_id": 1,
  "employee_id": 2,
  "table_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ],
  "payment_method": "CASH"
}
```

Backend sẽ tự động:

1. Tra cứu giá trực tiếp trong DB.
2. Tính tổng tiền.
3. Ghi đồng thời vào `ORDERS`, `ORDER_DETAIL`, `PAYMENT`.
4. Đổi trạng thái bàn thành `OCCUPIED`.
5. COMMIT (hoặc ROLLBACK nếu lỗi).
