import React from 'react';
import {
  BookOpen,
  Copy,
  Users,
  UserCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Radio,
  FileQuestion,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Scan,
  Repeat,
  ShieldCheck,
  Camera,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useLibrary } from '../context/LibraryContext';

export default function DashboardPage() {
  const { books, members, loans, gateEvents, setActiveTab, triggerGateEvent } = useLibrary();

  // Calculate real metrics from state
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.copies.length, 0);
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const availableCopies = books.reduce((acc, b) => acc + b.copies.filter(c => c.status === 'Available').length, 0);
  const issuedCopies = loans.filter(l => l.status === 'Issued' || l.status === 'Overdue').length;
  const overdueLoans = loans.filter(l => l.status === 'Overdue').length;
  const rfidTaggedCopies = books.reduce((acc, b) => acc + b.copies.filter(c => c.rfidUid).length, 0);
  const untaggedCopies = totalCopies - rfidTaggedCopies;
  const missingItemsCount = 1; // From inventory audit sample
  const totalFines = members.reduce((acc, m) => acc + m.outstandingFine, 0);
  const gateAlertsCount = gateEvents.filter(e => e.authResult === 'UNAUTHORIZED').length;

  // Chart 1: Monthly circulation trends
  const circulationData = [
    { month: 'Jun', issues: 180, returns: 165 },
    { month: 'Jul', issues: 240, returns: 210 },
    { month: 'Aug', issues: 320, returns: 290 },
    { month: 'Sep', issues: 410, returns: 380 },
    { month: 'Oct', issues: 490, returns: 450 },
    { month: 'Nov', issues: 530, returns: 480 },
  ];

  // Chart 2: Category Distribution
  const categoryData = [
    { name: 'Computer Science', value: 4, color: '#164B78' },
    { name: 'Software Eng', value: 3, color: '#0284C7' },
    { name: 'Architecture', value: 2, color: '#0EA5E9' },
    { name: 'AI & Data', value: 2, color: '#38BDF8' },
    { name: 'Cloud/DevOps', value: 1, color: '#7DD3FC' },
  ];

  // Chart 3: Available vs Issued
  const availabilityData = [
    { name: 'Comp Science', available: 5, issued: 4 },
    { name: 'Software Eng', available: 4, issued: 3 },
    { name: 'Architecture', available: 3, issued: 2 },
    { name: 'AI & Deep Learning', available: 1, issued: 2 },
    { name: 'DevOps & Cloud', available: 2, issued: 0 },
  ];

  const statCards = [
    { label: 'Book Titles', val: totalTitles, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Physical Copies', val: totalCopies, icon: Copy, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Active Members', val: `${activeMembers} / ${totalMembers}`, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Available on Shelf', val: availableCopies, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { label: 'Issued Books', val: issuedCopies, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
    { label: 'Overdue Books', val: overdueLoans, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { label: 'RFID Tagged Items', val: `${rfidTaggedCopies} (${Math.round((rfidTaggedCopies/totalCopies)*100)}%)`, icon: Radio, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Untagged Items', val: untaggedCopies, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Missing / Misplaced', val: missingItemsCount, icon: FileQuestion, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { label: 'Total Pending Fines', val: `$${totalFines.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { label: 'Security Gate Alerts', val: gateAlertsCount, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'RFID Health Status', val: 'Active 99.8%', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-[#0B2942] via-[#164B78] to-blue-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10 pointer-events-none">
          <Radio className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/30 text-xs font-semibold uppercase tracking-wider">
                Production Control Center
              </span>
              <span className="text-xs text-blue-200 font-mono">Build 2.4.0 (Windows 11 Verified)</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              AISYS RFID-Enabled Library System
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl mt-1">
              Integrated real-time RFID middleware, ILMS protocol boundaries (NCIP/SIP2), automated loss prevention gate, and spreadsheet migration pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('circulation')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#164B78] hover:bg-blue-50 font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <Repeat className="w-4 h-4 text-[#164B78]" />
              <span>Issue / Return Book</span>
            </button>
            <button
              onClick={() => setActiveTab('rfid_management')}
              className="px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-300/30 font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>RFID Scanner</span>
            </button>
            <button
              onClick={() => triggerGateEvent(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 animate-pulse"
              title="Simulate unauthorized book passing through gate"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Simulate Gate Alarm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12 Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl p-4 border ${card.border} shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight truncate">
                  {card.label}
                </span>
                <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                {card.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Monthly Circulation Activity</h3>
              <p className="text-xs text-slate-400">Total book issues vs returns over the last 6 months</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#164B78] border border-blue-200">
              +14% Growth
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={circulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#164B78" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#164B78" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B2942', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="issues" name="Book Issues" stroke="#164B78" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIssues)" />
                <Area type="monotone" dataKey="returns" name="Book Returns" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-800">Collection by Discipline</h3>
              <span className="text-xs text-slate-400">Total 5 Domains</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Bibliographic cataloguing balance</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B2942', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 font-medium">{c.name}</span>
                </div>
                <span className="font-bold text-slate-800">{c.value} Titles</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Live Security Gate Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Circulation Transactions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Recent Circulation Transactions</h3>
              <p className="text-xs text-slate-400">Real-time loans & returns tracked across library terminals</p>
            </div>
            <button
              onClick={() => setActiveTab('circulation')}
              className="text-xs font-semibold text-[#164B78] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Item / Title</th>
                  <th className="py-2.5 px-3">Patron</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.slice(0, 4).map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800 truncate max-w-[180px]">{loan.bookTitle}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{loan.accessionNumber}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-700">{loan.memberName}</p>
                      <p className="text-[10px] text-slate-400">{loan.membershipNumber}</p>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {loan.dueDate}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loan.status === 'Issued'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : loan.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Gate Events Log */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">RFID Security Gate Events</h3>
              <p className="text-xs text-slate-400">Live monitoring stream from entrance & exit portals</p>
            </div>
            <button
              onClick={() => setActiveTab('security_gate')}
              className="text-xs font-semibold text-[#164B78] hover:underline flex items-center gap-1"
            >
              <span>Gate Monitor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Timestamp / Gate</th>
                  <th className="py-2.5 px-3">RFID UID / Title</th>
                  <th className="py-2.5 px-3">Alarm State</th>
                  <th className="py-2.5 px-3 text-right">CCTV Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gateEvents.slice(0, 4).map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-mono text-slate-600 text-[11px]">{evt.timestamp}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{evt.gateLocation}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800 truncate max-w-[160px]">{evt.bookTitle}</p>
                      <p className="text-[10px] text-purple-700 font-mono">{evt.rfidUid}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.alarmStatus === 'TRIGGERED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evt.alarmStatus === 'TRIGGERED' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />}
                        {evt.alarmStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <Camera className="w-3 h-3 text-slate-400" />
                        <span>{evt.cctvReference ? 'PHOTO_OK' : 'N/A'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
