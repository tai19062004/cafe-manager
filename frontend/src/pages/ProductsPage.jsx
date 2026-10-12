import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductsRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
} from '../redux/slices/productSlice.js';
import { fetchCategoriesRequest } from '../redux/slices/categorySlice.js';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Coffee,
  Filter,
} from 'lucide-react';

const initialForm = {
  product_name: '',
  category_id: '',
  price: '',
  unit: 'Ly',
  description: '',
  status: 'ACTIVE'
};

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  // Delete dialog states
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (selectedCategory) params.category_id = selectedCategory;

    dispatch(
      fetchProductsRequest({
        params,
        onError: (msg) => showToast(msg, 'error'),
      })
    );
  };

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  useEffect(() => {
    fetchProducts();
  }, [dispatch, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      category_id: categories.length > 0 ? categories[0].category_id : ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      category_id: product.category_id,
      price: product.price,
      unit: product.unit || 'Ly',
      description: product.description || '',
      status: product.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.product_name.trim()) {
      showToast('Vui lòng nhập tên món/sản phẩm.', 'error');
      return;
    }
    if (!formData.category_id) {
      showToast('Vui lòng chọn danh mục.', 'error');
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      showToast('Giá sản phẩm phải lớn hơn hoặc bằng 0.', 'error');
      return;
    }

    setFormLoading(true);
    if (editingProduct) {
      dispatch(
        updateProductRequest({
          id: editingProduct.product_id,
          data: formData,
          onSuccess: () => {
            setFormLoading(false);
            setIsModalOpen(false);
            showToast('Cập nhật thông tin món thành công!');
          },
          onError: (msg) => {
            setFormLoading(false);
            showToast(msg, 'error');
          },
        })
      );
    } else {
      dispatch(
        createProductRequest({
          data: formData,
          onSuccess: () => {
            setFormLoading(false);
            setIsModalOpen(false);
            showToast('Thêm món mới thành công!');
          },
          onError: (msg) => {
            setFormLoading(false);
            showToast(msg, 'error');
          },
        })
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    dispatch(
      deleteProductRequest({
        id: deleteId,
        onSuccess: () => {
          setDeleteLoading(false);
          setDeleteId(null);
          showToast('Đã xóa sản phẩm thành công.');
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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Sản phẩm (Đồ uống & Món)</h1>
          <p className="page-subtitle">Quản lý danh sách các món qua Redux Toolkit & Redux Saga</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Thêm món mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên món hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 180 }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Tất cả danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={fetchProducts} className="btn btn-secondary btn-sm">
          Lọc dữ liệu
        </button>
      </div>

      {/* Products Table */}
      {loading && products.length === 0 ? (
        <div className="state-container">
          <div className="spinner" />
          <p>Đang tải dữ liệu sản phẩm qua Redux Saga...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="state-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Coffee size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Không tìm thấy sản phẩm nào</p>
          <p style={{ fontSize: '0.85rem' }}>Thử thay đổi từ khóa tìm kiếm hoặc bấm "Thêm món mới"</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Tên món / Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Đơn vị tính</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.product_id}>
                  <td style={{ fontWeight: 600 }}>#{prod.product_id}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {prod.product_name}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-warning">
                      {prod.category_name || `Mã DM: ${prod.category_id}`}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatCurrency(prod.price)}
                  </td>
                  <td>{prod.unit || 'Ly'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prod.description || '-'}
                  </td>
                  <td>
                    <span className={`badge ${prod.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {prod.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(prod)}
                        className="btn-icon"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(prod.product_id)}
                        className="btn-icon delete"
                        title="Xóa món"
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Chỉnh sửa Món' : 'Thêm Món Mới'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Tên sản phẩm / đồ uống *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Cà phê sữa đá, Trà đào..."
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Danh mục *</label>
              <select
                className="form-select"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Đơn vị tính *</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Ly, Tách, Phần, Chai"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Giá bán (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                placeholder="VD: 30000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái kinh doanh</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE (Đang bán)</option>
                <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả món</label>
            <textarea
              className="form-textarea"
              placeholder="Thành phần, hương vị, lưu ý đặc biệt..."
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
              {formLoading ? 'Đang lưu vào Oracle...' : (editingProduct ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa món"
        message="Bạn có chắc chắn muốn xóa món này khỏi hệ thống? Nếu món đã từng có trong đơn hàng, Oracle sẽ từ chối để bảo toàn lịch sử giao dịch."
        loading={deleteLoading}
      />
    </div>
  );
}
