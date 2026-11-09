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
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { activeTab, setActiveTab, gateEvents } = useLibrary();

  const activeGateAlertsCount = gateEvents.filter(e => e.authResult === 'UNAUTHORIZED').length;

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
        { id: 'migration', label: 'Data Migration', icon: FileSpreadsheet, tag: '20K' },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'audit_logs', label: 'Audit Logs', icon: ScrollText },
        { id: 'settings', label: 'System Settings', icon: Sliders },
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#0B2942] text-slate-200 border-r border-[#164B78]/40 flex flex-col ${
        isOpen ? 'w-68' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#164B78]/50 bg-[#071D30]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#164B78] to-blue-500 flex items-center justify-center shrink-0 shadow-md">
            <RadioTower className="w-5 h-5 text-white animate-pulse" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="font-black tracking-wider text-white text-lg leading-tight flex items-center gap-1.5">
                AISYS <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold uppercase">RFID</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">Library Intelligence OS</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            {isOpen && (
              <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
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
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-[#164B78] text-white shadow-sm shadow-blue-900/50 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
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
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {item.tag}
                    </span>
                  )}
                  {isOpen && item.alertBadge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-bounce shadow-xs">
                      {item.alertBadge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-400 rounded-l-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile Status */}
      <div className="p-3 border-t border-[#164B78]/40 bg-[#071D30]/80">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
            AD
          </div>
          {isOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Administrator</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Full System Role
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
