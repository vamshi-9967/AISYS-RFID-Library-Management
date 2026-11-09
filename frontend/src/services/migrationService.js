import api from './api';

export const migrationService = {
  getJobs: async () => {
    const res = await api.get('/migration/jobs');
    return res.data;
  },
  stageSynthetic: async (count = 20000) => {
    const res = await api.post('/migration/stage-synthetic-20k', null, { params: { count } });
    return res.data;
  },
  previewJob: async (jobId, params = {}) => {
    const res = await api.get(`/migration/jobs/${jobId}/preview`, { params });
    return res.data;
  },
  commitJob: async (jobId) => {
    const res = await api.post(`/migration/jobs/${jobId}/commit`);
    return res.data;
  },
  rollbackJob: async (jobId) => {
    const res = await api.post(`/migration/jobs/${jobId}/rollback`);
    return res.data;
  },
};

export default migrationService;
