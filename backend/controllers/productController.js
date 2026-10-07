import db from '../config/database.js';
import response from '../utils/response.js';
import oracledb from 'oracledb';

// GET /api/products - Lấy danh sách sản phẩm (có JOIN CATEGORY, hỗ trợ filter & search)
export const getAllProducts = async (req, res, next) => {
  try {
    const { category_id, search, status } = req.query;

    let sql = `
      SELECT p.product_id, 
             p.product_name, 
             p.price, 
             p.unit, 
             p.description, 
             p.status, 
             p.category_id, 
             c.category_name
      FROM PRODUCT p
      LEFT JOIN CATEGORY c ON p.category_id = c.category_id
      WHERE 1=1
    `;
    const binds = {};

    if (category_id) {
      sql += ` AND p.category_id = :category_id`;
      binds.category_id = Number(category_id);
    }

    if (status) {
      sql += ` AND p.status = :status`;
      binds.status = status;
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(p.product_name) LIKE :search OR LOWER(c.category_name) LIKE :search)`;
      binds.search = `%${search.trim().toLowerCase()}%`;
    }

    sql += ` ORDER BY p.product_id ASC`;

    const result = await db.execute(sql, binds);
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id - Lấy thông tin chi tiết sản phẩm
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT p.product_id, 
             p.product_name, 
             p.price, 
             p.unit, 
             p.description, 
             p.status, 
             p.category_id, 
             c.category_name
      FROM PRODUCT p
      LEFT JOIN CATEGORY c ON p.category_id = c.category_id
      WHERE p.product_id = :id
    `;

    const result = await db.execute(sql, { id: Number(id) });
    if (result.rows.length === 0) {
      return response.error(res, 'Không tìm thấy sản phẩm.', 404);
    }

    return response.success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/products - Thêm sản phẩm mới
export const createProduct = async (req, res, next) => {
  let conn;
  try {
    const { category_id, product_name, price, unit, description, status } = req.body;

    // Validation
    if (!product_name || !product_name.trim()) {
      return response.error(res, 'Tên sản phẩm không được để trống.', 400);
    }
    if (category_id === undefined || category_id === null) {
      return response.error(res, 'Vui lòng chọn danh mục cho sản phẩm.', 400);
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return response.error(res, 'Giá sản phẩm phải là số lớn hơn hoặc bằng 0.', 400);
    }

    // Kiểm tra category_id có tồn tại không
    const catCheck = await db.execute(
      `SELECT category_id, category_name FROM CATEGORY WHERE category_id = :catId`,
      { catId: Number(category_id) }
    );
    if (catCheck.rows.length === 0) {
      return response.error(res, 'Danh mục không tồn tại.', 400);
    }
    const category_name = catCheck.rows[0].category_name;

    conn = await db.getConnection();
    const hasIdentity = await db.isIdentityColumn(conn, 'PRODUCT', 'PRODUCT_ID');

    let newId;
    if (hasIdentity) {
      const result = await conn.execute(
        `INSERT INTO PRODUCT (category_id, product_name, price, unit, description, status) 
         VALUES (:category_id, :product_name, :price, :unit, :description, :status) 
         RETURNING product_id INTO :new_id`,
        {
          category_id: Number(category_id),
          product_name: product_name.trim(),
          price: Number(price),
          unit: unit ? unit.trim() : null,
          description: description ? description.trim() : null,
          status: status || 'ACTIVE',
          new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      newId = result.outBinds.new_id[0];
    } else {
      newId = await db.getNextId(conn, 'PRODUCT', 'product_id');
      await conn.execute(
        `INSERT INTO PRODUCT (product_id, category_id, product_name, price, unit, description, status) 
         VALUES (:product_id, :category_id, :product_name, :price, :unit, :description, :status)`,
        {
          product_id: newId,
          category_id: Number(category_id),
          product_name: product_name.trim(),
          price: Number(price),
          unit: unit ? unit.trim() : null,
          description: description ? description.trim() : null,
          status: status || 'ACTIVE'
        },
        { autoCommit: true }
      );
    }

    const created = {
      product_id: newId,
      category_id: Number(category_id),
      category_name,
      product_name: product_name.trim(),
      price: Number(price),
      unit: unit ? unit.trim() : null,
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

// PUT /api/products/:id - Cập nhật thông tin sản phẩm
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_id, product_name, price, unit, description, status } = req.body;

    if (!product_name || !product_name.trim()) {
      return response.error(res, 'Tên sản phẩm không được để trống.', 400);
    }
    if (category_id === undefined || category_id === null) {
      return response.error(res, 'Vui lòng chọn danh mục cho sản phẩm.', 400);
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return response.error(res, 'Giá sản phẩm phải là số lớn hơn hoặc bằng 0.', 400);
    }

    const check = await db.execute(
      `SELECT product_id FROM PRODUCT WHERE product_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy sản phẩm để cập nhật.', 404);
    }

    await db.execute(
      `UPDATE PRODUCT 
       SET category_id = :category_id,
           product_name = :product_name,
           price = :price,
           unit = :unit,
           description = :description,
           status = :status
       WHERE product_id = :id`,
      {
        id: Number(id),
        category_id: Number(category_id),
        product_name: product_name.trim(),
        price: Number(price),
        unit: unit ? unit.trim() : null,
        description: description ? description.trim() : null,
        status: status || 'ACTIVE'
      }
    );

    return response.success(res, {
      product_id: Number(id),
      category_id: Number(category_id),
      product_name: product_name.trim(),
      price: Number(price),
      unit: unit ? unit.trim() : null,
      description: description ? description.trim() : null,
      status: status || 'ACTIVE'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id - Xóa sản phẩm
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await db.execute(
      `SELECT product_id FROM PRODUCT WHERE product_id = :id`,
      { id: Number(id) }
    );
    if (check.rows.length === 0) {
      return response.error(res, 'Không tìm thấy sản phẩm để xóa.', 404);
    }

    await db.execute(
      `DELETE FROM PRODUCT WHERE product_id = :id`,
      { id: Number(id) }
    );

    return response.success(res, { message: 'Đã xóa sản phẩm thành công.' });
  } catch (err) {
    next(err);
  }
};

const productController = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

export default productController;
