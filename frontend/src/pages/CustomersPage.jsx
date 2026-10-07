import React, { useState, useEffect } from 'react';
import customerApi from '../api/customerApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit2, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react';

const initialForm = {
  customer_name: '',
  phone: '',
  email: '',
  address: '',
  status: 'ACTIVE'
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await customerApi.getAll(params);
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      customer_name: cust.customer_name,
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      status: cust.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      showToast('Tên khách hàng không được để trống.', 'error');
      return;
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        showToast('Định dạng email không hợp lệ.', 'error');
        return;
      }
    }

    setFormLoading(true);
    try {
      if (editingCustomer) {
        await customerApi.update(editingCustomer.customer_id, formData);
        showToast('Cập nhật khách hàng thành công!');
      } else {
        await customerApi.create(formData);
        showToast('Thêm khách hàng mới thành công!');
      }
      setIsModalOpen(false);
      fetchCustomers();
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
      await customerApi.delete(deleteId);
      showToast('Đã xóa khách hàng.');
      setDeleteId(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Khách hàng</h1>
          <p className="page-subtitle">Thông tin khách hàng thân thiết và tích điểm của quán café</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <button type="submit" onClick={handleSearchSubmit} className="btn btn-secondary btn-sm">
          Tìm kiếm
        </button>
      </div>

      {loading ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="state-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Users size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Không tìm thấy khách hàng nào</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Mã KH</th>
                <th>Tên Khách Hàng</th>
                <th>Số Điện Thoại</th>
                <th>Email</th>
                <th>Địa Chỉ</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customer_id}>
                  <td style={{ fontWeight: 600 }}>#{c.customer_id}</td>
                  <td style={{ fontWeight: 600 }}>{c.customer_name}</td>
                  <td>
                    {c.phone ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} color="var(--text-muted)" />
                        {c.phone}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {c.email ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} color="var(--text-muted)" />
                        {c.email}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {c.address ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                        <MapPin size={14} />
                        {c.address}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(c)}
                        className="btn-icon"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.customer_id)}
                        className="btn-icon delete"
                        title="Xóa khách hàng"
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

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Chỉnh sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên khách hàng *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Nguyễn Văn A..."
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: 0901234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="VD: khachhang@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: 123 Lê Lợi, Quận 1..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE (Hoạt động)</option>
              <option value="INACTIVE">INACTIVE (Khóa/Tạm ngừng)</option>
            </select>
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
              {formLoading ? 'Đang lưu...' : (editingCustomer ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa khách hàng"
        message="Khách hàng đã có đơn đặt trong quá khứ sẽ được bảo vệ bởi ràng buộc Oracle."
        loading={deleteLoading}
      />
    </div>
  );
}

