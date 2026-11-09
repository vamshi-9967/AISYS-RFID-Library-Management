import React, { useState } from 'react';
import {
  Repeat,
  BookPlus,
  BookCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  User,
  Radio,
  DollarSign,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function CirculationPage() {
  const { members, books, loans, issueBook, returnBook, settings } = useLibrary();

  // Circulation action tab
  const [circulationMode, setCirculationMode] = useState('issue'); // 'issue' | 'return'

  // Issue Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [issueAccessionNumber, setIssueAccessionNumber] = useState('');
  const [issueFeedback, setIssueFeedback] = useState(null);

  // Return Form State
  const [returnAccessionNumber, setReturnAccessionNumber] = useState('');
  const [returnFeedback, setReturnFeedback] = useState(null);

  // Table filter
  const [loanSearch, setLoanSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const selectedMember = members.find(m => m.id === parseInt(selectedMemberId));

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!selectedMemberId || !issueAccessionNumber.trim()) return;

    const res = issueBook(selectedMemberId, issueAccessionNumber);
    setIssueFeedback(res);
    if (res.success) {
      setIssueAccessionNumber('');
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnAccessionNumber.trim()) return;

    const res = returnBook(returnAccessionNumber);
    setReturnFeedback(res);
    if (res.success) {
      setReturnAccessionNumber('');
    }
  };

  const filteredLoans = loans.filter(l => {
    const matchesSearch =
      l.bookTitle.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.memberName.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.accessionNumber.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.rfidUid.toLowerCase().includes(loanSearch.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Circulation Management Hub</h1>
          <p className="text-xs text-slate-500">
            Enforce rule-based loan policies, due-date calculation, fine verification, and barcode/RFID checkout.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 border border-slate-300/40">
          <button
            onClick={() => { setCirculationMode('issue'); setIssueFeedback(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              circulationMode === 'issue'
                ? 'bg-[#164B78] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookPlus className="w-4 h-4" />
            <span>Check-Out (Issue)</span>
          </button>
          <button
            onClick={() => { setCirculationMode('return'); setReturnFeedback(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              circulationMode === 'return'
                ? 'bg-[#164B78] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookCheck className="w-4 h-4" />
            <span>Check-In (Return)</span>
          </button>
        </div>
      </div>

      {/* Circulation Workbench Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        {circulationMode === 'issue' ? (
          /* ISSUE WORKFLOW FORM */
          <form onSubmit={handleIssueSubmit} className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookPlus className="w-5 h-5 text-[#164B78]" />
              <h3 className="font-bold text-sm text-slate-800">Book Check-Out (Issue Workflow)</h3>
              <span className="text-xs bg-blue-50 text-[#164B78] px-2.5 py-0.5 rounded-full font-mono border border-blue-200 ml-auto">
                Configured Loan Duration: {settings.loanDurationDays} Days
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Member Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Step 1: Select Borrowing Patron
                </label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => { setSelectedMemberId(e.target.value); setIssueFeedback(null); }}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#164B78]"
                >
                  <option value="">-- Choose Member Profile --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.membershipNumber}) - {m.membershipType} [{m.status}]
                    </option>
                  ))}
                </select>

                {/* Live Patron Status Card */}
                {selectedMember && (
                  <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                    selectedMember.status === 'Active' && selectedMember.outstandingFine < settings.maxFineBlockThreshold
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/60 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{selectedMember.fullName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedMember.status === 'Active' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                      }`}>
                        {selectedMember.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 font-medium text-[11px]">
                      <div>
                        <p className="text-slate-500">Department</p>
                        <p className="font-semibold">{selectedMember.department}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Active Loans</p>
                        <p className="font-semibold">{selectedMember.activeLoansCount} / {selectedMember.maxLimit}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Pending Fine</p>
                        <p className={`font-semibold ${selectedMember.outstandingFine > 0 ? 'text-rose-600 font-bold' : ''}`}>
                          ${selectedMember.outstandingFine.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {selectedMember.status === 'Blocked' && (
                      <p className="text-[11px] font-bold text-rose-700 flex items-center gap-1.5 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Account is blocked. Circulation operations prohibited by system rule.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Book Item Accession / RFID Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Step 2: Enter Accession Number or Scan RFID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={issueAccessionNumber}
                    onChange={(e) => setIssueAccessionNumber(e.target.value)}
                    placeholder="e.g. ACC-CS-00101, ACC-SE-00111..."
                    className="w-full text-xs font-mono py-2.5 pl-3 pr-28 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#164B78]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setIssueAccessionNumber('ACC-CS-00101')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-600"
                      title="Quick fill available copy"
                    >
                      Fill CS-101
                    </button>
                    <button
                      type="button"
                      onClick={() => setIssueAccessionNumber('ACC-CS-00105')}
                      className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-[10px] font-mono text-amber-800"
                      title="Test reference restriction"
                    >
                      Fill Ref-105
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#164B78]" />
                    Automatic Security Bit Verification:
                  </p>
                  <p>Upon authorized issue, the RFID Tag Security Bit is cleared (disarmed) so the security gate allows patron egress without triggering alarm.</p>
                </div>
              </div>
            </div>

            {/* Feedback Alert */}
            {issueFeedback && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                issueFeedback.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {issueFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm">{issueFeedback.success ? 'Issue Approved' : 'Circulation Policy Block'}</p>
                  <p className="mt-0.5">{issueFeedback.message}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <BookPlus className="w-4 h-4" />
                <span>Execute Check-Out & Arm RFID Pass</span>
              </button>
            </div>
          </form>
        ) : (
          /* RETURN WORKFLOW FORM */
          <form onSubmit={handleReturnSubmit} className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800">Book Check-In (Return Workflow)</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono ml-auto">
                Overdue Rate: ${settings.finePerDay.toFixed(2)} / Day
              </span>
            </div>

            <div className="max-w-xl space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Scan RFID Tag or Enter Accession Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={returnAccessionNumber}
                  onChange={(e) => setReturnAccessionNumber(e.target.value)}
                  placeholder="Enter Accession # (e.g. ACC-CS-00102, ACC-AI-00123)..."
                  className="w-full text-xs font-mono py-2.5 pl-3 pr-28 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#164B78]"
                />
                <button
                  type="button"
                  onClick={() => setReturnAccessionNumber('ACC-CS-00102')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-600"
                >
                  Fill CS-102 (Overdue)
                </button>
              </div>
            </div>

            {returnFeedback && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                returnFeedback.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {returnFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm">{returnFeedback.success ? 'Return Processed' : 'Error'}</p>
                  <p className="mt-0.5">{returnFeedback.message}</p>
                </div>
              </div>
            )}

            <div className="flex justify-start pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <BookCheck className="w-4 h-4" />
                <span>Process Return & Re-Arm Security Bit</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Loans & Due Date Enquiry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Circulation Records & Due Date Enquiry</h3>
            <p className="text-xs text-slate-400">All issued loans with real-time overdue and fine tracking</p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={loanSearch}
                onChange={(e) => setLoanSearch(e.target.value)}
                placeholder="Search loan, book, patron..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#164B78]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Issued">Issued (Active)</option>
              <option value="Overdue">Overdue Only</option>
              <option value="Returned">Returned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Loan ID / Accession</th>
                <th className="py-2.5 px-3">Book Title</th>
                <th className="py-2.5 px-3">Patron Name</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Fine Calc</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <p className="font-mono font-bold text-slate-800">{l.loanNumber}</p>
                    <p className="font-mono text-[10px] text-slate-400">{l.accessionNumber}</p>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{l.bookTitle}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-slate-800">{l.memberName}</p>
                    <p className="text-[10px] text-slate-400">{l.membershipNumber}</p>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{l.issueDate}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{l.dueDate}</td>
                  <td className="py-2.5 px-3">
                    {l.fineAmount > 0 ? (
                      <span className="font-bold text-rose-600 font-mono">
                        ${l.fineAmount.toFixed(2)} ({l.overdueDays}d)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">$0.00</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'Issued'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : l.status === 'Overdue'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {l.status}
                    </span>
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
