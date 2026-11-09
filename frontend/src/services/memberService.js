import api from './api';

export const memberService = {
  getMembers: async (params = {}) => {
    const res = await api.get('/members', { params });
    return res.data;
  },
  getMember: async (id) => {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },
  registerMember: async (data) => {
    const res = await api.post('/members', data);
    return res.data;
  },
  toggleStatus: async (id, statusVal) => {
    const res = await api.patch(`/members/${id}/status`, null, { params: { status_val: statusVal } });
    return res.data;
  },
  payFines: async (id) => {
    const res = await api.post(`/members/${id}/pay-fines`);
    return res.data;
  },
};

export default memberService;
