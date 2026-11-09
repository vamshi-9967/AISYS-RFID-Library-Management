import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  User,
  Shield,
  Key,
  LogOut,
  Radio,
  BookPlus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function TopNavbar({ isSidebarOpen, setIsSidebarOpen }) {
  const { systemHealth, activeTab, setActiveTab, notifications } = useLibrary();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = (tab) => {
    const titles = {
      dashboard: 'Library Intelligence Dashboard',
      books: 'Bibliographic & Physical Catalog',
      categories: 'Subject Classification Directory',
      authors: 'Author Registry & Contributions',
      members: 'Patron & Membership Directory',
      circulation: 'Circulation Control & Loan Operations',
      rfid_management: 'RFID Middleware & Tag Encoding',
      rfid_inventory: 'RFID Shelf Stock Audit & Verification',
      security_gate: 'Security Gate Loss Prevention Portal',
      reports: 'Operational Analytics & Reports',
      migration: 'Legacy Data Migration Gateway (20K)',
      users: 'Operator Accounts & RBAC Permissions',
      audit_logs: 'Immutable Audit Trail & System Logs',
      settings: 'Library Policies & System Configuration'
    };
    return titles[tab] || 'Library Management';
  };

  const isConnected = systemHealth?.database === 'connected';

  // Format today's date
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-18 bg-white border-b border-[#E2E8F0] sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-medium">
          <span>AISYS OS</span>
          <span>/</span>
          <span className="capitalize">{activeTab.replace('_', ' ')}</span>
        </div>
        <h1 className="text-base font-bold text-[#172B4D] leading-tight">
          {getPageTitle(activeTab)}
        </h1>
      </div>

      {/* Middle: Global Search Field */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search books, patrons, accession #, RFID UID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F4F7FB] rounded-xl border border-[#E2E8F0] text-[#172B4D] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#164B78] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right: Date, Health, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7FB] text-[#64748B] text-xs font-semibold border border-[#E2E8F0]">
          <Calendar className="w-3.5 h-3.5 text-[#164B78]" />
          <span>{todayDate}</span>
        </div>

        {/* Backend Connectivity Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={isConnected ? 'Connected to FastAPI & SQLite' : 'Running in local offline cache mode'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{isConnected ? 'Core API Connected' : 'Offline Mode'}</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#F4F7FB] relative transition-colors border border-transparent hover:border-[#E2E8F0]"
            title="System Notifications & Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
                <span className="font-bold text-xs text-[#172B4D] uppercase tracking-wide">
                  Notifications & Gate Events
                </span>
                <span className="text-[10px] bg-blue-50 text-[#164B78] px-2 py-0.5 rounded-full font-bold border border-blue-200">
                  {notifications.length} Alerts
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#F4F7FB] transition-colors cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 mt-1 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-[#2563EB]'}`} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#172B4D] leading-tight">{n.title}</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2.5 py-1 pr-1.5 rounded-xl hover:bg-[#F4F7FB] border border-transparent hover:border-[#E2E8F0] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[#164B78] text-white flex items-center justify-center text-xs font-black shadow-xs">
              CV
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-[#172B4D] leading-tight">Chandra Vamshi</span>
              <span className="text-[10px] font-semibold text-[#164B78]">Administrator</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#E2E8F0]">
                <p className="font-bold text-[#172B4D]">Chandra Vamshi</p>
                <p className="text-[10px] text-[#64748B]">admin@aisys.local</p>
              </div>
              <button
                onClick={() => { setActiveTab('users'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-[#F4F7FB] text-[#172B4D] flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Account Profile</span>
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-[#F4F7FB] text-[#172B4D] flex items-center gap-2 font-medium"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Security Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
