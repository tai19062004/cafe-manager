import db from '../config/database.js';
import response from '../utils/response.js';
import oracledb from 'oracledb';

// GET /api/customers - Lấy danh sách khách hàng (hỗ trợ tìm kiếm theo tên, phone, email)
export const getAllCustomers = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    let sql = `
      SELECT customer_id, customer_name, phone, email, address, status 
      FROM CUSTOMER 
      WHERE 1=1
    `;
    const binds = {};

    if (status) {
      sql += ` AND status = :status`;
      binds.status = status;
    }

    if (search && search.trim()) {
      sql += ` AND (
        LOWER(customer_name) LIKE :search OR 
        LOWER(phone) LIKE :search OR 
        LOWER(email) LIKE :search
      )`;
      binds.search = `%${search.trim().toLowerCase()}%`;
    }

    sql += ` ORDER BY customer_id DESC`;

    const result = await db.execute(sql, binds);
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id - Lấy thông tin 1 khách hàng
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute(
      `SELECT customer_id, customer_name, phone, email, address, status 
       FROM CUSTOMER 
       WHERE customer_id = :id`,
      { id: Number(id) }
    );

    if (result.rows.length === 0) {
      return response.error(res, 'Không tìm thấy khách hàng.', 404);
    }

    return response.success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/customers - Thêm khách hàng mới
export const createCustomer = async (req, res, next) => {
  let conn;
  try {
    const { customer_name, phone, email, address, status } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return response.error(res, 'Tên khách hàng không được để trống.', 400);
    }

    // Email format validation nếu có
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return response.error(res, 'Định dạng email không hợp lệ.', 400);
      }
    }

    conn = await db.getConnection();
    const hasIdentity = await db.isIdentityColumn(conn, 'CUSTOMER', 'CUSTOMER_ID');

    let newId;
    if (hasIdentity) {
      const result = await conn.execute(
        `INSERT INTO CUSTOMER (customer_name, phone, email, address, status) 
         VALUES (:customer_name, :phone, :email, :address, :status) 
         RETURNING customer_id INTO :new_id`,
        {
          customer_name: customer_name.trim(),
          phone: phone ? phone.trim() : null,
          email: email ? email.trim() : null,
          address: address ? address.trim() : null,
          status: status || 'ACTIVE',
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      newId = result.outBinds.new_id[0];
    } else {
      newId = await db.getNextId(conn, 'CUSTOMER', 'customer_id');
      await conn.execute(
        `INSERT INTO CUSTOMER (customer_id, customer_name, phone, email, address, status) 
         VALUES (:customer_id, :customer_name, :phone, :email, :address, :status)`,
        {
          customer_id: newId,
          customer_name: customer_name.trim(),
          phone: phone ? phone.trim() : null,
          email: email ? email.trim() : null,
          address: address ? address.trim() : null,
          status: status || 'ACTIVE'
        },
        { autoCommit: true }
      );
    }

    const created = {
      customer_id: newId,
      customer_name: customer_name.trim(),
      phone: phone ? phone.trim() : null,
      email: email ? email.trim() : null,
      address: address ? address.trim() : null,
      status: status || 'ACTIVE'
    };

    return response.success(res, created, 201);
  } catch (err) {
    next(err);
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) {}
    }
  }
};

// PUT /api/customers/:id - Cập nhật khách hàng
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customer_name, phone, email, address, status } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return response.error(res, 'Tên khách hàng không được để trống.', 400);
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return response.error(res, 'Định dạng email không hợp lệ.', 400);
      }
    }

    const check = await db.execute(
      `SELECT customer_id FROM CUSTOMER WHERE customer_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy khách hàng để cập nhật.', 404);
    }

    await db.execute(
      `UPDATE CUSTOMER 
       SET customer_name = :customer_name,
           phone = :phone,
           email = :email,
           address = :address,
           status = :status
       WHERE customer_id = :id`,
      {
        id: Number(id),
        customer_name: customer_name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        status: status || 'ACTIVE'
      }
    );

    return response.success(res, {
      customer_id: Number(id),
      customer_name: customer_name.trim(),
      phone: phone ? phone.trim() : null,
      email: email ? email.trim() : null,
      address: address ? address.trim() : null,
      status: status || 'ACTIVE'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/customers/:id - Xóa khách hàng
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await db.execute(
      `SELECT customer_id FROM CUSTOMER WHERE customer_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy khách hàng để xóa.', 404);
    }

    await db.execute(
      `DELETE FROM CUSTOMER WHERE customer_id = :id`,
      { id: Number(id) }
    );

    return response.success(res, { message: 'Đã xóa khách hàng thành công.' });
  } catch (err) {
    next(err);
  }
};

const customerController = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

export default customerController;
