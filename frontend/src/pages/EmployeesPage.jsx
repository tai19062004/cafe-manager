import React, { useState, useEffect } from 'react';
import employeeApi from '../api/employeeApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit2, Trash2, UserCheck, Phone, Mail, Briefcase, DollarSign } from 'lucide-react';

const initialForm = {
  employee_name: '',
  phone: '',
  email: '',
  position: 'Nhân viên phục vụ',
  salary: '',
  status: 'ACTIVE'
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await employeeApi.getAll(params);
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employee_name: emp.employee_name,
      phone: emp.phone || '',
      email: emp.email || '',
      position: emp.position || 'Nhân viên phục vụ',
      salary: emp.salary || 0,
      status: emp.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_name.trim()) {
      showToast('Tên nhân viên không được để trống.', 'error');
      return;
    }

    if (formData.salary !== '' && Number(formData.salary) < 0) {
      showToast('Lương nhân viên không được nhỏ hơn 0.', 'error');
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
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.employee_id, formData);
        showToast('Cập nhật nhân viên thành công!');
      } else {
        await employeeApi.create(formData);
        showToast('Thêm nhân viên mới thành công!');
      }
      setIsModalOpen(false);
      fetchEmployees();
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
      await employeeApi.delete(deleteId);
      showToast('Đã xóa nhân viên.');
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Nhân sự Quán</h1>
          <p className="page-subtitle">Danh sách nhân viên thu ngân, pha chế, phục vụ và quản lý quán café</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên, điện thoại, chức vụ..."
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
          <p>Đang tải danh sách nhân viên...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="state-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
          <UserCheck size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Không tìm thấy nhân viên nào</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Mã NV</th>
                <th>Tên Nhân Viên</th>
                <th>Vị trí / Chức vụ</th>
                <th>Mức Lương</th>
                <th>Số Điện Thoại</th>
                <th>Email</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td style={{ fontWeight: 600 }}>#{emp.employee_id}</td>
                  <td style={{ fontWeight: 600 }}>{emp.employee_name}</td>
                  <td>
                    <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Briefcase size={12} />
                      {emp.position || 'Staff'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {formatCurrency(emp.salary)}
                  </td>
                  <td>{emp.phone || '-'}</td>
                  <td>{emp.email || '-'}</td>
                  <td>
                    <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(emp)}
                        className="btn-icon"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(emp.employee_id)}
                        className="btn-icon delete"
                        title="Xóa nhân viên"
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
        title={editingEmployee ? 'Chỉnh sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên nhân viên *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Lê Hoàng Long..."
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Vị trí / Chức vụ</label>
              <select
                className="form-select"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                <option value="Quản lý">Quản lý</option>
                <option value="Thu ngân">Thu ngân</option>
                <option value="Pha chế">Pha chế</option>
                <option value="Nhân viên phục vụ">Nhân viên phục vụ</option>
                <option value="Bảo vệ">Bảo vệ</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mức lương cơ bản (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="500000"
                className="form-input"
                placeholder="VD: 8000000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: 0987654321"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="VD: long.le@cafe.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái làm việc</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE (Đang làm việc)</option>
              <option value="INACTIVE">INACTIVE (Đã nghỉ việc)</option>
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
              {formLoading ? 'Đang lưu...' : (editingEmployee ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa nhân viên"
        message="Nhân viên đã từng tạo đơn hàng trong quá khứ sẽ được bảo vệ toàn vẹn bởi Oracle Database."
        loading={deleteLoading}
      />
    </div>
  );
}

