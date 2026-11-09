import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
  Download
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function AuditLogsPage() {
  const { auditLogs } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Immutable Audit Trail & Security Logs</h1>
          <p className="text-xs text-slate-500">
            Append-only record of all administrative, circulation, RFID tagging, and security events.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by user, action, detail..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#164B78]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="BOOK_ISSUE">BOOK_ISSUE</option>
            <option value="BOOK_RETURN">BOOK_RETURN</option>
            <option value="SECURITY_GATE_ALARM">SECURITY_GATE_ALARM</option>
            <option value="RFID_TAG_WRITE">RFID_TAG_WRITE</option>
            <option value="SETTINGS_UPDATE">SETTINGS_UPDATE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Event Action</th>
                <th className="py-2.5 px-3">Resource Target</th>
                <th className="py-2.5 px-3">Details / Context</th>
                <th className="py-2.5 px-3 text-right">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {l.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {l.user}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.action.includes('ALARM')
                        ? 'bg-rose-100 text-rose-800'
                        : l.action.includes('ISSUE')
                        ? 'bg-blue-100 text-blue-800'
                        : l.action.includes('RETURN')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {l.resource} ({l.resourceId})
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                    {l.details}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                    {l.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
