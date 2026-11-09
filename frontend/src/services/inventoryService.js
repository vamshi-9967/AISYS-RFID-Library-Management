import api from './api';

export const inventoryService = {
  getSessions: async (params = {}) => {
    const res = await api.get('/inventory/sessions', { params });
    return res.data;
  },
  scanShelf: async (shelfLocation, scannedTags = []) => {
    const res = await api.post('/inventory/scan-shelf', {
      shelf_location: shelfLocation,
      scanned_tags: scannedTags,
    });
    return res.data;
  },
};

export default inventoryService;
