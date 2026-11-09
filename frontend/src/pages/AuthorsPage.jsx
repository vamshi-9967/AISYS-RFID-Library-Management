import React from 'react';
import { Users2, BookOpen } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function AuthorsPage() {
  const { books, setActiveTab } = useLibrary();

  const authors = [
    { id: 1, name: "Joshua Bloch", bio: "Former Chief Java Architect at Google, author of Effective Java." },
    { id: 2, name: "Robert C. Martin", bio: "Co-author of the Agile Manifesto, known widely as Uncle Bob." },
    { id: 3, name: "Martin Kleppmann", bio: "Researcher in distributed systems at the University of Cambridge." },
    { id: 4, name: "Thomas H. Cormen", bio: "Professor Emeritus of Computer Science at Dartmouth College." },
    { id: 5, name: "François Chollet", bio: "AI researcher at Google, creator of the Keras deep learning library." },
    { id: 6, name: "Erich Gamma", bio: "Lead architect of Eclipse Java Development Tools and VS Code." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Authors & Contributors Directory</h1>
          <p className="text-xs text-slate-500">
            Relational author entities supporting many-to-many bibliographic associations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((a) => {
          const authorBooks = books.filter(b => b.author.includes(a.name));
          return (
            <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                  {a.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{a.name}</h3>
                  <span className="text-[11px] text-[#164B78] font-semibold">{authorBooks.length} Associated Titles</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{a.bio}</p>
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('books')}
                  className="text-xs font-semibold text-[#164B78] hover:underline"
                >
                  View Titles in Catalog →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
