import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '6px 12px',
          borderRadius: 20,
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <Sparkles size={14} />
          <span>Hệ Thống Quản Lý Café • Oracle 26ai</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Calendar size={16} />
          <span>{formatDate(time)}</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--primary)',
          background: '#f8fafc',
          border: '1px solid var(--border)',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Clock size={16} />
          <span>{formatTime(time)}</span>
        </div>
      </div>
    </header>
  );
}

