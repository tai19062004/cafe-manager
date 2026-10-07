import db from '../config/database.js';
import response from '../utils/response.js';

// GET /api/order-details/by-order/:orderId - Lấy các món của một đơn hàng
export const getOrderDetailsByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const sql = `
      SELECT od.order_id, 
             od.product_id, 
             p.product_name, 
             p.unit, 
             od.quantity, 
             od.unit_price, 
             od.subtotal
      FROM ORDER_DETAIL od
      JOIN PRODUCT p ON od.product_id = p.product_id
      WHERE od.order_id = :orderId
      ORDER BY od.product_id ASC
    `;

    const result = await db.execute(sql, { orderId: Number(orderId) });
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/order-details - Lấy tất cả chi tiết đơn hàng
export const getAllOrderDetails = async (req, res, next) => {
  try {
    const sql = `
      SELECT od.order_id, 
             od.product_id, 
             p.product_name, 
             od.quantity, 
             od.unit_price, 
             od.subtotal
      FROM ORDER_DETAIL od
      JOIN PRODUCT p ON od.product_id = p.product_id
      ORDER BY od.order_id DESC
    `;
    const result = await db.execute(sql);
    return response.success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

const orderDetailController = {
  getOrderDetailsByOrderId,
  getAllOrderDetails
};

export default orderDetailController;
