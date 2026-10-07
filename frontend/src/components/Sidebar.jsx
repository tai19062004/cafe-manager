import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Coffee,
  Layers,
  Users,
  UserCheck,
  UtensilsCrossed,
  Receipt,
  CreditCard,
  Database
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Sản phẩm', icon: Coffee },
  { path: '/categories', label: 'Danh mục món', icon: Layers },
  { path: '/customers', label: 'Khách hàng', icon: Users },
  { path: '/employees', label: 'Nhân viên', icon: UserCheck },
  { path: '/tables', label: 'Bàn café', icon: UtensilsCrossed },
  { path: '/orders', label: 'Đơn hàng', icon: Receipt },
  { path: '/payments', label: 'Thanh toán', icon: CreditCard },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: '#b45309',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
        }}>
          <Coffee size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            Café Manager
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#22c55e'
            }} />
            <span style={{ fontSize: '0.725rem', color: '#a8a29e' }}>
              Oracle 26ai Connected
            </span>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#78716c',
          padding: '0 12px 10px'
        }}>
          Quản lý chính
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive ? '#fff' : '#d6d3d1',
                    backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                    transition: 'all 0.15s ease'
                  })}
                  className={({ isActive }) => (isActive ? 'active-link' : 'nav-hover')}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Schema Info */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#141210',
        fontSize: '0.775rem',
        color: '#a8a29e'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Database size={15} color="#d97706" />
          <span style={{ fontWeight: 600, color: '#f5f5f4' }}>Schema: CAFE</span>
        </div>
        <p style={{ fontSize: '0.725rem' }}>Service: FREEPDB1</p>
      </div>
    </aside>
  );
}

