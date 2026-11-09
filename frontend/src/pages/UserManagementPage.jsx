import React, { useState } from 'react';
import { Users, Shield, UserCheck, Key, Lock, CheckCircle2 } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', fullName: 'Chandra Vamshi', role: 'ADMIN', email: 'admin@aisys.local', status: 'Active', lastLogin: '2026-11-09 18:15' },
    { id: 2, username: 'librarian_1', fullName: 'Kavita Menon', role: 'LIBRARIAN', email: 'kavita.m@aisys.local', status: 'Active', lastLogin: '2026-11-09 17:40' },
    { id: 3, username: 'assistant_desk', fullName: 'Rahul Sharma', role: 'ASSISTANT', email: 'rahul.s@aisys.local', status: 'Active', lastLogin: '2026-11-09 16:20' },
    { id: 4, username: 'audit_viewer', fullName: 'Auditor External', role: 'VIEWER', email: 'audit@regulator.gov', status: 'Active', lastLogin: '2026-11-08 11:00' },
  ]);

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        if (u.username === 'admin') return u; // Admin cannot be disabled
        return { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Operator User Accounts & RBAC Roles</h1>
          <p className="text-xs text-slate-500">
            Enforce role-based access control across Admin, Librarian, Assistant, and Viewer tiers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { role: 'ADMIN', color: 'border-rose-200 bg-rose-50 text-rose-800', desc: 'Full unrestricted system access, backups, and user provisioning.' },
          { role: 'LIBRARIAN', color: 'border-blue-200 bg-blue-50 text-blue-800', desc: 'Manage cataloguing, patrons, circulation, and RFID middleware.' },
          { role: 'ASSISTANT', color: 'border-emerald-200 bg-emerald-50 text-emerald-800', desc: 'Perform checkout, checkin, and handheld inventory shelf scans.' },
          { role: 'VIEWER', color: 'border-slate-200 bg-slate-50 text-slate-800', desc: 'Read-only access to operational dashboards, charts, and reports.' },
        ].map((r, i) => (
          <div key={i} className={`p-4 rounded-xl border ${r.color} space-y-1.5`}>
            <span className="font-extrabold text-xs tracking-wider">{r.role}</span>
            <p className="text-[11px] opacity-80">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Username / Name</th>
              <th className="py-2.5 px-3">Email Address</th>
              <th className="py-2.5 px-3">Assigned Role</th>
              <th className="py-2.5 px-3">Last Login</th>
              <th className="py-2.5 px-3">Account Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3">
                  <p className="font-bold text-slate-900">{u.fullName}</p>
                  <p className="font-mono text-[10px] text-slate-400">@{u.username}</p>
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#164B78] border border-blue-200">
                    {u.role}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{u.lastLogin}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  {u.username !== 'admin' && (
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-rose-600"
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
