import axiosClient from './axiosClient';

const tableApi = {
  getAll: (params) => axiosClient.get('/tables', { params }),
  getById: (id) => axiosClient.get(`/tables/${id}`),
  create: (data) => axiosClient.post('/tables', data),
  update: (id, data) => axiosClient.put(`/tables/${id}`, data),
  delete: (id) => axiosClient.delete(`/tables/${id}`)
};

export default tableApi;

