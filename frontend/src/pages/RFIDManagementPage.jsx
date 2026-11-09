import React, { useState } from 'react';
import {
  Radio,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Volume2,
  VolumeX,
  Tag,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function RFIDManagementPage() {
  const { books } = useLibrary();

  // Scanning Simulator State
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannedTagsFeed, setScannedTagsFeed] = useState([]);
  const [selectedReader, setSelectedReader] = useState('DESK_READER_01');
  const [tagSearch, setTagSearch] = useState('');

  // Collect all tag items across books
  const allTags = [];
  books.forEach(b => {
    b.copies.forEach(c => {
      if (c.rfidUid) {
        allTags.push({
          uid: c.rfidUid,
          accessionNumber: c.accessionNumber,
          bookTitle: b.title,
          category: b.category,
          shelf: c.shelf,
          status: c.status,
          securityBit: c.status === 'Issued' ? 0 : 1, // 0 = Cleared (Issued), 1 = Armed (In library)
          tagType: 'HF 13.56 MHz ISO 15693 / 18000-3'
        });
      }
    });
  });

  const toggleScanSimulator = () => {
    if (isScanning) {
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    // Simulate real tag detection sequence
    let count = 0;
    const interval = setInterval(() => {
      if (count >= allTags.length) {
        clearInterval(interval);
        setIsScanning(false);
        return;
      }
      const tag = allTags[count];
      setScannedTagsFeed(prev => [
        {
          id: Date.now() + Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          uid: tag.uid,
          accession: tag.accessionNumber,
          title: tag.bookTitle,
          securityBit: tag.securityBit,
          status: 'SUCCESS'
        },
        ...prev.slice(0, 9)
      ]);
      count++;
    }, 800);
  };

  const filteredTags = allTags.filter(t =>
    t.uid.toLowerCase().includes(tagSearch.toLowerCase()) ||
    t.accessionNumber.toLowerCase().includes(tagSearch.toLowerCase()) ||
    t.bookTitle.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">RFID Middleware & Station Management</h1>
          <p className="text-xs text-slate-500">
            Configure mock RFID reader adapters, simulate live tag scanning, and manage tag-to-item associations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-200 font-bold flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>Total Active Tags: {allTags.length}</span>
          </span>
        </div>
      </div>

      {/* Interactive RFID Reader Simulator Panel */}
      <div className="bg-gradient-to-br from-slate-900 to-[#0B2942] rounded-2xl p-6 text-white shadow-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'}`}>
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Staff Station RFID Scanner Simulator</h2>
              <p className="text-xs text-slate-300">Device-neutral mock adapter: ISO 15693 / 18000-3 compliant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title={soundEnabled ? 'Mute Audio Confirmation' : 'Enable Audio Confirmation'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Reader Device Selector */}
            <select
              value={selectedReader}
              onChange={(e) => setSelectedReader(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl bg-slate-800 border border-slate-600 text-slate-200 font-mono"
            >
              <option value="DESK_READER_01">Staff Desk Reader #1 (USB HID)</option>
              <option value="KIOSK_READER_02">Self-Checkout Kiosk #2</option>
              <option value="MOBILE_HANDHELD_01">Zebra RFID Handheld #1</option>
            </select>

            {/* Start / Stop Scan Button */}
            <button
              onClick={toggleScanSimulator}
              className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                isScanning
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isScanning ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>Stop Scanning</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Live Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Scanned Burst Feed */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>LIVE SCAN STREAM (LAST READS)</span>
            {isScanning && (
              <span className="text-emerald-400 font-mono flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                POLLING TAGS AT 13.56 MHz...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scannedTagsFeed.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-slate-800/40 rounded-xl border border-slate-700/60 text-slate-400 text-xs">
                No active RFID bursts. Click <span className="text-emerald-400 font-bold">Start Live Scan</span> to trigger antenna polling.
              </div>
            ) : (
              scannedTagsFeed.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-slate-800/90 rounded-xl p-3 border border-slate-700 flex items-center justify-between animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-bold text-purple-300">{scan.uid}</p>
                    <p className="text-[11px] text-white font-medium truncate max-w-[170px]">{scan.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{scan.accession} • {scan.timestamp}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      READ OK
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${scan.securityBit === 1 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {scan.securityBit === 1 ? 'ARMED (BIT 1)' : 'CLEARED (BIT 0)'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RFID Tag Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">RFID Tag & Physical Copy Registry</h3>
            <p className="text-xs text-slate-400">Complete item-to-tag mapping, security bit state, and shelf assignments</p>
          </div>

          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search by RFID UID, Accession #, Title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#164B78]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">RFID Tag UID</th>
                <th className="py-2.5 px-3">Accession #</th>
                <th className="py-2.5 px-3">Associated Title</th>
                <th className="py-2.5 px-3">Shelf Location</th>
                <th className="py-2.5 px-3">Security Bit</th>
                <th className="py-2.5 px-3">Item Status</th>
                <th className="py-2.5 px-3 text-right">Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTags.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-purple-700">
                    {t.uid}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                    {t.accessionNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-[200px]">
                    {t.bookTitle}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {t.shelf}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.securityBit === 1
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {t.securityBit === 1 ? <ShieldAlert className="w-3 h-3 text-amber-600" /> : <ShieldCheck className="w-3 h-3 text-blue-600" />}
                      <span>{t.securityBit === 1 ? 'Armed (1)' : 'Cleared (0)'}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[10px] text-slate-400 font-mono">
                    ISO 15693
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
