import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  Mail,
  AlertTriangle,
  Play,
  CheckCircle2,
  Radio,
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function SecurityGatePage() {
  const { gateEvents, triggerGateEvent, books } = useLibrary();
  const [alarmSound, setAlarmSound] = useState(true);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState(null);

  const unauthorizedEvents = gateEvents.filter(e => e.authResult === 'UNAUTHORIZED');
  const authorizedEvents = gateEvents.filter(e => e.authResult === 'AUTHORIZED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">RFID Security Gate Portal & Loss Prevention</h1>
          <p className="text-xs text-slate-500">
            Real-time EAS security bit detection, theft alarm triggering, mock CCTV snapshot capture, and security alert queues.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerGateEvent(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Simulate Authorized Egress</span>
          </button>
          <button
            onClick={() => triggerGateEvent(true)}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 animate-bounce"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Simulate Unauthorized Theft</span>
          </button>
        </div>
      </div>

      {/* Live Gate Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Portal 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">Gate Portal #1 (Main Foyer)</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Antenna Frequency: <span className="font-mono font-semibold text-slate-700">13.56 MHz (HF)</span></p>
            <p>EAS Logic: <span className="font-semibold text-slate-700">AFI / EAS Bit Zero Checking</span></p>
            <p>Footfall Today: <span className="font-bold text-slate-800">1,420 Patrons</span></p>
          </div>
        </div>

        {/* Portal 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">Gate Portal #2 (West Wing)</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Antenna Frequency: <span className="font-mono font-semibold text-slate-700">13.56 MHz (HF)</span></p>
            <p>EAS Logic: <span className="font-semibold text-slate-700">AFI / EAS Bit Zero Checking</span></p>
            <p>Footfall Today: <span className="font-bold text-slate-800">890 Patrons</span></p>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">Security Gate Incident Stats</span>
            <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              {unauthorizedEvents.length} Alerts
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Authorized Departures: <span className="font-bold text-emerald-600">{authorizedEvents.length}</span></p>
            <p>Unauthorized Triggers: <span className="font-bold text-rose-600">{unauthorizedEvents.length}</span></p>
            <p>CCTV Snapshots Saved: <span className="font-bold text-slate-800">{gateEvents.length}</span></p>
          </div>
        </div>
      </div>

      {/* Gate Stream Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Live Security Gate Detection Stream</h3>
            <p className="text-xs text-slate-400">Continuous EAS security bit verification events with CCTV photographic logs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Event ID / Time</th>
                <th className="py-2.5 px-3">Portal Location</th>
                <th className="py-2.5 px-3">Accession / RFID UID</th>
                <th className="py-2.5 px-3">Item Title</th>
                <th className="py-2.5 px-3">Auth Verdict</th>
                <th className="py-2.5 px-3">Alarm State</th>
                <th className="py-2.5 px-3">CCTV Snapshot</th>
                <th className="py-2.5 px-3 text-right">Email Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gateEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <p className="font-mono font-bold text-slate-800">{evt.id}</p>
                    <p className="font-mono text-[10px] text-slate-400">{evt.timestamp}</p>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {evt.gateLocation}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-mono font-bold text-slate-800">{evt.accessionNumber}</p>
                    <p className="font-mono text-[10px] text-purple-700">{evt.rfidUid}</p>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-[180px]">
                    {evt.bookTitle}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.authResult === 'AUTHORIZED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                      }`}
                    >
                      {evt.authResult}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.alarmStatus === 'TRIGGERED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {evt.alarmStatus === 'TRIGGERED' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                      )}
                      <span>{evt.alarmStatus}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => setSelectedEventForDetail(evt)}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition-colors"
                      title="Inspect mock CCTV frame capture"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Snapshot</span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        evt.notificationStatus === 'QUEUED' || evt.notificationStatus === 'SENT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-400'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>{evt.notificationStatus}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CCTV Snapshot Preview Modal */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">CCTV Evidence Capture #{selectedEventForDetail.id}</h3>
                <p className="text-xs text-slate-400">{selectedEventForDetail.timestamp} • {selectedEventForDetail.gateLocation}</p>
              </div>
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Simulated CCTV Camera Frame */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700 h-64 flex flex-col justify-between p-4 text-white">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  REC • CAM_01_GATE_A
                </span>
                <span className="text-slate-300">{selectedEventForDetail.timestamp}</span>
              </div>

              {/* Wireframe simulated view */}
              <div className="text-center space-y-2">
                <Camera className="w-12 h-12 text-slate-500 mx-auto opacity-40" />
                <p className="font-mono text-xs text-emerald-400">RFID SCANNER INTERCEPT TRIGGER</p>
                <p className="text-[11px] text-slate-300 max-w-xs mx-auto">
                  Tag UID: {selectedEventForDetail.rfidUid} ({selectedEventForDetail.accessionNumber})
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                <span>FPS: 30 • 1080P HD</span>
                <span>Ref: {selectedEventForDetail.cctvReference}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-800">Automatic Action Summary:</p>
              <p className="text-slate-600">
                Mock security gate verified security bit (status: {selectedEventForDetail.securityBit}).
                {selectedEventForDetail.authResult === 'UNAUTHORIZED'
                  ? ' Alarm tone sounded, CCTV snapshot indexed to incident vault, and notification dispatched to Head Librarian.'
                  : ' Security bit confirmed cleared by prior circulation checkout. Authorized egress permitted.'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Dismiss Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
