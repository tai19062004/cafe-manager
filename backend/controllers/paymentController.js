import db from '../config/database.js';
import response from '../utils/response.js';
import oracledb from 'oracledb';

// GET /api/payments - Lấy danh sách phiếu thanh toán (JOIN ORDERS & CUSTOMER)
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, payment_method } = req.query;

    let sql = `
      SELECT p.payment_id, 
             p.order_id, 
             TO_CHAR(p.payment_date, 'YYYY-MM-DD HH24:MI:SS') AS payment_date, 
             p.amount, 
             p.payment_method, 
             p.status,
             o.total_amount AS order_total,
             c.customer_name,
             t.table_name
      FROM PAYMENT p
      JOIN ORDERS o ON p.order_id = o.order_id
      LEFT JOIN CUSTOMER c ON o.customer_id = c.customer_id
      JOIN CAFE_TABLE t ON o.table_id = t.table_id
      WHERE 1=1
    `;
    const binds = {};

    if (status) {
      sql += ` AND p.status = :status`;
      binds.status = status;
    }
    if (payment_method) {
      sql += ` AND UPPER(p.payment_method) = :payment_method`;
      binds.payment_method = payment_method.toUpperCase();
    }

    sql += ` ORDER BY p.payment_id DESC`;

    const result = await db.execute(sql, binds);
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/:id - Lấy chi tiết 1 phiếu thanh toán
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT p.payment_id, 
             p.order_id, 
             TO_CHAR(p.payment_date, 'YYYY-MM-DD HH24:MI:SS') AS payment_date, 
             p.amount, 
             p.payment_method, 
             p.status,
             o.total_amount AS order_total,
             c.customer_name,
             t.table_name
      FROM PAYMENT p
      JOIN ORDERS o ON p.order_id = o.order_id
      LEFT JOIN CUSTOMER c ON o.customer_id = c.customer_id
      JOIN CAFE_TABLE t ON o.table_id = t.table_id
      WHERE p.payment_id = :id
    `;

    const result = await db.execute(sql, { id: Number(id) });
    if (result.rows.length === 0) {
      return response.error(res, 'Không tìm thấy thông tin thanh toán.', 404);
    }

    return response.success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/payments - Thêm mới thanh toán thủ công (nếu cần)
export const createPayment = async (req, res, next) => {
  let conn;
  try {
    const { order_id, amount, payment_method, status } = req.body;

    if (!order_id) {
      return response.error(res, 'Vui lòng cung cấp mã đơn hàng (order_id).', 400);
    }
    if (amount === undefined || amount === null || Number(amount) < 0) {
      return response.error(res, 'Số tiền thanh toán phải lớn hơn hoặc bằng 0.', 400);
    }

    conn = await db.getConnection();

    // Kiểm tra đơn hàng có tồn tại không
    const orderCheck = await conn.execute(
      `SELECT order_id FROM ORDERS WHERE order_id = :id`,
      { id: Number(order_id) }
    );
    if (orderCheck.rows.length === 0) {
      return response.error(res, 'Đơn hàng không tồn tại.', 400);
    }

    // Kiểm tra đơn hàng đã có thanh toán chưa (vì order_id UNIQUE trong PAYMENT)
    const payCheck = await conn.execute(
      `SELECT payment_id FROM PAYMENT WHERE order_id = :id`,
      { id: Number(order_id) }
    );
    if (payCheck.rows.length > 0) {
      return response.error(res, 'Đơn hàng này đã được tạo thanh toán trước đó.', 400);
    }

    const hasIdentity = await db.isIdentityColumn(conn, 'PAYMENT', 'PAYMENT_ID');
    const finalMethod = (payment_method && payment_method.trim()) ? payment_method.trim().toUpperCase() : 'CASH';
    const finalStatus = status || 'PAID';

    let newId;
    if (hasIdentity) {
      const result = await conn.execute(
        `INSERT INTO PAYMENT (order_id, payment_date, amount, payment_method, status) 
         VALUES (:order_id, SYSDATE, :amount, :payment_method, :status) 
         RETURNING payment_id INTO :new_id`,
        {
          order_id: Number(order_id),
          amount: Number(amount),
          payment_method: finalMethod,
          status: finalStatus,
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      newId = result.outBinds.new_id[0];
    } else {
      newId = await db.getNextId(conn, 'PAYMENT', 'payment_id');
      await conn.execute(
        `INSERT INTO PAYMENT (payment_id, order_id, payment_date, amount, payment_method, status) 
         VALUES (:payment_id, :order_id, SYSDATE, :amount, :payment_method, :status)`,
        {
          payment_id: newId,
          order_id: Number(order_id),
          amount: Number(amount),
          payment_method: finalMethod,
          status: finalStatus
        },
        { autoCommit: true }
      );
    }

    return response.success(res, {
      payment_id: newId,
      order_id: Number(order_id),
      amount: Number(amount),
      payment_method: finalMethod,
      status: finalStatus
    }, 201);
  } catch (err) {
    next(err);
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) {}
    }
  }
};

// PUT /api/payments/:id - Cập nhật thông tin thanh toán (phương thức / trạng thái)
export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_method, status } = req.body;

    const check = await db.execute(
      `SELECT payment_id FROM PAYMENT WHERE payment_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy thanh toán để cập nhật.', 404);
    }

    await db.execute(
      `UPDATE PAYMENT 
       SET payment_method = NVL(:payment_method, payment_method),
           status = NVL(:status, status)
       WHERE payment_id = :id`,
      {
        id: Number(id),
        payment_method: payment_method ? payment_method.toUpperCase() : null,
        status: status || null
      }
    );

    return response.success(res, { message: 'Cập nhật thanh toán thành công.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/payments/:id - Xóa thanh toán
export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await db.execute(
      `SELECT payment_id FROM PAYMENT WHERE payment_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy thanh toán để xóa.', 404);
    }

    await db.execute(
      `DELETE FROM PAYMENT WHERE payment_id = :id`,
      { id: Number(id) }
    );

    return response.success(res, { message: 'Đã xóa phiếu thanh toán thành công.' });
  } catch (err) {
    next(err);
  }
};

const paymentController = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};

export default paymentController;
