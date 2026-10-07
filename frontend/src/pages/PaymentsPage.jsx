import React, { useState, useEffect } from 'react';
import paymentApi from '../api/paymentApi';
import { useToast } from '../context/ToastContext';
import { CreditCard, DollarSign, Calendar, Filter, RefreshCw } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { showToast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (methodFilter) params.payment_method = methodFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await paymentApi.getAll(params);
      if (res.success) {
        setPayments(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, statusFilter]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Thanh toán & Doanh thu</h1>
          <p className="page-subtitle">Sổ cái giao dịch thanh toán từ bảng PAYMENT liên kết 1-1 với ORDERS</p>
        </div>
        <button onClick={fetchPayments} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 200 }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">-- Tất cả phương thức --</option>
            <option value="CASH">Tiền mặt (CASH)</option>
            <option value="TRANSFER">Chuyển khoản (TRANSFER)</option>
            <option value="CARD">Thẻ ngân hàng (CARD)</option>
          </select>
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="PAID">Đã thanh toán (PAID)</option>
          <option value="PENDING">Chờ xử lý (PENDING)</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Đang tải dữ liệu thanh toán...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="state-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
          <CreditCard size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Không tìm thấy phiếu thanh toán nào</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Mã GD</th>
                <th>Mã Đơn Hàng</th>
                <th>Khách Hàng</th>
                <th>Bàn Café</th>
                <th>Thời Gian Thanh Toán</th>
                <th>Số Tiền</th>
                <th>Phương Thức</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id}>
                  <td style={{ fontWeight: 700 }}>#{p.payment_id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    Đơn #{p.order_id}
                  </td>
                  <td>{p.customer_name || 'Khách vãng lai'}</td>
                  <td>
                    <span className="badge badge-info">{p.table_name}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {p.payment_date}
                  </td>
                  <td style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.95rem' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ fontWeight: 600 }}>
                      {p.payment_method}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

