import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  BookPlus,
  RefreshCw,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function TopNavbar({ isSidebarOpen, setIsSidebarOpen }) {
  const { systemHealth, activeTab, setActiveTab, notifications, gateEvents } = useLibrary();
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumb = (tab) => {
    const titles = {
      dashboard: 'Dashboard / Real-Time Overview',
      books: 'Cataloguing / Bibliographic & Physical Items',
      categories: 'Cataloguing / Subject Categories',
      authors: 'Cataloguing / Book Authors Registry',
      members: 'Patrons / Membership Directory',
      circulation: 'Circulation / Book Issue, Return & Renewals',
      rfid_management: 'RFID Middleware / Tag Encoding & Staff Station',
      rfid_inventory: 'RFID Middleware / Handheld Shelf Audit & Verification',
      security_gate: 'RFID Middleware / Security Gate Events & Loss Prevention',
      reports: 'Analytics / Comprehensive Library Reports',
      migration: 'Data Pipeline / Excel Bulk Migration (~20,000 Records)',
      users: 'Administration / Operator Accounts & Roles',
      audit_logs: 'Security / Immutable Audit Trail',
      settings: 'Configuration / Library Rules & Parameters'
    };
    return titles[tab] || 'Library Management';
  };

  const isConnected = systemHealth?.database === 'connected';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
      {/* Left: Sidebar Toggle & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {getBreadcrumb(activeTab).split('/')[0]}
          </span>
          <span className="text-sm font-bold text-slate-800 leading-none">
            {getBreadcrumb(activeTab).split('/')[1] || getBreadcrumb(activeTab)}
          </span>
        </div>
      </div>

      {/* Right Controls: Fast Actions + Health Indicator + Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Quick Issue Button */}
        <button
          onClick={() => setActiveTab('circulation')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF3FB] text-[#164B78] hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition-all shadow-2xs"
        >
          <BookPlus className="w-4 h-4" />
          <span>Quick Issue</span>
        </button>

        {/* Quick RFID Scan Button */}
        <button
          onClick={() => setActiveTab('rfid_management')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#164B78] text-white hover:bg-[#0B2942] font-semibold text-xs transition-all shadow-2xs"
        >
          <Radio className="w-4 h-4 text-blue-300" />
          <span>RFID Station</span>
        </button>

        {/* Live Backend Connection Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={isConnected ? 'FastAPI Backend & SQLite connected' : 'Local cached mode'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-semibold">
            {isConnected ? 'API: Connected' : 'API: Reconnecting'}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800 uppercase tracking-wide">
                  Notifications & Gate Alerts
                </span>
                <span className="text-[10px] bg-blue-100 text-[#164B78] px-2 py-0.5 rounded-full font-bold">
                  {notifications.length} New
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-800">{n.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#164B78] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            CV
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight">Chandra Vamshi</span>
            <span className="text-[10px] font-medium text-slate-500">Chief System Architect</span>
          </div>
        </div>
      </div>
    </header>
  );
}
