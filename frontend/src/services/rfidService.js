import api from './api';

export const rfidService = {
  getTags: async (params = {}) => {
    const res = await api.get('/rfid/tags', { params });
    return res.data;
  },
  scanSingleTag: async (tagUid, accessionNumber) => {
    const res = await api.post('/rfid/scan-single', null, {
      params: { tag_uid: tagUid, accession_number: accessionNumber }
    });
    return res.data;
  },
  toggleSecurityBit: async (tagUid, bit) => {
    const res = await api.post('/rfid/toggle-security', null, {
      params: { tag_uid: tagUid, bit }
    });
    return res.data;
  },
  simulateGate: async (tagUid, gateLocation = 'Main Entrance / Gate A') => {
    const res = await api.post('/rfid/simulate-gate', {
      tag_uid: tagUid,
      gate_location: gateLocation
    });
    return res.data;
  },
  getGateEvents: async (params = {}) => {
    const res = await api.get('/gate/events', { params });
    return res.data;
  },
  getGateStatus: async () => {
    const res = await api.get('/gate/status');
    return res.data;
  },
  clearAlarm: async (eventId) => {
    const res = await api.post('/gate/clear-alarm', null, {
      params: { event_id: eventId }
    });
    return res.data;
  },
};

export default rfidService;
