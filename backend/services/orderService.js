import db from '../config/database.js';
import oracledb from 'oracledb';

/**
 * Tạo đơn hàng với Oracle Transaction hoàn chỉnh:
 * 1. Validate customer, employee, table
 * 2. Lấy giá sản phẩm trực tiếp từ DB
 * 3. Tính toán subtotal và total_amount
 * 4. INSERT ORDERS
 * 5. INSERT ORDER_DETAIL
 * 6. INSERT PAYMENT
 * 7. Cập nhật trạng thái bàn thành OCCUPIED
 * 8. COMMIT nếu thành công, ROLLBACK nếu có bất kỳ lỗi nào
 */
export async function createOrderTransaction(orderData) {
  const { customer_id, employee_id, table_id, items, payment_method } = orderData;

  // 1. Validation cơ bản đầu vào
  if (!employee_id) {
    const error = new Error('Vui lòng chọn nhân viên phục vụ.');
    error.statusCode = 400;
    throw error;
  }
  if (!table_id) {
    const error = new Error('Vui lòng chọn bàn café.');
    error.statusCode = 400;
    throw error;
  }
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Đơn hàng phải có ít nhất 1 món.');
    error.statusCode = 400;
    throw error;
  }

  let conn;
  try {
    conn = await db.getConnection();

    // 2. Validate Employee
    const empCheck = await conn.execute(
      `SELECT employee_id, employee_name FROM EMPLOYEE WHERE employee_id = :id`,
      { id: Number(employee_id) }
    );
    if (empCheck.rows.length === 0) {
      const error = new Error(`Nhân viên với mã ${employee_id} không tồn tại.`);
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate Table
    const tableCheck = await conn.execute(
      `SELECT table_id, table_name, status FROM CAFE_TABLE WHERE table_id = :id`,
      { id: Number(table_id) }
    );
    if (tableCheck.rows.length === 0) {
      const error = new Error(`Bàn với mã ${table_id} không tồn tại.`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Validate Customer (nếu có cung cấp)
    if (customer_id) {
      const custCheck = await conn.execute(
        `SELECT customer_id, customer_name FROM CUSTOMER WHERE customer_id = :id`,
        { id: Number(customer_id) }
      );
      if (custCheck.rows.length === 0) {
        const error = new Error(`Khách hàng với mã ${customer_id} không tồn tại.`);
        error.statusCode = 400;
        throw error;
      }
    }

    // 5. Lấy giá sản phẩm từ Oracle & tính Subtotal, Total Amount
    let total_amount = 0;
    const processedItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;
      const q = Number(quantity);
      if (!product_id || isNaN(q) || q <= 0) {
        const error = new Error('Số lượng sản phẩm phải lớn hơn 0.');
        error.statusCode = 400;
        throw error;
      }

      const prodRes = await conn.execute(
        `SELECT product_id, product_name, price, status FROM PRODUCT WHERE product_id = :id`,
        { id: Number(product_id) }
      );
      if (prodRes.rows.length === 0) {
        const error = new Error(`Sản phẩm với mã ${product_id} không tồn tại.`);
        error.statusCode = 400;
        throw error;
      }

      const product = prodRes.rows[0];
      const unit_price = Number(product.PRICE || product.price);
      const subtotal = unit_price * q;
      total_amount += subtotal;

      processedItems.push({
        product_id: Number(product_id),
        product_name: product.PRODUCT_NAME || product.product_name,
        quantity: q,
        unit_price,
        subtotal
      });
    }

    // 6. Kiểm tra xem ORDERS có cột IDENTITY không
    const orderHasIdentity = await db.isIdentityColumn(conn, 'ORDERS', 'ORDER_ID');
    let order_id;

    if (orderHasIdentity) {
      const orderInsertRes = await conn.execute(
        `INSERT INTO ORDERS (customer_id, employee_id, table_id, order_date, total_amount, status)
         VALUES (:customer_id, :employee_id, :table_id, SYSDATE, :total_amount, 'COMPLETED')
         RETURNING order_id INTO :new_order_id`,
        {
          customer_id: customer_id ? Number(customer_id) : null,
          employee_id: Number(employee_id),
          table_id: Number(table_id),
          total_amount,
          new_order_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: false }
      );
      order_id = orderInsertRes.outBinds.new_order_id[0];
    } else {
      order_id = await db.getNextId(conn, 'ORDERS', 'order_id');
      await conn.execute(
        `INSERT INTO ORDERS (order_id, customer_id, employee_id, table_id, order_date, total_amount, status)
         VALUES (:order_id, :customer_id, :employee_id, :table_id, SYSDATE, :total_amount, 'COMPLETED')`,
        {
          order_id,
          customer_id: customer_id ? Number(customer_id) : null,
          employee_id: Number(employee_id),
          table_id: Number(table_id),
          total_amount
        },
        { autoCommit: false }
      );
    }

    // 7. INSERT ORDER_DETAIL cho từng món
    for (const item of processedItems) {
      await conn.execute(
        `INSERT INTO ORDER_DETAIL (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (:order_id, :product_id, :quantity, :unit_price, :subtotal)`,
        {
          order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        },
        { autoCommit: false }
      );
    }

    // 8. INSERT PAYMENT
    const paymentHasIdentity = await db.isIdentityColumn(conn, 'PAYMENT', 'PAYMENT_ID');
    let payment_id;
    const finalMethod = (payment_method && payment_method.trim()) ? payment_method.trim().toUpperCase() : 'CASH';

    if (paymentHasIdentity) {
      const payInsertRes = await conn.execute(
        `INSERT INTO PAYMENT (order_id, payment_date, amount, payment_method, status)
         VALUES (:order_id, SYSDATE, :amount, :payment_method, 'PAID')
         RETURNING payment_id INTO :new_payment_id`,
        {
          order_id,
          amount: total_amount,
          payment_method: finalMethod,
          new_payment_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: false }
      );
      payment_id = payInsertRes.outBinds.new_payment_id[0];
    } else {
      payment_id = await db.getNextId(conn, 'PAYMENT', 'payment_id');
      await conn.execute(
        `INSERT INTO PAYMENT (payment_id, order_id, payment_date, amount, payment_method, status)
         VALUES (:payment_id, :order_id, SYSDATE, :amount, :payment_method, 'PAID')`,
        {
          payment_id,
          order_id,
          amount: total_amount,
          payment_method: finalMethod
        },
        { autoCommit: false }
      );
    }

    // 9. Cập nhật trạng thái bàn sang OCCUPIED
    await conn.execute(
      `UPDATE CAFE_TABLE SET status = 'OCCUPIED' WHERE table_id = :table_id`,
      { table_id: Number(table_id) },
      { autoCommit: false }
    );

    // 10. COMMIT TRANSACTION - Toàn bộ dữ liệu được ghi nhận vào Oracle
    await conn.commit();

    return {
      order_id,
      customer_id: customer_id ? Number(customer_id) : null,
      employee_id: Number(employee_id),
      table_id: Number(table_id),
      total_amount,
      status: 'COMPLETED',
      items: processedItems,
      payment: {
        payment_id,
        order_id,
        amount: total_amount,
        payment_method: finalMethod,
        status: 'PAID'
      }
    };
  } catch (err) {
    // 11. ROLLBACK TRANSACTION - Hủy bỏ tất cả các câu lệnh nếu có lỗi
    if (conn) {
      try {
        await conn.rollback();
        console.warn('⚠️ Đã ROLLBACK transaction do có lỗi:', err.message);
      } catch (rbErr) {
        console.error('Lỗi khi rollback:', rbErr);
      }
    }
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (cErr) {
        console.error('Lỗi khi đóng connection:', cErr);
      }
    }
  }
}

export default {
  createOrderTransaction
};
