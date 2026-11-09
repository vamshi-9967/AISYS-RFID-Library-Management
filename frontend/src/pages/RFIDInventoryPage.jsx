import React, { useState } from 'react';
import {
  Boxes,
  Scan,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Check,
  ShieldCheck,
  Download,
  Percent
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function RFIDInventoryPage() {
  const { books } = useLibrary();

  const [selectedShelf, setSelectedShelf] = useState('Shelf A-1');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditCompleted, setAuditCompleted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [scannedUids, setScannedUids] = useState(new Set());

  // Shelves list
  const shelves = ['Shelf A-1', 'Shelf A-2', 'Shelf B-1', 'Shelf B-2', 'Reference Section R-1'];

  // Expected items on selected shelf
  const expectedItems = [];
  books.forEach(b => {
    b.copies.forEach(c => {
      if (c.shelf === selectedShelf) {
        expectedItems.push({
          accessionNumber: c.accessionNumber,
          rfidUid: c.rfidUid,
          bookTitle: b.title,
          status: c.status
        });
      }
    });
  });

  const handleStartAudit = () => {
    setIsAuditing(true);
    setAuditCompleted(false);
    setScannedUids(new Set());

    // Simulate handheld RFID sweep:
    // Some items found, 1 missing, 1 unexpected/misplaced
    let foundUids = new Set();
    let index = 0;

    const interval = setInterval(() => {
      if (index >= expectedItems.length) {
        // Also simulate an unexpected tag read from another shelf (misplaced book!)
        foundUids.add('E280116060000223'); // From Shelf B-2
        setScannedUids(new Set(foundUids));
        clearInterval(interval);
        setIsAuditing(false);
        setAuditCompleted(true);
        return;
      }

      // Simulate skipping the 2nd item (making it MISSING)
      if (index !== 1) {
        foundUids.add(expectedItems[index].rfidUid);
        setScannedUids(new Set(foundUids));
      }
      index++;
    }, 600);
  };

  const handleResetAudit = () => {
    setIsAuditing(false);
    setAuditCompleted(false);
    setScannedUids(new Set());
  };

  // Analyze results
  const foundItems = expectedItems.filter(item => scannedUids.has(item.rfidUid));
  const missingItems = expectedItems.filter(item => !scannedUids.has(item.rfidUid));
  const unexpectedUid = 'E280116060000223';
  const hasUnexpected = scannedUids.has(unexpectedUid);

  const completionPercent = expectedItems.length > 0
    ? Math.round((foundItems.length / expectedItems.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">RFID Shelf Inventory & Stock Verification</h1>
          <p className="text-xs text-slate-500">
            Rapid stock auditing using simulated handheld RFID sweep. Detect missing, found, and misplaced books.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title={soundMuted ? 'Unmute Audio Beeps' : 'Mute Audio Beeps'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Control Bar & Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Target Shelf:</span>
            <select
              value={selectedShelf}
              onChange={(e) => { setSelectedShelf(e.target.value); handleResetAudit(); }}
              disabled={isAuditing}
              className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#164B78]"
            >
              {shelves.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500">({expectedItems.length} items catalogued on shelf)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetAudit}
              disabled={isAuditing || scannedUids.size === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleStartAudit}
              disabled={isAuditing}
              className={`px-6 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 ${
                isAuditing
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-[#164B78] hover:bg-[#0B2942]'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{isAuditing ? 'Scanning Shelf Antennas...' : 'Trigger Handheld Sweep'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Verification Progress</span>
            <span className="text-[#164B78]">{completionPercent}% Complete</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Results Counter Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Expected On Shelf</p>
            <p className="text-lg font-extrabold text-slate-800">{expectedItems.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-[10px] font-bold text-emerald-700 uppercase">Found / Verified</p>
            <p className="text-lg font-extrabold text-emerald-800">{foundItems.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <p className="text-[10px] font-bold text-rose-700 uppercase">Missing / Not Detected</p>
            <p className="text-lg font-extrabold text-rose-800">{auditCompleted ? missingItems.length : '-'}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[10px] font-bold text-amber-700 uppercase">Misplaced / Unexpected</p>
            <p className="text-lg font-extrabold text-amber-800">{hasUnexpected ? '1' : '0'}</p>
          </div>
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">Shelf Item Audit & Discrepancy Breakdown</h3>
          {auditCompleted && (
            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Audit Session Complete</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Accession Number</th>
                <th className="py-2.5 px-3">RFID Tag UID</th>
                <th className="py-2.5 px-3">Book Title</th>
                <th className="py-2.5 px-3">Expected Shelf</th>
                <th className="py-2.5 px-3 text-right">Audit Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expectedItems.map((item, idx) => {
                const isFound = scannedUids.has(item.rfidUid);
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {item.accessionNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-purple-700">
                      {item.rfidUid}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {item.bookTitle}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {selectedShelf}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {auditCompleted ? (
                        isFound ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Found On Shelf</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>MISSING</span>
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 font-medium">Pending Scan</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Unexpected / Misplaced Item Row */}
              {hasUnexpected && (
                <tr className="bg-amber-50/60 border-t-2 border-amber-300">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-900">
                    ACC-DO-00120
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-800">
                    {unexpectedUid}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-900">
                    Kubernetes: Up and Running
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-800">
                    Catalogued: Shelf B-2 (Misplaced here!)
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>MISPLACED ITEM</span>
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
