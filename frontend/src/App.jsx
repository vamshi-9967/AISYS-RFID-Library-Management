import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';

// Pages
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import CategoriesPage from './pages/CategoriesPage';
import AuthorsPage from './pages/AuthorsPage';
import MembersPage from './pages/MembersPage';
import CirculationPage from './pages/CirculationPage';
import RFIDManagementPage from './pages/RFIDManagementPage';
import RFIDInventoryPage from './pages/RFIDInventoryPage';
import SecurityGatePage from './pages/SecurityGatePage';
import ReportsPage from './pages/ReportsPage';
import DataMigrationPage from './pages/DataMigrationPage';
import UserManagementPage from './pages/UserManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SystemSettingsPage from './pages/SystemSettingsPage';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { activeTab } = useLibrary();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'books':
        return <BooksPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'authors':
        return <AuthorsPage />;
      case 'members':
        return <MembersPage />;
      case 'circulation':
        return <CirculationPage />;
      case 'rfid_management':
        return <RFIDManagementPage />;
      case 'rfid_inventory':
        return <RFIDInventoryPage />;
      case 'security_gate':
        return <SecurityGatePage />;
      case 'reports':
        return <ReportsPage />;
      case 'migration':
        return <DataMigrationPage />;
      case 'users':
        return <UserManagementPage />;
      case 'audit_logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SystemSettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
      {/* Collapsible Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main App Content Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-68' : 'ml-20'
        }`}
      >
        <TopNavbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Dynamic Page View Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}
