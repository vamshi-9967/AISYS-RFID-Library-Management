import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileText,
  Printer,
  TrendingUp,
  Radio,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function ReportsPage() {
  const { books, members, loans, gateEvents } = useLibrary();
  const [reportType, setReportType] = useState('circulation'); // 'circulation' | 'inventory' | 'fines' | 'gate'

  const handleExportCSV = () => {
    let csvData = "";
    if (reportType === 'circulation') {
      csvData = "LoanNumber,AccessionNumber,BookTitle,MemberName,IssueDate,DueDate,Status,FineAmount\n";
      loans.forEach(l => {
        csvData += `${l.loanNumber},${l.accessionNumber},"${l.bookTitle}","${l.memberName}",${l.issueDate},${l.dueDate},${l.status},${l.fineAmount}\n`;
      });
    } else if (reportType === 'inventory') {
      csvData = "BookID,Title,ISBN,Category,TotalCopies,AvailableCopies\n";
      books.forEach(b => {
        csvData += `${b.id},"${b.title}",${b.isbn},"${b.category}",${b.copies.length},${b.availableCopies}\n`;
      });
    } else {
      csvData = "EventID,Timestamp,Location,Accession,RFIDUID,Result,AlarmStatus\n";
      gateEvents.forEach(e => {
        csvData += `${e.id},${e.timestamp},"${e.gateLocation}",${e.accessionNumber},${e.rfidUid},${e.authResult},${e.alarmStatus}\n`;
      });
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AISYS_${reportType.toUpperCase()}_REPORT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports & Operational Intelligence</h1>
          <p className="text-xs text-slate-500">
            Generate formal administrative summaries, circulation audit trails, and loss-prevention metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'circulation', label: 'Circulation & Loans Summary', icon: TrendingUp },
          { id: 'inventory', label: 'Collection & Physical Stock', icon: BookOpen },
          { id: 'fines', label: 'Overdue Fines & Revenue', icon: DollarSign },
          { id: 'gate', label: 'Security Gate Loss Prevention', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#164B78] text-white border-[#164B78] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
              {reportType.toUpperCase()} DATA RECONCILIATION PREVIEW
            </h3>
            <p className="text-xs text-slate-400">Calculated directly from live database transactions</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            Generated: {new Date().toLocaleDateString()}
          </span>
        </div>

        {reportType === 'circulation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Loan ID</th>
                  <th className="py-2.5 px-3">Item Accession #</th>
                  <th className="py-2.5 px-3">Book Title</th>
                  <th className="py-2.5 px-3">Patron Name</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{l.loanNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{l.accessionNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{l.bookTitle}</td>
                    <td className="py-2.5 px-3 text-slate-700">{l.memberName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{l.issueDate}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{l.dueDate}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">ISBN</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Total Copies</th>
                  <th className="py-2.5 px-3 text-right">Shelf Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{b.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{b.author}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{b.isbn}</td>
                    <td className="py-2.5 px-3">{b.category}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{b.copies.length}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{b.availableCopies} Copies</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'fines' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Member ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Account Status</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{m.membershipNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{m.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.department}</td>
                    <td className="py-2.5 px-3 font-bold">{m.status}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      ${m.outstandingFine.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'gate' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Gate Portal</th>
                  <th className="py-2.5 px-3">Accession Number</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3 text-right">Alarm Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gateEvents.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{e.id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{e.timestamp}</td>
                    <td className="py-2.5 px-3 text-slate-700">{e.gateLocation}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{e.accessionNumber}</td>
                    <td className="py-2.5 px-3 font-bold">{e.authResult}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700">{e.alarmStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
