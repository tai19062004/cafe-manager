import db from '../config/database.js';
import response from '../utils/response.js';

// GET /api/dashboard/stats - Thống kê tổng quan cho trang Dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Tổng số sản phẩm
    const prodRes = await db.execute(`SELECT COUNT(*) AS total FROM PRODUCT`);
    const total_products = prodRes.rows[0].total || 0;

    // 2. Tổng số khách hàng
    const custRes = await db.execute(`SELECT COUNT(*) AS total FROM CUSTOMER`);
    const total_customers = custRes.rows[0].total || 0;

    // 3. Tổng số nhân viên
    const empRes = await db.execute(`SELECT COUNT(*) AS total FROM EMPLOYEE`);
    const total_employees = empRes.rows[0].total || 0;

    // 4. Tổng số đơn hàng
    const orderRes = await db.execute(`SELECT COUNT(*) AS total FROM ORDERS`);
    const total_orders = orderRes.rows[0].total || 0;

    // 5. Tổng doanh thu (từ bảng PAYMENT có status PAID hoặc ORDERS không CANCELLED)
    const revRes = await db.execute(
      `SELECT NVL(SUM(amount), 0) AS total 
       FROM PAYMENT 
       WHERE status = 'PAID' OR status = 'COMPLETED'`
    );
    const total_revenue = revRes.rows[0].total || 0;

    // 6. Đơn hàng gần đây (5 đơn mới nhất)
    const recentOrdersRes = await db.execute(`
      SELECT o.order_id, 
             NVL(c.customer_name, 'Khách vãng lai') AS customer_name, 
             e.employee_name, 
             t.table_name, 
             TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date, 
             o.total_amount, 
             o.status
      FROM ORDERS o
      LEFT JOIN CUSTOMER c ON o.customer_id = c.customer_id
      JOIN EMPLOYEE e ON o.employee_id = e.employee_id
      JOIN CAFE_TABLE t ON o.table_id = t.table_id
      ORDER BY o.order_id DESC
      FETCH FIRST 5 ROWS ONLY
    `);

    // 7. Top 5 sản phẩm bán chạy nhất
    const topProductsRes = await db.execute(`
      SELECT p.product_id, 
             p.product_name, 
             p.price,
             NVL(SUM(od.quantity), 0) AS total_sold,
             NVL(SUM(od.subtotal), 0) AS total_revenue
      FROM ORDER_DETAIL od
      JOIN PRODUCT p ON od.product_id = p.product_id
      GROUP BY p.product_id, p.product_name, p.price
      ORDER BY total_sold DESC
      FETCH FIRST 5 ROWS ONLY
    `);

    // 8. Tỷ lệ phương thức thanh toán
    const paymentMethodsRes = await db.execute(`
      SELECT payment_method, 
             COUNT(*) AS count, 
             NVL(SUM(amount), 0) AS total_amount
      FROM PAYMENT
      GROUP BY payment_method
    `);

    return response.success(res, {
      total_products,
      total_customers,
      total_employees,
      total_orders,
      total_revenue,
      recent_orders: recentOrdersRes.rows,
      top_products: topProductsRes.rows,
      payment_methods: paymentMethodsRes.rows
    });
  } catch (err) {
    next(err);
  }
};

const dashboardController = {
  getDashboardStats
};

export default dashboardController;
