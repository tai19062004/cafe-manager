import db from '../config/database.js';
import response from '../utils/response.js';
import oracledb from 'oracledb';

// GET /api/tables - Lấy danh sách bàn café
export const getAllTables = async (req, res, next) => {
  try {
    const { status, location } = req.query;

    let sql = `
      SELECT table_id, table_name, capacity, location, status 
      FROM CAFE_TABLE 
      WHERE 1=1
    `;
    const binds = {};

    if (status) {
      sql += ` AND status = :status`;
      binds.status = status;
    }

    if (location) {
      sql += ` AND LOWER(location) LIKE :location`;
      binds.location = `%${location.trim().toLowerCase()}%`;
    }

    sql += ` ORDER BY table_id ASC`;

    const result = await db.execute(sql, binds);
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/tables/:id - Lấy thông tin 1 bàn
export const getTableById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute(
      `SELECT table_id, table_name, capacity, location, status 
       FROM CAFE_TABLE 
       WHERE table_id = :id`,
      { id: Number(id) }
    );

    if (result.rows.length === 0) {
      return response.error(res, 'Không tìm thấy bàn café.', 404);
    }

    return response.success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/tables - Thêm bàn mới
export const createTable = async (req, res, next) => {
  let conn;
  try {
    const { table_name, capacity, location, status } = req.body;

    if (!table_name || !table_name.trim()) {
      return response.error(res, 'Tên bàn không được để trống.', 400);
    }

    if (capacity === undefined || capacity === null || Number(capacity) <= 0) {
      return response.error(res, 'Sức chứa của bàn phải là số nguyên lớn hơn 0.', 400);
    }

    conn = await db.getConnection();
    const hasIdentity = await db.isIdentityColumn(conn, 'CAFE_TABLE', 'TABLE_ID');

    let newId;
    if (hasIdentity) {
      const result = await conn.execute(
        `INSERT INTO CAFE_TABLE (table_name, capacity, location, status) 
         VALUES (:table_name, :capacity, :location, :status) 
         RETURNING table_id INTO :new_id`,
        {
          table_name: table_name.trim(),
          capacity: Math.floor(Number(capacity)),
          location: location ? location.trim() : null,
          status: status || 'AVAILABLE',
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      newId = result.outBinds.new_id[0];
    } else {
      newId = await db.getNextId(conn, 'CAFE_TABLE', 'table_id');
      await conn.execute(
        `INSERT INTO CAFE_TABLE (table_id, table_name, capacity, location, status) 
         VALUES (:table_id, :table_name, :capacity, :location, :status)`,
        {
          table_id: newId,
          table_name: table_name.trim(),
          capacity: Math.floor(Number(capacity)),
          location: location ? location.trim() : null,
          status: status || 'AVAILABLE'
        },
        { autoCommit: true }
      );
    }

    const created = {
      table_id: newId,
      table_name: table_name.trim(),
      capacity: Math.floor(Number(capacity)),
      location: location ? location.trim() : null,
      status: status || 'AVAILABLE'
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

// PUT /api/tables/:id - Cập nhật bàn
export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { table_name, capacity, location, status } = req.body;

    if (!table_name || !table_name.trim()) {
      return response.error(res, 'Tên bàn không được để trống.', 400);
    }

    if (capacity === undefined || capacity === null || Number(capacity) <= 0) {
      return response.error(res, 'Sức chứa của bàn phải là số nguyên lớn hơn 0.', 400);
    }

    const check = await db.execute(
      `SELECT table_id FROM CAFE_TABLE WHERE table_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy bàn để cập nhật.', 404);
    }

    await db.execute(
      `UPDATE CAFE_TABLE 
       SET table_name = :table_name,
           capacity = :capacity,
           location = :location,
           status = :status
       WHERE table_id = :id`,
      {
        id: Number(id),
        table_name: table_name.trim(),
        capacity: Math.floor(Number(capacity)),
        location: location ? location.trim() : null,
        status: status || 'AVAILABLE'
      }
    );

    return response.success(res, {
      table_id: Number(id),
      table_name: table_name.trim(),
      capacity: Math.floor(Number(capacity)),
      location: location ? location.trim() : null,
      status: status || 'AVAILABLE'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tables/:id - Xóa bàn
export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await db.execute(
      `SELECT table_id FROM CAFE_TABLE WHERE table_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy bàn để xóa.', 404);
    }

    await db.execute(
      `DELETE FROM CAFE_TABLE WHERE table_id = :id`,
      { id: Number(id) }
    );

    return response.success(res, { message: 'Đã xóa bàn thành công.' });
  } catch (err) {
    next(err);
  }
};

const tableController = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
};

export default tableController;
