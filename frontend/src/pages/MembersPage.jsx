import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserX,
  ShieldAlert,
  Mail,
  Phone,
  Building,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function MembersPage() {
  const { members, setMembers, loans } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New member form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [membershipType, setMembershipType] = useState('Student');

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || m.membershipType === typeFilter;
    return matchesSearch && matchesType;
  });

  const toggleMemberBlock = (id) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'Blocked' ? 'Active' : 'Blocked';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const newId = Date.now();
    const newMember = {
      id: newId,
      membershipNumber: `MEM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      fullName,
      email,
      phone: phone || '+91 99999 88888',
      department,
      membershipType,
      registrationDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-06-30',
      status: 'Active',
      outstandingFine: 0.00,
      activeLoansCount: 0,
      maxLimit: membershipType === 'Faculty' ? 10 : 5
    };

    setMembers([newMember, ...members]);
    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Patron & Membership Directory</h1>
          <p className="text-xs text-slate-500">
            Manage student, faculty, and research patron accounts, borrowing permissions, and fine status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, Membership ID, Department..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#164B78]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Researcher">Researcher</option>
          </select>
        </div>
      </div>

      {/* Members Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name / ID</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Active Borrowing</th>
                <th className="py-3 px-4 text-center">Outstanding Fine</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{m.fullName}</p>
                    <p className="font-mono text-[10px] text-slate-500">{m.membershipNumber}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <p className="flex items-center gap-1.5 text-[11px]"><Mail className="w-3 h-3 text-slate-400" /> {m.email}</p>
                    <p className="flex items-center gap-1.5 text-[10px] text-slate-400"><Phone className="w-3 h-3" /> {m.phone}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{m.department}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {m.membershipType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {m.activeLoansCount} / {m.maxLimit}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {m.outstandingFine > 0 ? (
                      <span className="font-bold text-rose-600 font-mono">
                        ${m.outstandingFine.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">$0.00</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.status === 'Blocked'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleMemberBlock(m.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        m.status === 'Blocked'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {m.status === 'Blocked' ? 'Unblock Account' : 'Block Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Register New Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@university.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Membership Type</label>
                  <select
                    value={membershipType}
                    onChange={(e) => setMembershipType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Student">Student (Max 5)</option>
                    <option value="Faculty">Faculty (Max 10)</option>
                    <option value="Researcher">Researcher (Max 7)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-semibold shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
