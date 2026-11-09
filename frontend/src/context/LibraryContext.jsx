import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialBooks,
  initialMembers,
  initialLoans,
  initialGateEvents,
  initialAuditLogs,
  initialSettings
} from '../data/mockData';
import { checkHealth } from '../services/healthService';

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState(initialBooks);
  const [members, setMembers] = useState(initialMembers);
  const [loans, setLoans] = useState(initialLoans);
  const [gateEvents, setGateEvents] = useState(initialGateEvents);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [settings, setSettings] = useState(initialSettings);
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', database: 'connecting' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Gate Alarm Event', time: '10 mins ago', unread: true, type: 'alert' },
    { id: 2, title: 'Database Backup Completed', time: '1 hour ago', unread: false, type: 'info' }
  ]);

  // Periodically check backend health
  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        if (isMounted) setSystemHealth(data);
      } catch (err) {
        if (isMounted) {
          setSystemHealth({
            status: 'offline_mode',
            database: 'local_cached',
            error: err.message
          });
        }
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ISSUE BOOK ACTION
  const issueBook = (memberId, accessionNumber) => {
    const member = members.find(m => m.id === parseInt(memberId));
    if (!member) return { success: false, message: 'Member not found' };

    // Validation 1: Member Status
    if (member.status === 'Blocked') {
      return { success: false, message: 'Cannot issue: Member account is Blocked due to unpaid fines or policy.' };
    }
    if (member.status === 'Expired') {
      return { success: false, message: 'Cannot issue: Membership has expired.' };
    }

    // Validation 2: Fines Threshold
    if (member.outstandingFine >= settings.maxFineBlockThreshold) {
      return { success: false, message: `Cannot issue: Outstanding fine ($${member.outstandingFine.toFixed(2)}) exceeds maximum allowable limit ($${settings.maxFineBlockThreshold.toFixed(2)}).` };
    }

    // Validation 3: Borrowing Limit
    const activeMemberLoans = loans.filter(l => l.memberId === member.id && l.status !== 'Returned');
    if (activeMemberLoans.length >= member.maxLimit) {
      return { success: false, message: `Cannot issue: Member reached their borrowing limit of ${member.maxLimit} items.` };
    }

    // Find Book & Copy
    let targetBook = null;
    let targetCopy = null;

    for (const b of books) {
      const copy = b.copies.find(c => c.accessionNumber.toUpperCase() === accessionNumber.trim().toUpperCase());
      if (copy) {
        targetBook = b;
        targetCopy = copy;
        break;
      }
    }

    if (!targetBook || !targetCopy) {
      return { success: false, message: `Physical book copy with Accession #${accessionNumber} was not found.` };
    }

    // Validation 4: Reference Book restriction
    if (targetBook.isReference || targetCopy.status === 'Reference Only') {
      return { success: false, message: 'Strict Library Policy: Reference books cannot be issued outside the library.' };
    }

    if (targetCopy.status !== 'Available') {
      return { success: false, message: `Book item is currently ${targetCopy.status} and cannot be issued.` };
    }

    // Calculate dates
    const today = new Date();
    const issueDateStr = today.toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + settings.loanDurationDays);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const newLoan = {
      id: Date.now(),
      loanNumber: `LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      memberId: member.id,
      memberName: member.fullName,
      membershipNumber: member.membershipNumber,
      bookTitle: targetBook.title,
      accessionNumber: targetCopy.accessionNumber,
      rfidUid: targetCopy.rfidUid,
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      returnDate: null,
      renewalCount: 0,
      status: 'Issued',
      overdueDays: 0,
      fineAmount: 0.00
    };

    // Update copy status
    setBooks(prev => prev.map(b => {
      if (b.id === targetBook.id) {
        const updatedCopies = b.copies.map(c => c.id === targetCopy.id ? { ...c, status: 'Issued' } : c);
        const avail = updatedCopies.filter(c => c.status === 'Available').length;
        return { ...b, copies: updatedCopies, availableCopies: avail };
      }
      return b;
    }));

    // Update loans
    setLoans(prev => [newLoan, ...prev]);

    // Update member loans count
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, activeLoansCount: m.activeLoansCount + 1 } : m));

    // Audit log
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      user: 'librarian_desk',
      action: 'BOOK_ISSUE',
      resource: 'Loan',
      resourceId: newLoan.loanNumber,
      details: `Issued "${targetBook.title}" (${targetCopy.accessionNumber}) to ${member.fullName}`,
      ip: '192.168.1.50'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true, message: `Successfully issued "${targetBook.title}" to ${member.fullName}. Due on ${dueDateStr}.` };
  };

  // RETURN BOOK ACTION
  const returnBook = (accessionNumber) => {
    const acc = accessionNumber.trim().toUpperCase();
    const activeLoan = loans.find(l => l.accessionNumber.toUpperCase() === acc && l.status !== 'Returned');

    if (!activeLoan) {
      return { success: false, message: `No active borrowing loan found for item ${accessionNumber}.` };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Mark loan returned
    setLoans(prev => prev.map(l => l.id === activeLoan.id ? { ...l, returnDate: todayStr, status: 'Returned' } : l));

    // Mark copy Available
    setBooks(prev => prev.map(b => {
      const copyExists = b.copies.some(c => c.accessionNumber.toUpperCase() === acc);
      if (copyExists) {
        const updatedCopies = b.copies.map(c => c.accessionNumber.toUpperCase() === acc ? { ...c, status: 'Available' } : c);
        const avail = updatedCopies.filter(c => c.status === 'Available').length;
        return { ...b, copies: updatedCopies, availableCopies: avail };
      }
      return b;
    }));

    // Decrement member loans count
    setMembers(prev => prev.map(m => m.id === activeLoan.memberId ? { ...m, activeLoansCount: Math.max(0, m.activeLoansCount - 1) } : m));

    // Audit log
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      user: 'circulation_kiosk',
      action: 'BOOK_RETURN',
      resource: 'Loan',
      resourceId: activeLoan.loanNumber,
      details: `Returned book ${acc} (${activeLoan.bookTitle})`,
      ip: '192.168.1.50'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true, message: `Book ${acc} successfully returned to shelf availability.` };
  };

  // TRIGGER GATE EVENT SIMULATION
  const triggerGateEvent = (isUnauthorized = false, customItem = null) => {
    const sampleCopy = customItem || books[0].copies[0];
    const eventId = `GATE-EV-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleString();

    const newEvent = {
      id: eventId,
      timestamp,
      gateLocation: 'Main Security Gate #1',
      rfidUid: sampleCopy.rfidUid,
      accessionNumber: sampleCopy.accessionNumber,
      bookTitle: sampleCopy.title || 'Introduction to Algorithms (Item Copy)',
      authResult: isUnauthorized ? 'UNAUTHORIZED' : 'AUTHORIZED',
      alarmStatus: isUnauthorized ? 'TRIGGERED' : 'QUIET',
      securityBit: isUnauthorized ? 1 : 0,
      cctvReference: `CCTV_CAM01_${Date.now()}.jpg`,
      notificationStatus: isUnauthorized ? 'QUEUED' : 'NOT_REQUIRED'
    };

    setGateEvents(prev => [newEvent, ...prev]);

    if (isUnauthorized) {
      setNotifications(prev => [
        { id: Date.now(), title: `SECURITY ALERT: Unauthorized removal detected at Gate #1 (${sampleCopy.accessionNumber})`, time: 'Just now', unread: true, type: 'alert' },
        ...prev
      ]);
    }

    return newEvent;
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
        systemHealth,
        activeTab,
        setActiveTab,
        notifications,
        issueBook,
        returnBook,
        triggerGateEvent
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);
