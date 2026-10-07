import db from '../config/database.js';
import response from '../utils/response.js';
import oracledb from 'oracledb';

// GET /api/categories - Lấy danh sách danh mục
export const getAllCategories = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT category_id, category_name, description, status 
       FROM CATEGORY 
       ORDER BY category_id ASC`
    );
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:id - Lấy thông tin 1 danh mục theo ID
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute(
      `SELECT category_id, category_name, description, status 
       FROM CATEGORY 
       WHERE category_id = :id`,
      { id: Number(id) }
    );

    if (result.rows.length === 0) {
      return response.error(res, 'Không tìm thấy danh mục.', 404);
    }

    return response.success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/categories - Thêm mới danh mục
export const createCategory = async (req, res, next) => {
  let conn;
  try {
    const { category_name, description, status } = req.body;

    if (!category_name || !category_name.trim()) {
      return response.error(res, 'Tên danh mục không được để trống.', 400);
    }

    conn = await db.getConnection();
    const hasIdentity = await db.isIdentityColumn(conn, 'CATEGORY', 'CATEGORY_ID');

    let newId;
    if (hasIdentity) {
      const result = await conn.execute(
        `INSERT INTO CATEGORY (category_name, description, status) 
         VALUES (:category_name, :description, :status) 
         RETURNING category_id INTO :new_id`,
        {
          category_name: category_name.trim(),
          description: description ? description.trim() : null,
          status: status || 'ACTIVE',
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      newId = result.outBinds.new_id[0];
    } else {
      newId = await db.getNextId(conn, 'CATEGORY', 'category_id');
      await conn.execute(
        `INSERT INTO CATEGORY (category_id, category_name, description, status) 
         VALUES (:category_id, :category_name, :description, :status)`,
        {
          category_id: newId,
          category_name: category_name.trim(),
          description: description ? description.trim() : null,
          status: status || 'ACTIVE'
        },
        { autoCommit: true }
      );
    }

    const created = {
      category_id: newId,
      category_name: category_name.trim(),
      description: description ? description.trim() : null,
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

// PUT /api/categories/:id - Cập nhật danh mục
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_name, description, status } = req.body;

    if (!category_name || !category_name.trim()) {
      return response.error(res, 'Tên danh mục không được để trống.', 400);
    }

    const check = await db.execute(
      `SELECT category_id FROM CATEGORY WHERE category_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy danh mục để cập nhật.', 404);
    }

    await db.execute(
      `UPDATE CATEGORY 
       SET category_name = :category_name, 
           description = :description, 
           status = :status 
       WHERE category_id = :id`,
      {
        id: Number(id),
        category_name: category_name.trim(),
        description: description ? description.trim() : null,
        status: status || 'ACTIVE'
      }
    );

    return response.success(res, {
      category_id: Number(id),
      category_name: category_name.trim(),
      description: description ? description.trim() : null,
      status: status || 'ACTIVE'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id - Xóa danh mục
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await db.execute(
      `SELECT category_id FROM CATEGORY WHERE category_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy danh mục để xóa.', 404);
    }

    await db.execute(
      `DELETE FROM CATEGORY WHERE category_id = :id`,
      { id: Number(id) }
    );

    return response.success(res, { message: 'Đã xóa danh mục thành công.' });
  } catch (err) {
    next(err);
  }
};

const categoryController = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

export default categoryController;
