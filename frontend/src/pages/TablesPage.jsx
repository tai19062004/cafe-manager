import React, { useState, useEffect } from 'react';
import tableApi from '../api/tableApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  Wrench
} from 'lucide-react';

const initialForm = {
  table_name: '',
  capacity: 4,
  location: 'Tầng trệt',
  status: 'AVAILABLE'
};

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();

  const fetchTables = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await tableApi.getAll(params);
      if (res.success) {
        setTables(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [statusFilter]);

  const openCreateModal = () => {
    setEditingTable(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTable(t);
    setFormData({
      table_name: t.table_name,
      capacity: t.capacity,
      location: t.location || '',
      status: t.status || 'AVAILABLE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.table_name.trim()) {
      showToast('Tên bàn không được để trống.', 'error');
      return;
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      showToast('Sức chứa của bàn phải lớn hơn 0.', 'error');
      return;
    }

    setFormLoading(true);
    try {
      if (editingTable) {
        await tableApi.update(editingTable.table_id, formData);
        showToast('Cập nhật bàn thành công!');
      } else {
        await tableApi.create(formData);
        showToast('Thêm bàn mới thành công!');
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await tableApi.delete(deleteId);
      showToast('Đã xóa bàn.');
      setDeleteId(null);
      fetchTables();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={12} /> Bàn trống
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> Đang có khách
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Wrench size={12} /> Đang bảo trì
          </span>
        );
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sơ đồ & Danh sách Bàn Café</h1>
          <p className="page-subtitle">Quản lý trạng thái bàn (Trống / Đang phục vụ / Bảo trì) trong quán</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Thêm bàn mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setStatusFilter('')}
          className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Tất cả ({tables.length})
        </button>
        <button
          onClick={() => setStatusFilter('AVAILABLE')}
          className={`btn ${statusFilter === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Bàn trống (AVAILABLE)
        </button>
        <button
          onClick={() => setStatusFilter('OCCUPIED')}
          className={`btn ${statusFilter === 'OCCUPIED' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Đang phục vụ (OCCUPIED)
        </button>
        <button
          onClick={() => setStatusFilter('MAINTENANCE')}
          className={`btn ${statusFilter === 'MAINTENANCE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Bảo trì (MAINTENANCE)
        </button>
      </div>

      {/* Table Cards Visual Floor Plan */}
      {loading ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Đang tải sơ đồ bàn...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="state-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
          <UtensilsCrossed size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Không tìm thấy bàn nào</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16
        }}>
          {tables.map((t) => (
            <div
              key={t.table_id}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${
                  t.status === 'AVAILABLE' ? '#86efac' :
                  t.status === 'OCCUPIED' ? '#fde047' : '#fca5a5'
                }`,
                padding: '18px 20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {t.table_name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã: #{t.table_id}</span>
                  </div>
                  {getStatusBadge(t.status)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={15} color="var(--primary)" />
                    <span>Sức chứa: <b>{t.capacity} chỗ</b></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>Vị trí: <b>{t.location || 'Chưa định vị'}</b></span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                borderTop: '1px solid var(--border)',
                paddingTop: 12
              }}>
                <button
                  onClick={() => openEditModal(t)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Edit2 size={13} /> Sửa
                </button>
                <button
                  onClick={() => setDeleteId(t.table_id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Trash2 size={13} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTable ? 'Chỉnh sửa Bàn Café' : 'Thêm Bàn Mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên bàn *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Bàn 01, Bàn VIP 2..."
              value={formData.table_name}
              onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Sức chứa (số ghế) *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="VD: 4"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái bàn</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="AVAILABLE">AVAILABLE (Bàn trống)</option>
                <option value="OCCUPIED">OCCUPIED (Đang có khách)</option>
                <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vị trí trong quán</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Tầng trệt - Cửa sổ, Sân vườn ngoài trời..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={formLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formLoading}
            >
              {formLoading ? 'Đang lưu...' : (editingTable ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bàn"
        message="Bàn đã có đơn hàng trong quá khứ sẽ được bảo vệ bởi Oracle Foreign Key."
        loading={deleteLoading}
      />
    </div>
  );
}

