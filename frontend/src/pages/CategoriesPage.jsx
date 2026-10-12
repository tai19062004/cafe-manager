import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategoriesRequest,
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
} from '../redux/slices/categorySlice.js';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

const initialForm = {
  category_name: '',
  description: '',
  status: 'ACTIVE'
};

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);
  const { showToast } = useToast();

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = () => {
    dispatch(
      fetchCategoriesRequest({
        onError: (msg) => showToast(msg, 'error'),
      })
    );
  };

  useEffect(() => {
    fetchCategories();
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      category_name: cat.category_name,
      description: cat.description || '',
      status: cat.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category_name.trim()) {
      showToast('Tên danh mục không được để trống.', 'error');
      return;
    }

    setFormLoading(true);
    if (editingCategory) {
      dispatch(
        updateCategoryRequest({
          id: editingCategory.category_id,
          data: formData,
          onSuccess: () => {
            setFormLoading(false);
            setIsModalOpen(false);
            showToast('Cập nhật danh mục thành công!');
          },
          onError: (msg) => {
            setFormLoading(false);
            showToast(msg, 'error');
          },
        })
      );
    } else {
      dispatch(
        createCategoryRequest({
          data: formData,
          onSuccess: () => {
            setFormLoading(false);
            setIsModalOpen(false);
            showToast('Thêm danh mục mới thành công!');
          },
          onError: (msg) => {
            setFormLoading(false);
            showToast(msg, 'error');
          },
        })
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    dispatch(
      deleteCategoryRequest({
        id: deleteId,
        onSuccess: () => {
          setDeleteLoading(false);
          setDeleteId(null);
          showToast('Đã xóa danh mục.');
        },
        onError: (msg) => {
          setDeleteLoading(false);
          showToast(msg, 'error');
        },
      })
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Danh mục Món</h1>
          <p className="page-subtitle">Phân loại các dòng sản phẩm của quán qua Redux Slice & Saga</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {loading && categories.length === 0 ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Đang tải danh mục từ Oracle qua Redux Saga...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="state-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Layers size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Chưa có danh mục nào</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Mã DM</th>
                <th>Tên Danh Mục</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.category_id}>
                  <td style={{ fontWeight: 600 }}>#{cat.category_id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {cat.category_name}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {cat.description || 'Chưa có mô tả'}
                  </td>
                  <td>
                    <span className={`badge ${cat.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="btn-icon"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.category_id)}
                        className="btn-icon delete"
                        title="Xóa danh mục"
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
        title={editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên danh mục *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Cà phê phin, Trà trái cây..."
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE (Kích hoạt)</option>
              <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-textarea"
              placeholder="Mô tả chi tiết về nhóm đồ uống này..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {formLoading ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa danh mục"
        message="Nếu danh mục này đang có sản phẩm liên kết, Oracle sẽ chặn xóa để bảo toàn ràng buộc khóa ngoại (Foreign Key)."
        loading={deleteLoading}
      />
    </div>
  );
}
