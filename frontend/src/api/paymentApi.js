import axiosClient from './axiosClient';

const paymentApi = {
  getAll: (params) => axiosClient.get('/payments', { params }),
  getById: (id) => axiosClient.get(`/payments/${id}`),
  create: (data) => axiosClient.post('/payments', data),
  update: (id, data) => axiosClient.put(`/payments/${id}`, data),
  delete: (id) => axiosClient.delete(`/payments/${id}`)
};

export default paymentApi;

