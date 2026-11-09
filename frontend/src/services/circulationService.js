import api from './api';

export const circulationService = {
  getLoans: async (params = {}) => {
    const res = await api.get('/circulation/loans', { params });
    return res.data;
  },
  issueBook: async (data) => {
    const res = await api.post('/circulation/issue', data);
    return res.data;
  },
  returnBook: async (data) => {
    const res = await api.post('/circulation/return', data);
    return res.data;
  },
  renewBook: async (loanId) => {
    const res = await api.post('/circulation/renew', { loan_id: loanId });
    return res.data;
  },
  getFines: async (params = {}) => {
    const res = await api.get('/circulation/fines', { params });
    return res.data;
  },
};

export default circulationService;
