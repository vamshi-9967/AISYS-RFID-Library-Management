import api from './api';

export const bookService = {
  getBooks: async (params = {}) => {
    const res = await api.get('/books', { params });
    return res.data;
  },
  getBook: async (id) => {
    const res = await api.get(`/books/${id}`);
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/books/categories');
    return res.data;
  },
  getAuthors: async () => {
    const res = await api.get('/books/authors');
    return res.data;
  },
  createBook: async (data) => {
    const res = await api.post('/books', data);
    return res.data;
  },
  deleteBook: async (id) => {
    const res = await api.delete(`/books/${id}`);
    return res.data;
  },
};

export default bookService;
