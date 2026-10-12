import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStatsRequest } from '../redux/slices/dashboardSlice.js';
import {
  Coffee,
  Users,
  UserCheck,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.dashboard);
  const { showToast } = useToast();

  const fetchStats = () => {
    dispatch(
      fetchDashboardStatsRequest({
        onError: (msg) => showToast(msg, 'error'),
      })
    );
  };

  useEffect(() => {
    fetchStats();
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  if (loading && !stats) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p>Đang tải dữ liệu thống kê từ Oracle Database qua Redux Saga...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng sản phẩm',
      value: stats?.total_products || 0,
      icon: Coffee,
      color: '#b45309',
      bgColor: '#fef3c7'
    },
    {
      title: 'Tổng khách hàng',
      value: stats?.total_customers || 0,
      icon: Users,
      color: '#0284c7',
      bgColor: '#e0f2fe'
    },
    {
      title: 'Tổng nhân viên',
      value: stats?.total_employees || 0,
      icon: UserCheck,
      color: '#7c3aed',
      bgColor: '#ede9fe'
    },
    {
      title: 'Tổng đơn hàng',
      value: stats?.total_orders || 0,
      icon: ShoppingBag,
      color: '#ea580c',
      bgColor: '#ffedd5'
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats?.total_revenue),
      icon: DollarSign,
      color: '#16a34a',
      bgColor: '#dcfce7',
      isCurrency: true
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Tổng Quan</h1>
          <p className="page-subtitle">
            Quản lý API bằng Redux Toolkit + Redux Saga kết nối Oracle AI Database Free 26ai
          </p>
        </div>
        <button onClick={fetchStats} className="btn btn-secondary" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 5 Thẻ thống kê chính */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 18,
        marginBottom: 28
      }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--bg-card)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: card.bgColor,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {card.title}
                </p>
                <h3 style={{
                  fontSize: card.isCurrency ? '1.25rem' : '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: 4
                }}>
                  {card.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Orders & Top Selling Products */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr',
        gap: 24,
        marginBottom: 28
      }}>
        {/* Recent Orders */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          padding: 20,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--primary)" />
              Đơn hàng gần đây
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top 5 mới nhất</span>
          </div>

          {stats?.recent_orders?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              Chưa có đơn hàng nào được tạo.
            </p>
          ) : (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách hàng</th>
                    <th>Bàn</th>
                    <th>Nhân viên</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_orders?.map((order) => (
                    <tr key={order.order_id}>
                      <td style={{ fontWeight: 600 }}>#{order.order_id}</td>
                      <td>{order.customer_name}</td>
                      <td>
                        <span className="badge badge-info">{order.table_name}</span>
                      </td>
                      <td>{order.employee_name}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td>
                        <span className={`badge ${
                          order.status === 'COMPLETED' ? 'badge-success' :
                          order.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top 5 Best Sellers */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          padding: 20,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="#16a34a" />
              Món bán chạy nhất
            </h3>
          </div>

          {stats?.top_products?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              Chưa có dữ liệu bán hàng.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats?.top_products?.map((prod, idx) => (
                <div
                  key={prod.product_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: '#fafaf9',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? '#fef3c7' : '#f1f5f9',
                      color: idx === 0 ? '#b45309' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{prod.product_name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Đã bán: <b>{prod.total_sold}</b> ly/phần
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {formatCurrency(prod.total_revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment methods breakdown */}
      {stats?.payment_methods?.length > 0 && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          padding: 20,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
            Phương thức thanh toán đã sử dụng
          </h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {stats.payment_methods.map((method, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  backgroundColor: '#f8fafc'
                }}
              >
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {method.payment_method}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    {formatCurrency(method.total_amount)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({method.count} giao dịch)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
