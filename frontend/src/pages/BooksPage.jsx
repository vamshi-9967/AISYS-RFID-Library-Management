import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Copy,
  Tag,
  CheckCircle,
  Clock,
  Layers,
  ChevronDown,
  Download,
  AlertTriangle,
  X
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function BooksPage() {
  const { books, setBooks } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBookForCopies, setSelectedBookForCopies] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New book form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newCopiesCount, setNewCopiesCount] = useState(2);
  const [newIsReference, setNewIsReference] = useState(false);

  const categories = ['All', 'Computer Science', 'Software Engineering', 'Architecture', 'Artificial Intelligence', 'Cloud & DevOps'];

  const filteredBooks = books.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.includes(searchTerm);
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newIsbn.trim()) return;

    const count = parseInt(newCopiesCount) || 1;
    const bookId = Date.now();
    const generatedCopies = [];

    for (let i = 1; i <= count; i++) {
      const copyNum = Math.floor(100 + Math.random() * 900);
      generatedCopies.push({
        id: bookId + i,
        accessionNumber: `ACC-${newCategory.slice(0, 2).toUpperCase()}-${copyNum}`,
        barcode: `BC${copyNum}`,
        shelf: 'Shelf A-3',
        rfidUid: `E280116060000${copyNum}`,
        status: newIsReference ? 'Reference Only' : 'Available',
        acquiredDate: new Date().toISOString().split('T')[0]
      });
    }

    const newBook = {
      id: bookId,
      isbn: newIsbn,
      title: newTitle,
      subtitle: 'Standard Edition',
      author: newAuthor,
      publisher: 'AISYS Academic Press',
      year: new Date().getFullYear(),
      category: newCategory,
      language: 'English',
      edition: '1st Edition',
      pages: 350,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80',
      isReference: newIsReference,
      copiesCount: count,
      availableCopies: newIsReference ? 0 : count,
      copies: generatedCopies
    };

    setBooks([newBook, ...books]);
    setShowAddModal(false);
    setNewTitle('');
    setNewAuthor('');
    setNewIsbn('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bibliographic & Physical Catalog</h1>
          <p className="text-xs text-slate-500">
            Manage master book titles, accessioned copies, barcode tags, and shelf locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Title, Author, ISBN, Accession #..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#164B78] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 shrink-0">Discipline:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#164B78]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cover / Title</th>
                <th className="py-3 px-4">Author(s)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">ISBN</th>
                <th className="py-3 px-4 text-center">Physical Copies</th>
                <th className="py-3 px-4 text-center">Shelf Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-10 h-14 rounded object-cover shadow-2xs border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{b.title}</p>
                        <p className="text-[11px] text-slate-500">{b.subtitle}</p>
                        {b.isReference && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Reference Only
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{b.author}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-[#164B78] border border-blue-200">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{b.isbn}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedBookForCopies(b)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                      title="Inspect RFID tags and accession numbers"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{b.copies.length} Copies</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        b.availableCopies > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {b.availableCopies} Available
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedBookForCopies(b)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#164B78] hover:bg-blue-50 border border-blue-200 transition-colors"
                    >
                      View Items
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Copies & RFID Tags Modal */}
      {selectedBookForCopies && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedBookForCopies.title}</h3>
                <p className="text-xs text-slate-400">Physical Items, Shelf Locations & RFID Tag Assignment</p>
              </div>
              <button
                onClick={() => setSelectedBookForCopies(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {selectedBookForCopies.copies.map((copy) => (
                <div key={copy.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800">{copy.accessionNumber}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {copy.shelf}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Radio className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-mono text-purple-700 font-semibold">{copy.rfidUid}</span>
                      <span>• Barcode: {copy.barcode}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      copy.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : copy.status === 'Reference Only'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {copy.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBookForCopies(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Add New Bibliographic Title</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author(s) *</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Andrew S. Tanenbaum, Maarten van Steen"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={newIsbn}
                    onChange={(e) => setNewIsbn(e.target.value)}
                    placeholder="978-0131485211"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discipline</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Physical Copies</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCopiesCount}
                    onChange={(e) => setNewCopiesCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden"
                  />
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRef"
                    checked={newIsReference}
                    onChange={(e) => setNewIsReference(e.target.checked)}
                    className="rounded border-slate-300 text-[#164B78] focus:ring-[#164B78]"
                  />
                  <label htmlFor="isRef" className="font-semibold text-slate-700 cursor-pointer">
                    Reference Collection Only
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-semibold text-xs shadow-xs"
                >
                  Save Title & Auto-Generate Copies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
