-- File mẫu chèn dữ liệu ban đầu cho hệ thống Cafe Manager (nếu database của bạn chưa có dữ liệu)
-- Bạn có thể chạy file này trong SQL*Plus, SQL Developer hoặc DBeaver với user CAFE

-- 1. CATEGORY
INSERT INTO CATEGORY (category_id, category_name, description, status) 
VALUES (1, 'Cà phê truyền thống', 'Các loại cà phê Việt Nam pha phin và pha máy', 'ACTIVE');
INSERT INTO CATEGORY (category_id, category_name, description, status) 
VALUES (2, 'Trà & Trà sữa', 'Trà đào, trà vải, trà sữa trân châu', 'ACTIVE');
INSERT INTO CATEGORY (category_id, category_name, description, status) 
VALUES (3, 'Nước ép & Sinh tố', 'Nước ép hoa quả tươi và sinh tố bổ dưỡng', 'ACTIVE');
INSERT INTO CATEGORY (category_id, category_name, description, status) 
VALUES (4, 'Bánh ngọt', 'Các loại bánh tráng miệng đi kèm đồ uống', 'ACTIVE');

-- 2. PRODUCT
INSERT INTO PRODUCT (product_id, category_id, product_name, price, unit, description, status)
VALUES (1, 1, 'Cà phê đen đá', 25000, 'Ly', 'Cà phê đen nguyên chất pha phin', 'ACTIVE');
INSERT INTO PRODUCT (product_id, category_id, product_name, price, unit, description, status)
VALUES (2, 1, 'Cà phê sữa đá', 30000, 'Ly', 'Cà phê phin kết hợp sữa đặc ngọt béo', 'ACTIVE');
INSERT INTO PRODUCT (product_id, category_id, product_name, price, unit, description, status)
VALUES (3, 1, 'Bạc xỉu', 32000, 'Ly', 'Nhiều sữa ít cà phê, béo ngậy', 'ACTIVE');
INSERT INTO PRODUCT (product_id, category_id, product_name, price, unit, description, status)
VALUES (4, 2, 'Trà đào cam sả', 38000, 'Ly', 'Trà đào thanh mát với hương sả thơm', 'ACTIVE');
INSERT INTO PRODUCT (product_id, category_id, product_name, price, unit, description, status)
VALUES (5, 2, 'Trà vải lài', 38000, 'Ly', 'Trà lài kết hợp trái vải tươi ngon', 'ACTIVE');
INSERT INTO PRODUCT (product_id, category_id, product_name, price, unit, description, status)
VALUES (6, 4, 'Bánh Tiramisu', 45000, 'Phần', 'Bánh kem phô mai truyền thống Ý', 'ACTIVE');

-- 3. CUSTOMER
INSERT INTO CUSTOMER (customer_id, customer_name, phone, email, address, status)
VALUES (1, 'Nguyễn Văn An', '0901234567', 'an.nguyen@gmail.com', '123 Lê Lợi, Q.1, TP.HCM', 'ACTIVE');
INSERT INTO CUSTOMER (customer_id, customer_name, phone, email, address, status)
VALUES (2, 'Trần Thị Bình', '0912345678', 'binh.tran@gmail.com', '456 Nguyễn Huệ, Q.1, TP.HCM', 'ACTIVE');

-- 4. EMPLOYEE
INSERT INTO EMPLOYEE (employee_id, employee_name, phone, email, position, salary, status)
VALUES (1, 'Lê Hoàng Long', '0987654321', 'long.le@cafe.com', 'Quản lý', 15000000, 'ACTIVE');
INSERT INTO EMPLOYEE (employee_id, employee_name, phone, email, position, salary, status)
VALUES (2, 'Phạm Thu Trang', '0978123456', 'trang.pham@cafe.com', 'Thu ngân', 8000000, 'ACTIVE');
INSERT INTO EMPLOYEE (employee_id, employee_name, phone, email, position, salary, status)
VALUES (3, 'Đỗ Minh Tuấn', '0965432198', 'tuan.do@cafe.com', 'Pha chế', 9000000, 'ACTIVE');

-- 5. CAFE_TABLE
INSERT INTO CAFE_TABLE (table_id, table_name, capacity, location, status)
VALUES (1, 'Bàn 01', 2, 'Tầng trệt - Cửa sổ', 'AVAILABLE');
INSERT INTO CAFE_TABLE (table_id, table_name, capacity, location, status)
VALUES (2, 'Bàn 02', 4, 'Tầng trệt - Trung tâm', 'AVAILABLE');
INSERT INTO CAFE_TABLE (table_id, table_name, capacity, location, status)
VALUES (3, 'Bàn 03', 6, 'Tầng 1 - Phòng VIP', 'AVAILABLE');
INSERT INTO CAFE_TABLE (table_id, table_name, capacity, location, status)
VALUES (4, 'Bàn 04', 2, 'Sân vườn ngoài trời', 'AVAILABLE');

COMMIT;

