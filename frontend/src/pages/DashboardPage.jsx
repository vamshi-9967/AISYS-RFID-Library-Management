import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Users,
  Clock,
  AlertCircle,
  Radio,
  RadioTower,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Plus,
  BookPlus,
  BookCheck,
  Tag,
  Boxes,
  Scan,
  Camera,
  Calendar,
  ArrowRight,
  Filter,
  Check,
  HelpCircle,
  AlertTriangle
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
  const { books, members, loans, gateEvents, setActiveTab, triggerGateEvent, darkMode } = useLibrary();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState('Last 30 Days');

  // Real calculations
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.copies.length, 0);
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const availableCopies = books.reduce((acc, b) => acc + b.copies.filter(c => c.status === 'Available').length, 0);
  const issuedLoans = loans.filter(l => l.status === 'Issued');
  const overdueLoans = loans.filter(l => l.status === 'Overdue');
  const rfidTaggedCopies = books.reduce((acc, b) => acc + b.copies.filter(c => c.rfidUid).length, 0);
  const taggingPercentage = totalCopies > 0 ? Math.round((rfidTaggedCopies / totalCopies) * 100) : 0;
  const totalFines = members.reduce((acc, m) => acc + m.outstandingFine, 0);
  const gateAlertsCount = gateEvents.filter(e => e.authResult === 'UNAUTHORIZED').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Chart 1: Circulation Monthly Trends
  const circulationData = [
    { month: 'Jun', issues: 180, returns: 165 },
    { month: 'Jul', issues: 240, returns: 210 },
    { month: 'Aug', issues: 320, returns: 290 },
    { month: 'Sep', issues: 410, returns: 380 },
    { month: 'Oct', issues: 490, returns: 450 },
    { month: 'Nov', issues: 530, returns: 480 },
  ];

  // Chart 2: Collection Categories
  const categoryData = [
    { name: 'Computer Science', value: 4, color: '#164B78' },
    { name: 'Software Engineering', value: 3, color: '#2563EB' },
    { name: 'Architecture', value: 2, color: '#0EA5E9' },
    { name: 'AI & Data Science', value: 2, color: '#38BDF8' },
    { name: 'Cloud & DevOps', value: 1, color: '#93C5FD' },
  ];

  // 6 Primary KPI Cards (as specified in Section 5)
  const kpiCards = [
    {
      title: 'Total Books',
      value: totalTitles,
      sublabel: `${totalCopies} physical copies catalogued`,
      icon: BookOpen,
      change: '+12% this term',
      color: 'text-[#164B78] dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      border: 'border-blue-100 dark:border-blue-900/40'
    },
    {
      title: 'Registered Members',
      value: totalMembers,
      sublabel: `${activeMembers} active with borrowing rights`,
      icon: Users,
      change: '100% verified',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      border: 'border-indigo-100 dark:border-indigo-900/40'
    },
    {
      title: 'Books Issued',
      value: issuedLoans.length,
      sublabel: `${issuedLoans.length + overdueLoans.length} total active on loan`,
      icon: Clock,
      change: 'Normal circulation volume',
      color: 'text-[#2563EB] dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/50',
      border: 'border-sky-100 dark:border-sky-900/40'
    },
    {
      title: 'Overdue Books',
      value: overdueLoans.length,
      sublabel: `$${totalFines.toFixed(2)} pending fine penalties`,
      icon: AlertCircle,
      change: overdueLoans.length > 0 ? 'Requires attention' : 'Zero overdue',
      isWarning: overdueLoans.length > 0,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-100 dark:border-rose-900/40'
    },
    {
      title: 'RFID Tagged Items',
      value: `${rfidTaggedCopies}`,
      sublabel: `${taggingPercentage}% total inventory coverage`,
      icon: Radio,
      change: 'ISO 15693 compliant',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      border: 'border-purple-100 dark:border-purple-900/40'
    },
    {
      title: 'Active RFID Readers',
      value: '3 Online',
      sublabel: 'Desk Station, Kiosk, Zebra Handheld',
      icon: RadioTower,
      change: 'Simulated Adapters Active',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-100 dark:border-emerald-900/40'
    },
  ];

  // 6 Quick Actions Cards (Section 7)
  const quickActions = [
    { title: 'Register New Book', desc: 'Add title and physical copies', icon: Plus, tab: 'books', color: 'bg-blue-50 dark:bg-blue-950/30 text-[#164B78] dark:text-blue-300 border-blue-200 dark:border-blue-900/50' },
    { title: 'Register New Member', desc: 'Add student or faculty patron', icon: Users, tab: 'members', color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50' },
    { title: 'Issue Book (Check-Out)', desc: 'Scan barcode/RFID and loan item', icon: BookPlus, tab: 'circulation', color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50' },
    { title: 'Return Book (Check-In)', desc: 'Process return & overdue fines', icon: BookCheck, tab: 'circulation', color: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/50' },
    { title: 'RFID Tag Encoding', desc: 'Encode new UHF/HF tags', icon: Tag, tab: 'rfid_management', color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50' },
    { title: 'Start Inventory Scan', desc: 'Audit shelf against catalog', icon: Scan, tab: 'rfid_inventory', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white dark:bg-[#0B1928] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-[#172B4D] dark:text-slate-100 tracking-tight">
              Welcome Back, Chandra Vamshi
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#164B78] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
              Administrator
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Monitor library operations, RFID activity, circulation, and system intelligence from one central workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] bg-[#F4F7FB] dark:bg-[#0F2236] text-[#172B4D] dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#164B78]"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>Last 30 Days</option>
            <option>Academic Term 2026</option>
          </select>

          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] bg-white dark:bg-[#0F2236] hover:bg-[#F4F7FB] dark:hover:bg-[#132A44] text-[#172B4D] dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            title="Refresh real-time dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#164B78] dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 6 Responsive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white dark:bg-[#0B1928] rounded-2xl p-4.5 border ${card.border} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 truncate">
                    {card.title}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#172B4D] dark:text-slate-100 tracking-tight">
                  {card.value}
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{card.sublabel}</span>
                <span className={`text-[10px] font-bold ${card.isWarning ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Section (Recharts Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B1928] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xs flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm text-[#172B4D] dark:text-slate-100">Circulation Activity Trends</h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Monthly book issues vs returns across campus library terminals</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#164B78] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              +14% Circulation Velocity
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
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E3A5F" : "#F1F5F9"} />
                <XAxis dataKey="month" stroke={darkMode ? "#64748B" : "#94A3B8"} fontSize={11} />
                <YAxis stroke={darkMode ? "#64748B" : "#94A3B8"} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B2942', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="issues" name="Book Issues" stroke="#164B78" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIssues)" />
                <Area type="monotone" dataKey="returns" name="Book Returns" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection Distribution (Donut Chart) */}
        <div className="bg-white dark:bg-[#0B1928] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xs flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-sm text-[#172B4D] dark:text-slate-100">Collection Distribution</h2>
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400">5 Disciplines</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-2">Cataloguing balance across main academic categories</p>
          </div>

          <div className="h-50 w-full">
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
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[140px]">{c.name}</span>
                </div>
                <span className="font-bold text-[#172B4D] dark:text-slate-100">{c.value} Titles</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid (Section 7) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#172B4D] dark:text-slate-100 uppercase tracking-wide">
          Quick Operational Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {quickActions.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(qa.tab)}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] shadow-2xs hover:shadow-xs flex flex-col justify-between ${qa.color}`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#07131F]/80 shadow-2xs flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#172B4D] dark:text-slate-100">{qa.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{qa.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-semibold">
                  <span>Open Module</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RFID Operations & Loss Prevention Section (Section 8) */}
      <div className="bg-white dark:bg-[#0B1928] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xs space-y-4 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#164B78] dark:text-blue-400" />
              <h2 className="font-bold text-base text-[#172B4D] dark:text-slate-100">RFID Operations & Middleware Monitoring</h2>
              <span className="text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                Simulated Mock Adapters
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Device-neutral hardware abstraction layer simulating HF 13.56 MHz ISO 15693 readers and security portals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rfid_management')}
              className="px-4 py-2 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>RFID Station Console</span>
            </button>
            <button
              onClick={() => triggerGateEvent(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 animate-pulse"
              title="Test loss-prevention siren and CCTV logging"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Trigger Test Theft Alarm</span>
            </button>
          </div>
        </div>

        {/* 3 Reader Devices Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#0F2236] border border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-[#172B4D] dark:text-slate-100">Staff Desk Reader #1</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">USB HID • ISO 15693 / 18000-3</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Connected (Simulated)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#0F2236] border border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-[#172B4D] dark:text-slate-100">Self-Checkout Kiosk #2</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">TCP/IP • Multi-Tag Burst Reader</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Connected (Simulated)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#0F2236] border border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-[#172B4D] dark:text-slate-100">Security Gate Portal A</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">EAS Bit Detection & CCTV Intercept</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Security Gate Alerts Section (Section 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Circulation Transactions */}
        <div className="bg-white dark:bg-[#0B1928] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xs space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-sm text-[#172B4D] dark:text-slate-100">Recent Circulation Activity</h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Active book check-outs, returns, and renewals</p>
            </div>
            <button
              onClick={() => setActiveTab('circulation')}
              className="text-xs font-semibold text-[#164B78] dark:text-blue-400 hover:underline"
            >
              View Hub →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {loans.slice(0, 5).map((l) => (
              <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#172B4D] dark:text-slate-200 truncate max-w-[200px]">{l.bookTitle}</p>
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono">
                    {l.accessionNumber} • Patron: {l.memberName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Due {l.dueDate}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'Issued'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : l.status === 'Overdue'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Gate Loss Prevention Feed */}
        <div className="bg-white dark:bg-[#0B1928] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xs space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-sm text-[#172B4D] dark:text-slate-100">Security Gate Events & Alerts</h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Live anti-theft egress alarms and CCTV capture logs</p>
            </div>
            <button
              onClick={() => setActiveTab('security_gate')}
              className="text-xs font-semibold text-[#164B78] dark:text-blue-400 hover:underline"
            >
              Gate Monitor →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {gateEvents.slice(0, 5).map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172B4D] dark:text-slate-200 truncate max-w-[180px]">{evt.bookTitle}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      evt.authResult === 'AUTHORIZED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}>
                      {evt.authResult}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    UID: {evt.rfidUid} • {evt.timestamp}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <Camera className="w-3 h-3 text-slate-400" />
                    <span>CCTV</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      evt.alarmStatus === 'TRIGGERED'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {evt.alarmStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Preview Section (Section 10) */}
      <div className="bg-white dark:bg-[#0B1928] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xs space-y-3 transition-colors duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <h2 className="font-bold text-sm text-[#172B4D] dark:text-slate-100">Formal Library Reports & Analytics</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Audited reporting categories ready for export and administrative review</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-[#164B78] dark:text-blue-400 hover:underline"
          >
            Open Reports Center →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Circulation Summary', count: `${loans.length} Transactions`, desc: 'Loans, returns & renewal velocity', tab: 'reports' },
            { title: 'Physical Stock Inventory', count: `${totalCopies} Copies`, desc: 'Shelf reconciliation & status audit', tab: 'reports' },
            { title: 'Overdue Fines & Revenue', count: `$${totalFines.toFixed(2)} Pending`, desc: 'Patron penalty and settlement logs', tab: 'reports' },
            { title: 'Loss Prevention Gate Logs', count: `${gateEvents.length} Events Recorded`, desc: 'Theft alarms & CCTV snapshot index', tab: 'reports' },
          ].map((r, i) => (
            <div
              key={i}
              onClick={() => setActiveTab(r.tab)}
              className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#164B78] dark:hover:border-blue-500 bg-[#F4F7FB]/50 dark:bg-[#0F2236]/50 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
            >
              <p className="font-bold text-xs text-[#172B4D] dark:text-slate-200 group-hover:text-[#164B78] dark:group-hover:text-blue-400 transition-colors">{r.title}</p>
              <p className="text-sm font-extrabold text-[#164B78] dark:text-blue-400 my-1">{r.count}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
