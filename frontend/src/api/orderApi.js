import axiosClient from './axiosClient';

const orderApi = {
  getAll: (params) => axiosClient.get('/orders', { params }),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  create: (data) => axiosClient.post('/orders', data),
  updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status }),
  delete: (id) => axiosClient.delete(`/orders/${id}`)
};

export default orderApi;

