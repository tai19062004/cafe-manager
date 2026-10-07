import db from '../config/database.js';
import response from '../utils/response.js';
import orderService from '../services/orderService.js';

// GET /api/orders - Lấy danh sách tất cả đơn hàng
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, table_id } = req.query;

    let sql = `
      SELECT o.order_id, 
             o.customer_id, 
             c.customer_name, 
             o.employee_id, 
             e.employee_name, 
             o.table_id, 
             t.table_name, 
             TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date, 
             o.total_amount, 
             o.status,
             p.payment_id,
             p.payment_method,
             p.status AS payment_status
      FROM ORDERS o
      LEFT JOIN CUSTOMER c ON o.customer_id = c.customer_id
      JOIN EMPLOYEE e ON o.employee_id = e.employee_id
      JOIN CAFE_TABLE t ON o.table_id = t.table_id
      LEFT JOIN PAYMENT p ON o.order_id = p.order_id
      WHERE 1=1
    `;
    const binds = {};

    if (status) {
      sql += ` AND o.status = :status`;
      binds.status = status;
    }
    if (table_id) {
      sql += ` AND o.table_id = :table_id`;
      binds.table_id = Number(table_id);
    }

    sql += ` ORDER BY o.order_id DESC`;

    const result = await db.execute(sql, binds);
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id - Lấy chi tiết 1 đơn hàng (kèm danh sách món và thanh toán)
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Lấy thông tin đơn
    const orderSql = `
      SELECT o.order_id, 
             o.customer_id, 
             c.customer_name, 
             c.phone AS customer_phone,
             o.employee_id, 
             e.employee_name, 
             o.table_id, 
             t.table_name, 
             TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date, 
             o.total_amount, 
             o.status,
             p.payment_id,
             p.payment_method,
             p.status AS payment_status
      FROM ORDERS o
      LEFT JOIN CUSTOMER c ON o.customer_id = c.customer_id
      JOIN EMPLOYEE e ON o.employee_id = e.employee_id
      JOIN CAFE_TABLE t ON o.table_id = t.table_id
      LEFT JOIN PAYMENT p ON o.order_id = p.order_id
      WHERE o.order_id = :id
    `;
    const orderRes = await db.execute(orderSql, { id: Number(id) });
    if (orderRes.rows.length === 0) {
      return response.error(res, 'Không tìm thấy đơn hàng.', 404);
    }

    const order = orderRes.rows[0];

    // Lấy chi tiết các món
    const itemsSql = `
      SELECT od.order_id, 
             od.product_id, 
             pr.product_name, 
             pr.unit,
             od.quantity, 
             od.unit_price, 
             od.subtotal
      FROM ORDER_DETAIL od
      JOIN PRODUCT pr ON od.product_id = pr.product_id
      WHERE od.order_id = :id
      ORDER BY od.product_id ASC
    `;
    const itemsRes = await db.execute(itemsSql, { id: Number(id) });
    order.items = itemsRes.rows;

    return response.success(res, order);
  } catch (err) {
    next(err);
  }
};

// POST /api/orders - Tạo mới đơn hàng (Transaction qua orderService)
export const createOrder = async (req, res, next) => {
  try {
    const result = await orderService.createOrderTransaction(req.body);
    return response.success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (ví dụ: HỦY ĐƠN)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !status.trim()) {
      return response.error(res, 'Trạng thái không được để trống.', 400);
    }

    const check = await db.execute(
      `SELECT order_id, table_id FROM ORDERS WHERE order_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy đơn hàng để cập nhật.', 404);
    }

    const tableId = check.rows[0].table_id;
    const newStatus = status.trim().toUpperCase();

    await db.execute(
      `UPDATE ORDERS SET status = :status WHERE order_id = :id`,
      { status: newStatus, id: Number(id) }
    );

    // Nếu đơn đã hủy hoặc hoàn thành thì cập nhật bàn về AVAILABLE
    if (newStatus === 'CANCELLED' || newStatus === 'COMPLETED') {
      await db.execute(
        `UPDATE CAFE_TABLE SET status = 'AVAILABLE' WHERE table_id = :tableId`,
        { tableId }
      );
    }

    return response.success(res, {
      order_id: Number(id),
      status: newStatus
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id - Xóa đơn hàng (kèm xóa chi tiết và thanh toán nếu có)
export const deleteOrder = async (req, res, next) => {
  let conn;
  try {
    const { id } = req.params;

    conn = await db.getConnection();

    const check = await conn.execute(
      `SELECT order_id, table_id FROM ORDERS WHERE order_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy đơn hàng để xóa.', 404);
    }

    const tableId = check.rows[0].TABLE_ID || check.rows[0].table_id;

    // Xóa PAYMENT
    await conn.execute(`DELETE FROM PAYMENT WHERE order_id = :id`, { id: Number(id) }, { autoCommit: false });
    // Xóa ORDER_DETAIL
    await conn.execute(`DELETE FROM ORDER_DETAIL WHERE order_id = :id`, { id: Number(id) }, { autoCommit: false });
    // Xóa ORDERS
    await conn.execute(`DELETE FROM ORDERS WHERE order_id = :id`, { id: Number(id) }, { autoCommit: false });

    // Trả bàn về AVAILABLE
    await conn.execute(
      `UPDATE CAFE_TABLE SET status = 'AVAILABLE' WHERE table_id = :tableId`,
      { tableId },
      { autoCommit: false }
    );

    await conn.commit();
    return response.success(res, { message: 'Đã xóa đơn hàng thành công.' });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (e) {}
    }
    next(err);
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) {}
    }
  }
};

const orderController = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder
};

export default orderController;
