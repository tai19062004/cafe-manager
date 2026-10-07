import db from '../config/database.js';
import response from '../utils/response.js';
import oracledb from 'oracledb';

// GET /api/employees - Lấy danh sách nhân viên
export const getAllEmployees = async (req, res, next) => {
  try {
    const { search, status, position } = req.query;

    let sql = `
      SELECT employee_id, employee_name, phone, email, position, salary, status 
      FROM EMPLOYEE 
      WHERE 1=1
    `;
    const binds = {};

    if (status) {
      sql += ` AND status = :status`;
      binds.status = status;
    }

    if (position) {
      sql += ` AND LOWER(position) = :position`;
      binds.position = position.toLowerCase();
    }

    if (search && search.trim()) {
      sql += ` AND (
        LOWER(employee_name) LIKE :search OR 
        LOWER(phone) LIKE :search OR 
        LOWER(email) LIKE :search
      )`;
      binds.search = `%${search.trim().toLowerCase()}%`;
    }

    sql += ` ORDER BY employee_id ASC`;

    const result = await db.execute(sql, binds);
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:id - Lấy thông tin 1 nhân viên
export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute(
      `SELECT employee_id, employee_name, phone, email, position, salary, status 
       FROM EMPLOYEE 
       WHERE employee_id = :id`,
      { id: Number(id) }
    );

    if (result.rows.length === 0) {
      return response.error(res, 'Không tìm thấy nhân viên.', 404);
    }

    return response.success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/employees - Thêm nhân viên mới
export const createEmployee = async (req, res, next) => {
  let conn;
  try {
    const { employee_name, phone, email, position, salary, status } = req.body;

    if (!employee_name || !employee_name.trim()) {
      return response.error(res, 'Tên nhân viên không được để trống.', 400);
    }

    if (salary !== undefined && salary !== null && Number(salary) < 0) {
      return response.error(res, 'Lương nhân viên không được âm.', 400);
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return response.error(res, 'Định dạng email không hợp lệ.', 400);
      }
    }

    conn = await db.getConnection();
    const hasIdentity = await db.isIdentityColumn(conn, 'EMPLOYEE', 'EMPLOYEE_ID');

    let newId;
    if (hasIdentity) {
      const result = await conn.execute(
        `INSERT INTO EMPLOYEE (employee_name, phone, email, position, salary, status) 
         VALUES (:employee_name, :phone, :email, :position, :salary, :status) 
         RETURNING employee_id INTO :new_id`,
        {
          employee_name: employee_name.trim(),
          phone: phone ? phone.trim() : null,
          email: email ? email.trim() : null,
          position: position ? position.trim() : 'Staff',
          salary: salary !== undefined && salary !== null ? Number(salary) : 0,
          status: status || 'ACTIVE',
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      newId = result.outBinds.new_id[0];
    } else {
      newId = await db.getNextId(conn, 'EMPLOYEE', 'employee_id');
      await conn.execute(
        `INSERT INTO EMPLOYEE (employee_id, employee_name, phone, email, position, salary, status) 
         VALUES (:employee_id, :employee_name, :phone, :email, :position, :salary, :status)`,
        {
          employee_id: newId,
          employee_name: employee_name.trim(),
          phone: phone ? phone.trim() : null,
          email: email ? email.trim() : null,
          position: position ? position.trim() : 'Staff',
          salary: salary !== undefined && salary !== null ? Number(salary) : 0,
          status: status || 'ACTIVE'
        },
        { autoCommit: true }
      );
    }

    const created = {
      employee_id: newId,
      employee_name: employee_name.trim(),
      phone: phone ? phone.trim() : null,
      email: email ? email.trim() : null,
      position: position ? position.trim() : 'Staff',
      salary: salary !== undefined && salary !== null ? Number(salary) : 0,
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

// PUT /api/employees/:id - Cập nhật nhân viên
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employee_name, phone, email, position, salary, status } = req.body;

    if (!employee_name || !employee_name.trim()) {
      return response.error(res, 'Tên nhân viên không được để trống.', 400);
    }

    if (salary !== undefined && salary !== null && Number(salary) < 0) {
      return response.error(res, 'Lương nhân viên không được âm.', 400);
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return response.error(res, 'Định dạng email không hợp lệ.', 400);
      }
    }

    const check = await db.execute(
      `SELECT employee_id FROM EMPLOYEE WHERE employee_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy nhân viên để cập nhật.', 404);
    }

    await db.execute(
      `UPDATE EMPLOYEE 
       SET employee_name = :employee_name,
           phone = :phone,
           email = :email,
           position = :position,
           salary = :salary,
           status = :status
       WHERE employee_id = :id`,
      {
        id: Number(id),
        employee_name: employee_name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        position: position ? position.trim() : 'Staff',
        salary: salary !== undefined && salary !== null ? Number(salary) : 0,
        status: status || 'ACTIVE'
      }
    );

    return response.success(res, {
      employee_id: Number(id),
      employee_name: employee_name.trim(),
      phone: phone ? phone.trim() : null,
      email: email ? email.trim() : null,
      position: position ? position.trim() : 'Staff',
      salary: salary !== undefined && salary !== null ? Number(salary) : 0,
      status: status || 'ACTIVE'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employees/:id - Xóa nhân viên
export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await db.execute(
      `SELECT employee_id FROM EMPLOYEE WHERE employee_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy nhân viên để xóa.', 404);
    }

    await db.execute(
      `DELETE FROM EMPLOYEE WHERE employee_id = :id`,
      { id: Number(id) }
    );

    return response.success(res, { message: 'Đã xóa nhân viên thành công.' });
  } catch (err) {
    next(err);
  }
};

const employeeController = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};

export default employeeController;
