import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrdersRequest,
  updateOrderStatusRequest,
  deleteOrderRequest,
} from '../redux/slices/orderSlice.js';
import CreateOrderModal from './CreateOrderModal';
import OrderDetailModal from './OrderDetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Receipt,
  Eye,
  XCircle,
  Trash2,
} from 'lucide-react';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewDetailId, setViewDetailId] = useState(null);

  // Cancel order modal state
  const [cancelId, setCancelId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Delete order state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchOrders = () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    dispatch(
      fetchOrdersRequest({
        params,
        onError: (msg) => showToast(msg, 'error'),
      })
    );
  };

  useEffect(() => {
    fetchOrders();
  }, [dispatch, statusFilter]);

  const handleCancelOrder = () => {
    if (!cancelId) return;
    setCancelLoading(true);
    dispatch(
      updateOrderStatusRequest({
        id: cancelId,
        status: 'CANCELLED',
        onSuccess: () => {
          setCancelLoading(false);
          setCancelId(null);
          showToast('Đã hủy đơn hàng thành công. Bàn đã được chuyển về trạng thái Trống.');
        },
        onError: (msg) => {
          setCancelLoading(false);
          showToast(msg, 'error');
        },
      })
    );
  };

  const handleDeleteOrder = () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    dispatch(
      deleteOrderRequest({
        id: deleteId,
        onSuccess: () => {
          setDeleteLoading(false);
          setDeleteId(null);
          showToast('Đã xóa đơn hàng khỏi cơ sở dữ liệu Oracle.');
        },
        onError: (msg) => {
          setDeleteLoading(false);
          showToast(msg, 'error');
        },
      })
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Đơn hàng (Orders)</h1>
          <p className="page-subtitle">
            Lịch sử giao dịch, chi tiết món và quản lý qua Redux Toolkit & Saga
          </p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Tạo đơn gọi món mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setStatusFilter('')}
          className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Tất cả đơn ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`btn ${statusFilter === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Đã hoàn thành (COMPLETED)
        </button>
        <button
          onClick={() => setStatusFilter('CANCELLED')}
          className={`btn ${statusFilter === 'CANCELLED' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Đã hủy (CANCELLED)
        </button>
      </div>

      {/* Orders Table */}
      {loading && orders.length === 0 ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Đang tải danh sách đơn hàng qua Redux Saga...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="state-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Receipt size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Chưa có đơn hàng nào</p>
          <p style={{ fontSize: '0.85rem' }}>Bấm nút "Tạo đơn gọi món mới" ở góc phải để bắt đầu bán hàng.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Bàn Café</th>
                <th>Nhân Viên</th>
                <th>Thời Gian Đặt</th>
                <th>Tổng Tiền</th>
                <th>Thanh Toán</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'center', width: 130 }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td style={{ fontWeight: 700 }}>#{order.order_id}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {order.customer_name || 'Khách vãng lai'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">{order.table_name}</span>
                  </td>
                  <td>{order.employee_name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {order.order_date}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.925rem' }}>
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {order.payment_method || 'CASH'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      order.status === 'COMPLETED' ? 'badge-success' :
                      order.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => setViewDetailId(order.order_id)}
                        className="btn-icon"
                        title="Xem chi tiết món"
                      >
                        <Eye size={15} />
                      </button>
                      {order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => setCancelId(order.order_id)}
                          className="btn-icon"
                          title="Hủy đơn hàng"
                          style={{ color: 'var(--warning)' }}
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(order.order_id)}
                        className="btn-icon delete"
                        title="Xóa đơn hàng"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOrderCreated={fetchOrders}
      />

      {/* View Detail Modal */}
      <OrderDetailModal
        isOpen={!!viewDetailId}
        onClose={() => setViewDetailId(null)}
        orderId={viewDetailId}
      />

      {/* Cancel Order Confirm */}
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancelOrder}
        title="Xác nhận hủy đơn hàng"
        message={`Bạn có chắc muốn hủy đơn hàng #${cancelId}? Trạng thái đơn sẽ chuyển sang CANCELLED và bàn sẽ được giải phóng về trạng thái Trống.`}
        confirmText="Xác nhận hủy đơn"
        loading={cancelLoading}
      />

      {/* Delete Order Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteOrder}
        title="Xác nhận xóa đơn hàng"
        message={`Xóa đơn hàng #${deleteId} sẽ xóa toàn bộ các bản ghi ORDER_DETAIL và PAYMENT liên quan trong cơ sở dữ liệu Oracle.`}
        confirmText="Xóa vĩnh viễn"
        loading={deleteLoading}
      />
    </div>
  );
}
