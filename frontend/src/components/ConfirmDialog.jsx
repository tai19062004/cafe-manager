import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn thực hiện thao tác này? Dữ liệu đã xóa không thể khôi phục.',
  confirmText = 'Xác nhận xóa',
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={440}>
      <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          disabled={loading}
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn btn-danger"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}

