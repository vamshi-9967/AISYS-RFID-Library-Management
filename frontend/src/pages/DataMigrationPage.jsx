import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  FileCheck,
  RefreshCw,
  Eye,
  ArrowRight,
  ShieldAlert,
  Play
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function DataMigrationPage() {
  const [migrationStage, setMigrationStage] = useState('idle'); // 'idle' | 'staged' | 'imported' | 'rolled_back'
  const [isProcessing, setIsProcessing] = useState(false);
  const [dryRunMode, setDryRunMode] = useState(false);

  // Staging batch data simulation (20,000 records scale)
  const [batchStats, setBatchStats] = useState({
    batchId: 'BATCH-2026-MIG-01',
    filename: 'ILMS_Legacy_Books_Export_20k.xlsx',
    totalRecords: 20450,
    validRecords: 20120,
    duplicateRecords: 198,
    invalidFormatRows: 132,
    importedRecords: 0
  });

  const sampleStagedRows = [
    { row: 1, isbn: "978-0134685991", title: "Effective Java", author: "Joshua Bloch", accession: "ACC-CS-00991", status: "VALID" },
    { row: 2, isbn: "978-0262033848", title: "Algorithms 4th Ed", author: "Thomas Cormen", accession: "ACC-CS-00992", status: "VALID" },
    { row: 3, isbn: "INVALID_ISBN", title: "Legacy Lab Manual", author: "Unknown", accession: "ACC-CS-00993", status: "INVALID_ISBN" },
    { row: 4, isbn: "978-0132350884", title: "Clean Code", author: "Robert Martin", accession: "ACC-CS-00101", status: "DUPLICATE_ACCESSION" },
    { row: 5, isbn: "978-1491957660", title: "Designing Data-Intensive Apps", author: "Martin Kleppmann", accession: "ACC-CS-00994", status: "VALID" },
  ];

  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMigrationStage('staged');
    }, 1200);
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBatchStats(prev => ({
        ...prev,
        importedRecords: dryRunMode ? 0 : prev.validRecords
      }));
      setMigrationStage('imported');
    }, 1500);
  };

  const handleExecuteRollback = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBatchStats(prev => ({ ...prev, importedRecords: 0 }));
      setMigrationStage('rolled_back');
    }, 1200);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,ISBN,Title,Author,Publisher,PublicationYear,Category,AccessionNumber,ShelfLocation,Barcode,ItemStatus\n978-0134685991,Effective Java,Joshua Bloch,Addison-Wesley,2018,Computer Science,ACC-CS-00101,Shelf A-1,BC00101,Available\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AISYS_Library_Migration_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bulk Data Migration Pipeline (~20,000 Records)</h1>
          <p className="text-xs text-slate-500">
            Pandas/OpenPyXL staging area, strict format validation, duplicate detection, atomic commit, and rollback.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#164B78] border border-blue-200 font-semibold text-xs shadow-2xs transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Excel Template</span>
        </button>
      </div>

      {/* Upload & Staging Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileSpreadsheet className="w-5 h-5 text-[#164B78]" />
          <h3 className="font-bold text-sm text-slate-800">Spreadsheet Ingestion & Validation Gateway</h3>
          <span className="text-xs font-mono bg-blue-50 text-[#164B78] px-2.5 py-0.5 rounded-full ml-auto">
            Target Batch Scale: 20,450 Records
          </span>
        </div>

        {/* Drag and Drop Zone */}
        {migrationStage === 'idle' && (
          <div
            onClick={handleSimulateUpload}
            className="border-2 border-dashed border-slate-300 hover:border-[#164B78] bg-slate-50/60 hover:bg-blue-50/30 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#164B78] flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {isProcessing ? 'Inspecting workbook columns & validating schema...' : 'Upload Legacy ILMS Spreadsheet (.xlsx / .csv)'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Click to load sample batch: <span className="font-mono text-[#164B78] font-semibold">{batchStats.filename}</span>
              </p>
            </div>
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#164B78] pt-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running dry-run validation checks...</span>
              </div>
            )}
          </div>
        )}

        {/* Staging Metrics Panel */}
        {migrationStage !== 'idle' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{batchStats.filename}</span>
                  <span className="font-mono text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                    {batchStats.batchId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Staging database table populated. Source records preserved untouched.</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dryRunMode}
                    onChange={(e) => setDryRunMode(e.target.checked)}
                    disabled={migrationStage === 'imported'}
                    className="rounded border-slate-300 text-[#164B78] focus:ring-[#164B78]"
                  />
                  <span>Dry-Run Simulation Only</span>
                </label>

                {migrationStage === 'staged' && (
                  <button
                    onClick={handleExecuteImport}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-[#164B78] hover:bg-[#0B2942] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>{dryRunMode ? 'Simulate Dry Run' : 'Commit & Import Valid Records'}</span>
                  </button>
                )}

                {migrationStage === 'imported' && (
                  <button
                    onClick={handleExecuteRollback}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    <span>Rollback Entire Batch</span>
                  </button>
                )}

                {migrationStage === 'rolled_back' && (
                  <button
                    onClick={handleSimulateUpload}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                  >
                    Load New Batch
                  </button>
                )}
              </div>
            </div>

            {/* Reconciliation Stat Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Rows Read</p>
                <p className="text-xl font-extrabold text-slate-800">{batchStats.totalRecords.toLocaleString()}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Valid Ready to Import</p>
                <p className="text-xl font-extrabold text-emerald-800">{batchStats.validRecords.toLocaleString()}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-bold text-amber-700 uppercase">Duplicate Accession #</p>
                <p className="text-xl font-extrabold text-amber-800">{batchStats.duplicateRecords}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-[10px] font-bold text-rose-700 uppercase">Format Rejections</p>
                <p className="text-xl font-extrabold text-rose-800">{batchStats.invalidFormatRows}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-[10px] font-bold text-[#164B78] uppercase">Target Imported</p>
                <p className="text-xl font-extrabold text-[#164B78]">
                  {batchStats.importedRecords > 0 ? batchStats.importedRecords.toLocaleString() : '0 (Staged)'}
                </p>
              </div>
            </div>

            {/* Status Alert Banner */}
            {migrationStage === 'imported' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Migration Batch Successfully Committed</p>
                    <p className="text-[11px] text-emerald-700">
                      {dryRunMode
                        ? 'Dry run completed with zero database mutations. Target DB is unchanged.'
                        : `20,120 clean titles and physical copies committed inside database transaction. 330 rejected rows logged for review.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {migrationStage === 'rolled_back' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Batch Rollback Successfully Executed</p>
                  <p className="text-[11px] text-amber-700">All newly inserted book items reverted. Target database restored to pre-migration snapshot.</p>
                </div>
              </div>
            )}

            {/* Sample Staged Rows Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/70 px-4 py-2 text-xs font-bold text-slate-700 border-b border-slate-200">
                Staging Table Inspection Sample (Rows 1 - 5)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Row</th>
                    <th className="py-2 px-3">ISBN</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Author</th>
                    <th className="py-2 px-3">Accession #</th>
                    <th className="py-2 px-3 text-right">Validation Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleStagedRows.map((r) => (
                    <tr key={r.row} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-mono text-slate-500">{r.row}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{r.isbn}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{r.title}</td>
                      <td className="py-2 px-3 text-slate-600">{r.author}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{r.accession}</td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'VALID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.status === 'DUPLICATE_ACCESSION'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
