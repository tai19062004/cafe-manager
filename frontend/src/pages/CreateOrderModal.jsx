import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../components/Modal';
import { createOrderRequest } from '../redux/slices/orderSlice.js';
import { fetchCustomersRequest } from '../redux/slices/customerSlice.js';
import { fetchEmployeesRequest } from '../redux/slices/employeeSlice.js';
import { fetchTablesRequest } from '../redux/slices/tableSlice.js';
import { fetchProductsRequest } from '../redux/slices/productSlice.js';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2 } from 'lucide-react';

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customer);
  const { employees } = useSelector((state) => state.employee);
  const { tables } = useSelector((state) => state.table);
  const { products } = useSelector((state) => state.product);

  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [tableId, setTableId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Items: [{ product_id, quantity, price, subtotal }]
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCustomersRequest({ params: { status: 'ACTIVE' } }));
      dispatch(fetchEmployeesRequest({ params: { status: 'ACTIVE' } }));
      dispatch(fetchTablesRequest());
      dispatch(fetchProductsRequest({ params: { status: 'ACTIVE' } }));
    }
  }, [dispatch, isOpen]);

  // Set default selection when data arrives
  useEffect(() => {
    if (isOpen) {
      if (employees.length > 0 && !employeeId) {
        setEmployeeId(employees[0].employee_id);
      }
      if (tables.length > 0 && !tableId) {
        const available = tables.find((t) => t.status === 'AVAILABLE');
        if (available) setTableId(available.table_id);
        else setTableId(tables[0].table_id);
      }
      if (products.length > 0 && items.length === 0) {
        const first = products[0];
        setItems([
          {
            product_id: first.product_id,
            quantity: 1,
            price: Number(first.price),
            subtotal: Number(first.price)
          }
        ]);
      }
    }
  }, [isOpen, employees, tables, products]);

  const handleProductChange = (index, prodId) => {
    const selectedProd = products.find((p) => p.product_id === Number(prodId));
    if (!selectedProd) return;

    const newItems = [...items];
    const unitPrice = Number(selectedProd.price);
    const quantity = newItems[index].quantity || 1;
    newItems[index] = {
      product_id: Number(prodId),
      quantity,
      price: unitPrice,
      subtotal: unitPrice * quantity
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const q = Math.max(1, parseInt(qty) || 1);
    const newItems = [...items];
    newItems[index].quantity = q;
    newItems[index].subtotal = (newItems[index].price || 0) * q;
    setItems(newItems);
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const first = products[0];
    setItems([
      ...items,
      {
        product_id: first.product_id,
        quantity: 1,
        price: Number(first.price),
        subtotal: Number(first.price)
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      showToast('Đơn hàng phải có ít nhất 1 món.', 'error');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employeeId) {
      showToast('Vui lòng chọn nhân viên phục vụ.', 'error');
      return;
    }
    if (!tableId) {
      showToast('Vui lòng chọn bàn café.', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 món vào đơn hàng.', 'error');
      return;
    }

    setLoading(true);
    const payload = {
      customer_id: customerId ? Number(customerId) : null,
      employee_id: Number(employeeId),
      table_id: Number(tableId),
      items: items.map((it) => ({
        product_id: Number(it.product_id),
        quantity: Number(it.quantity)
      })),
      payment_method: paymentMethod
    };

    dispatch(
      createOrderRequest({
        data: payload,
        onSuccess: (createdOrder) => {
          setLoading(false);
          showToast(`Tạo đơn #${createdOrder.order_id} thành công qua Redux Saga & Oracle!`);
          onClose();
          if (onOrderCreated) onOrderCreated();
        },
        onError: (msg) => {
          setLoading(false);
          showToast(msg, 'error');
        },
      })
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Đơn Hàng Mới (Redux Saga Transaction)" maxWidth={720}>
      <form onSubmit={handleSubmit}>
        {/* Thông tin phục vụ: Bàn, Khách hàng, Nhân viên */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          marginBottom: 20
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chọn Bàn *</label>
            <select
              className="form-select"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              required
            >
              {tables.map((t) => (
                <option key={t.table_id} value={t.table_id}>
                  {t.table_name} ({t.status === 'AVAILABLE' ? 'Trống' : t.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nhân viên phục vụ *</label>
            <select
              className="form-select"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.employee_name} ({emp.position})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Khách hàng (Tùy chọn)</label>
            <select
              className="form-select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">-- Khách vãng lai --</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.customer_name} ({c.phone || 'Không SĐT'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Danh sách món gọi */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Danh sách món gọi ({items.length} món)
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} /> Thêm món
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border)'
                }}
              >
                {/* Dropdown món */}
                <div>
                  <select
                    className="form-select"
                    value={item.product_id}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name} - {formatCurrency(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Số lượng */}
                <div>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                  />
                </div>

                {/* Đơn giá */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {formatCurrency(item.price)}
                </div>

                {/* Thành tiền */}
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textAlign: 'right' }}>
                  {formatCurrency(item.subtotal)}
                </div>

                {/* Nút xóa dòng */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="btn-icon delete"
                    title="Xóa dòng"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phương thức thanh toán & Tổng tiền */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.5fr',
          gap: 16,
          padding: 16,
          backgroundColor: 'var(--primary-light)',
          borderRadius: 8,
          border: '1px solid #fde68a',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <div>
            <label className="form-label" style={{ color: 'var(--primary)', marginBottom: 4 }}>
              Phương thức thanh toán:
            </label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ borderColor: '#d97706' }}
            >
              <option value="CASH">Tiền mặt (CASH)</option>
              <option value="TRANSFER">Chuyển khoản QR (TRANSFER)</option>
              <option value="CARD">Quẹt thẻ ngân hàng (CARD)</option>
            </select>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, display: 'block' }}>
              Tổng thanh toán dự kiến:
            </span>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(calculateTotal())}
            </span>
            <span style={{ fontSize: '0.725rem', color: '#92400e', display: 'block' }}>
              * Quản lý qua Redux Saga và Oracle Transaction toàn vẹn
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || items.length === 0}
          >
            {loading ? 'Đang tạo đơn...' : 'Xác nhận tạo đơn & Thanh toán'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
