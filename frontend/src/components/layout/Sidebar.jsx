import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users2,
  UserCheck,
  Repeat,
  Radio,
  Boxes,
  ShieldAlert,
  BarChart3,
  FileSpreadsheet,
  Users,
  ScrollText,
  Sliders,
  RadioTower,
  ChevronLeft,
  ChevronRight,
  CircleDot
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { activeTab, setActiveTab, gateEvents, systemHealth } = useLibrary();

  const activeGateAlertsCount = gateEvents.filter(e => e.authResult === 'UNAUTHORIZED').length;
  const isConnected = systemHealth?.database === 'connected';

  const menuSections = [
    {
      title: 'MAIN MENU',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'books', label: 'Books Catalog', icon: BookOpen },
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'authors', label: 'Authors', icon: Users2 },
        { id: 'members', label: 'Members', icon: UserCheck },
        { id: 'circulation', label: 'Circulation Hub', icon: Repeat, badge: 'Live' },
      ]
    },
    {
      title: 'RFID OPERATIONS',
      items: [
        { id: 'rfid_management', label: 'RFID Management', icon: Radio },
        { id: 'rfid_inventory', label: 'RFID Inventory', icon: Boxes },
        {
          id: 'security_gate',
          label: 'Security Gate',
          icon: ShieldAlert,
          alertBadge: activeGateAlertsCount > 0 ? activeGateAlertsCount : null
        },
      ]
    },
    {
      title: 'INTELLIGENCE & ADMIN',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'migration', label: 'Data Migration 20K', icon: FileSpreadsheet, tag: '20K' },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'audit_logs', label: 'Audit Logs', icon: ScrollText },
        { id: 'settings', label: 'System Settings', icon: Sliders },
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#0B2942] text-slate-200 border-r border-[#164B78]/40 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-[#164B78]/60 bg-[#071D30]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#164B78] to-[#2563EB] flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
            <RadioTower className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span className="font-black tracking-wider text-white text-base leading-tight flex items-center gap-1.5">
                AISYS <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/25 text-blue-300 font-bold border border-blue-400/30">OS</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-tight truncate">
                RFID Library Intelligence
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isConnected ? 'Core Engine Online' : 'Local Cached Mode'}
              </span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-[#164B78]/40 hover:bg-[#164B78] text-slate-300 hover:text-white transition-colors"
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {isOpen && (
              <p className="px-3 pb-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {sec.title}
              </p>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                    isActive
                      ? 'bg-[#164B78] text-white shadow-sm shadow-blue-900/60'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-blue-300'
                    }`}
                  />
                  {isOpen && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {isOpen && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isOpen && item.tag && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                      {item.tag}
                    </span>
                  )}
                  {isOpen && item.alertBadge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse shadow-xs">
                      {item.alertBadge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-l-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile Status */}
      <div className="p-3 border-t border-[#164B78]/50 bg-[#071D30]">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-[#164B78] border border-blue-400/40 flex items-center justify-center text-xs font-black text-white shrink-0">
            CV
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Chandra Vamshi</p>
              <p className="text-[10px] text-blue-300 font-medium truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
