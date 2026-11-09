import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initialBooks,
  initialMembers,
  initialLoans,
  initialGateEvents,
  initialAuditLogs,
  initialSettings
} from '../data/mockData';
import { checkHealth } from '../services/healthService';
import dashboardService from '../services/dashboardService';
import bookService from '../services/bookService';
import memberService from '../services/memberService';
import circulationService from '../services/circulationService';
import rfidService from '../services/rfidService';

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState(initialBooks);
  const [members, setMembers] = useState(initialMembers);
  const [loans, setLoans] = useState(initialLoans);
  const [gateEvents, setGateEvents] = useState(initialGateEvents);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [settings, setSettings] = useState(initialSettings);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', database: 'connecting' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Gate Alarm Event', time: '10 mins ago', unread: true, type: 'alert' },
    { id: 2, title: 'Database Backup Completed', time: '1 hour ago', unread: false, type: 'info' }
  ]);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('aisys_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aisys_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aisys_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Sync data with live backend
  const refreshAllData = useCallback(async () => {
    try {
      const health = await checkHealth();
      setSystemHealth(health);

      // Fetch live stats
      const stats = await dashboardService.getStats();
      if (stats) setDashboardStats(stats);

      // Fetch live books
      const booksData = await bookService.getBooks({ limit: 100 });
      if (booksData && booksData.items && booksData.items.length > 0) {
        // Map backend books to UI format
        const formattedBooks = booksData.items.map(b => ({
          id: b.id,
          isbn: b.isbn,
          title: b.title,
          subtitle: b.subtitle,
          category: b.category ? b.category.name : 'General',
          publisher: b.publisher,
          year: b.year,
          totalCopies: b.total_copies,
          availableCopies: b.available_copies,
          isReference: b.is_reference,
          authors: b.authors ? b.authors.map(a => a.name) : [],
          copies: []
        }));
        setBooks(formattedBooks);
      }

      // Fetch live members
      const membersData = await memberService.getMembers({ limit: 100 });
      if (membersData && membersData.items && membersData.items.length > 0) {
        const formattedMembers = membersData.items.map(m => ({
          id: m.id,
          membershipNumber: m.membership_number,
          fullName: m.full_name,
          email: m.email,
          phone: m.phone,
          department: m.department,
          membershipType: m.membership_type,
          status: m.status,
          outstandingFine: m.outstanding_fine,
          activeLoansCount: m.active_loans_count,
          maxLimit: m.membership_type === 'Faculty' ? 10 : 5
        }));
        setMembers(formattedMembers);
      }

      // Fetch live loans
      const loansData = await circulationService.getLoans({ limit: 50 });
      if (loansData && loansData.items && loansData.items.length > 0) {
        const formattedLoans = loansData.items.map(l => ({
          id: l.id,
          loanNumber: l.loan_number,
          memberId: l.member_id,
          memberName: l.member_name,
          membershipNumber: l.membership_number,
          bookTitle: l.book_title,
          accessionNumber: l.accession_number,
          issueDate: l.issue_date ? l.issue_date.split('T')[0] : '',
          dueDate: l.due_date ? l.due_date.split('T')[0] : '',
          returnDate: l.return_date ? l.return_date.split('T')[0] : null,
          status: l.status,
          renewalCount: l.renewal_count
        }));
        setLoans(formattedLoans);
      }

      // Fetch live gate events
      const gateData = await rfidService.getGateEvents({ limit: 50 });
      if (gateData && gateData.items && gateData.items.length > 0) {
        const formattedGate = gateData.items.map(g => ({
          id: g.event_id,
          timestamp: g.timestamp ? new Date(g.timestamp).toLocaleString() : '',
          gateLocation: g.gate_location,
          rfidUid: g.tag_uid,
          accessionNumber: g.accession_number || 'N/A',
          bookTitle: g.book_title,
          authResult: g.auth_result,
          alarmStatus: g.alarm_status,
          securityBit: g.security_bit,
          cctvReference: g.cctv_reference,
          notificationStatus: g.notification_status
        }));
        setGateEvents(formattedGate);
      }
    } catch (err) {
      console.warn('Backend sync fallback to cached state:', err.message);
      setSystemHealth({
        status: 'offline_mode',
        database: 'local_cached',
        error: err.message
      });
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 20000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // ISSUE BOOK ACTION
  const issueBook = async (memberId, accessionNumber) => {
    try {
      const res = await circulationService.issueBook({
        member_id: parseInt(memberId),
        accession_number: accessionNumber.trim()
      });
      if (res && res.success) {
        await refreshAllData();
        return { success: true, message: res.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      return { success: false, message: msg };
    }
  };

  // RETURN BOOK ACTION
  const returnBook = async (accessionNumber) => {
    try {
      const res = await circulationService.returnBook({
        accession_number: accessionNumber.trim()
      });
      if (res && res.success) {
        await refreshAllData();
        return { success: true, message: res.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      return { success: false, message: msg };
    }
  };

  // TRIGGER GATE EVENT SIMULATION
  const triggerGateEvent = async (isUnauthorized = false, customItem = null) => {
    try {
      const tagUid = customItem?.rfidUid || (isUnauthorized ? 'E280116060000103' : 'E280116060000101');
      const res = await rfidService.simulateGate(tagUid);
      await refreshAllData();

      if (res.alarm) {
        setNotifications(prev => [
          {
            id: Date.now(),
            title: `SECURITY ALERT: Unauthorized removal at ${res.gate_location} (${res.accession_number})`,
            time: 'Just now',
            unread: true,
            type: 'alert'
          },
          ...prev
        ]);
      }

      return {
        id: res.event_id,
        timestamp: new Date().toLocaleString(),
        gateLocation: res.gate_location,
        rfidUid: tagUid,
        accessionNumber: res.accession_number || 'N/A',
        bookTitle: res.book_title || 'Library Catalog Item',
        authResult: res.auth_result,
        alarmStatus: res.alarm ? 'TRIGGERED' : 'QUIET',
        securityBit: res.alarm ? 1 : 0,
        cctvReference: res.cctv_reference,
        notificationStatus: res.alarm ? 'QUEUED' : 'NOT_REQUIRED'
      };
    } catch (err) {
      console.error('Error triggering gate event:', err);
      // Fallback
      return {
        id: `GATE-EV-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString(),
        gateLocation: 'Main Security Gate #1',
        rfidUid: 'E280116060000103',
        accessionNumber: 'ACC-CS-00103',
        bookTitle: 'Introduction to Algorithms',
        authResult: isUnauthorized ? 'UNAUTHORIZED' : 'AUTHORIZED',
        alarmStatus: isUnauthorized ? 'TRIGGERED' : 'QUIET',
        securityBit: isUnauthorized ? 1 : 0
      };
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        setBooks,
        members,
        setMembers,
        loans,
        setLoans,
        gateEvents,
        setGateEvents,
        auditLogs,
        setAuditLogs,
        settings,
        setSettings,
        dashboardStats,
        systemHealth,
        activeTab,
        setActiveTab,
        notifications,
        darkMode,
        toggleDarkMode,
        issueBook,
        returnBook,
        triggerGateEvent,
        refreshAllData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);
