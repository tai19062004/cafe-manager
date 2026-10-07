import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import orderApi from '../api/orderApi';
import { useToast } from '../context/ToastContext';
import { Receipt, Calendar, User, UserCheck, UtensilsCrossed, CreditCard } from 'lucide-react';

export default function OrderDetailModal({ isOpen, onClose, orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await orderApi.getById(orderId);
          if (res.success) {
            setOrder(res.data);
          }
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else {
      setOrder(null);
    }
  }, [isOpen, orderId]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết đơn hàng #${orderId}`} maxWidth={650}>
      {loading ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      ) : !order ? (
        <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
          Không tìm thấy thông tin đơn hàng.
        </p>
      ) : (
        <div>
          {/* Header Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            padding: 16,
            borderRadius: 8,
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border)',
            marginBottom: 20
          }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Thời gian đặt:</p>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.order_date}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Trạng thái đơn:</p>
              <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                {order.status}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Khách hàng:</p>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {order.customer_name || 'Khách vãng lai'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Bàn phục vụ:</p>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {order.table_name || `Bàn #${order.table_id}`}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Nhân viên phụ trách:</p>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {order.employee_name || `NV #${order.employee_id}`}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Hình thức thanh toán:</p>
              <span className="badge badge-info">
                {order.payment_method || 'CASH'} - {order.payment_status || 'PAID'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>
            Danh sách món đã gọi ({order.items?.length || 0} món)
          </h4>

          <div className="table-container" style={{ marginBottom: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên món</th>
                  <th style={{ textAlign: 'center' }}>Số lượng</th>
                  <th style={{ textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <b>{item.quantity}</b> {item.unit || 'ly'}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total summary */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            backgroundColor: 'var(--primary-light)',
            borderRadius: 8,
            border: '1px solid #fde68a'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
              Tổng cộng thanh toán:
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(order.total_amount)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={onClose} className="btn btn-secondary">
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

