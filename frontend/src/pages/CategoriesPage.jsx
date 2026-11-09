import React from 'react';
import { FolderTree, BookOpen, Layers } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function CategoriesPage() {
  const { books, setActiveTab } = useLibrary();

  const categories = [
    { id: 1, name: 'Computer Science', code: 'CS', desc: 'Core computer science algorithms, systems, data structures, and languages.' },
    { id: 2, name: 'Software Engineering', code: 'SE', desc: 'Software architecture, clean code principles, testing, and lifecycle practices.' },
    { id: 3, name: 'Architecture', code: 'AR', desc: 'Distributed design patterns, messaging enterprise patterns, and microservices.' },
    { id: 4, name: 'Artificial Intelligence', code: 'AI', desc: 'Machine learning, deep neural networks, computer vision, and cognitive systems.' },
    { id: 5, name: 'Cloud & DevOps', code: 'DO', desc: 'Container orchestration, Kubernetes, CI/CD pipelines, and cloud infrastructure.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Subject Categories & Classification</h1>
          <p className="text-xs text-slate-500">
            Hierarchical discipline cataloguing with relational book associations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => {
          const count = books.filter(b => b.category === c.name).length;
          return (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#164B78]">
                  <FolderTree className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {c.code}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.desc}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#164B78]">{count} Catalogued Titles</span>
                <button
                  onClick={() => setActiveTab('books')}
                  className="font-semibold text-slate-600 hover:text-[#164B78]"
                >
                  Inspect Books →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
