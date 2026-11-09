import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  Bell,
  Mail,
  Building,
  RotateCcw
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function SystemSettingsPage() {
  const { settings, setSettings, setAuditLogs } = useLibrary();

  const [formSettings, setFormSettings] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormSettings(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formSettings);
    setSaveSuccess(true);

    const log = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      user: 'admin',
      action: 'SETTINGS_UPDATE',
      resource: 'LibrarySetting',
      resourceId: 'SYSTEM_RULES',
      details: `Updated loan policy: ${formSettings.loanDurationDays} days, $${formSettings.finePerDay}/day fine`,
      ip: '192.168.1.10'
    };
    setAuditLogs(prev => [log, ...prev]);

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Library Policy & System Parameters</h1>
          <p className="text-xs text-slate-500">
            Configure circulation loan limits, fine schedules, security gate thresholds, and notification adapters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">System Settings Successfully Saved</p>
              <p className="text-[11px] text-emerald-700">All circulation rules, overdue calculations, and gate event thresholds updated immediately.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Circulation Policies */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-[#164B78]" />
              <h3 className="font-bold text-sm text-slate-800">Circulation & Loan Parameters</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Loan Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={formSettings.loanDurationDays}
                  onChange={(e) => handleChange('loanDurationDays', parseInt(e.target.value) || 14)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Automatic due date calculation applied at checkout.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Max Books</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formSettings.maxBorrowLimitStudent}
                    onChange={(e) => handleChange('maxBorrowLimitStudent', parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty Max Books</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formSettings.maxBorrowLimitFaculty}
                    onChange={(e) => handleChange('maxBorrowLimitFaculty', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fines & Penalty Limits */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800">Fines & Suspension Rules</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Overdue Fine Rate ($ Per Day)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formSettings.finePerDay}
                  onChange={(e) => handleChange('finePerDay', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Charged automatically when returning overdue items.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Fine Account Suspension Threshold ($)</label>
                <input
                  type="number"
                  step="5.00"
                  min="10"
                  value={formSettings.maxFineBlockThreshold}
                  onChange={(e) => handleChange('maxFineBlockThreshold', parseFloat(e.target.value) || 50)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Patrons reaching this balance are barred from additional loans.</p>
              </div>
            </div>
          </div>

          {/* Gate Loss Prevention & Sound */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-800">RFID Security Gate Controls</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-800">Acoustic Siren Alarm on Unauthorized Removal</p>
                  <p className="text-[10px] text-slate-400">Trigger audible buzzer when armed security bit passes through gate</p>
                </div>
                <input
                  type="checkbox"
                  checked={formSettings.enableGateAudioAlarm}
                  onChange={(e) => handleChange('enableGateAudioAlarm', e.target.checked)}
                  className="w-4 h-4 rounded text-[#164B78] focus:ring-[#164B78]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-800">Mock CCTV Image Snapshot Logging</p>
                  <p className="text-[10px] text-slate-400">Index frame reference image into incident vault</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 rounded text-[#164B78]"
                />
              </div>
            </div>
          </div>

          {/* Institution Profile */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-800">Institutional Identity</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Library / Institution Name</label>
                <input
                  type="text"
                  value={formSettings.institutionName}
                  onChange={(e) => handleChange('institutionName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#164B78]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal SMTP Relay Host</label>
                <input
                  type="text"
                  value={formSettings.smtpServer}
                  onChange={(e) => handleChange('smtpServer', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setFormSettings({ ...settings })}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Discard Changes</span>
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
