import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Search, Phone, Send, Printer, Volume2, UserCheck, Eye, EyeOff, FileText, Download, X, AlertCircle } from 'lucide-react';
import { FacultyMember, EventLog } from '../types';
import { MASK_PHONE } from '../data/facultyDatabase';

interface AdminDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyList: FacultyMember[];
  isAdminAuthed: boolean;
  onAuthenticate: (success: boolean) => void;
  logs: EventLog[];
  onTriggerFacultyTest: (faculty: FacultyMember) => void;
  onTriggerSmsTest: (faculty: FacultyMember) => void;
  onTriggerPrinterTest: (faculty: FacultyMember) => void;
  onTriggerVoiceTest: (faculty: FacultyMember) => void;
}

export const AdminDatabaseModal: React.FC<AdminDatabaseModalProps> = ({
  isOpen,
  onClose,
  facultyList,
  isAdminAuthed,
  onAuthenticate,
  logs,
  onTriggerFacultyTest,
  onTriggerSmsTest,
  onTriggerPrinterTest,
  onTriggerVoiceTest,
}) => {
  const [username, setUsername] = useState('Renuka');
  const [secretKey, setSecretKey] = useState('2026');
  const [authError, setAuthError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'database' | 'logs'>('database');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username.trim().toLowerCase() === 'renuka' || username.trim().toLowerCase() === 'admin') &&
      secretKey.trim() === '2026'
    ) {
      onAuthenticate(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials! Username is "Renuka" and Secret Key is "2026".');
    }
  };

  const handleLogout = () => {
    onAuthenticate(false);
  };

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      departmentFilter === 'All' || f.department.toLowerCase().includes(departmentFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Designation', 'Department', 'Phone', 'Status', 'VIP Token'];
    const rows = filteredFaculty.map((f) => [
      f.id,
      `"${f.salutation} ${f.name}"`,
      `"${f.designation}"`,
      `"${f.department}"`,
      `"${f.phone}"`,
      f.status,
      f.vipToken,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medha_2k26_faculty_database.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#091024] border border-cyan-800 rounded-3xl shadow-2xl p-6 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-950 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl text-white">
              {isAdminAuthed ? <ShieldCheck className="w-5 h-5 text-emerald-300" /> : <Lock className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Faculty Database &amp; Privacy Console</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isAdminAuthed
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}
                >
                  {isAdminAuthed ? 'AUTHENTICATED' : 'PROTECTED VAULT'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Preserving all 36 faculty records · Sensitive phone numbers hidden from public view
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthed && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/70 border border-rose-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Vault</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In: Login Gate */}
        {!isAdminAuthed ? (
          <div className="py-12 px-4 max-w-md mx-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Confidential Database Access</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                As per privacy policies, all 36 faculty phone numbers and records are restricted. Enter the authorized organizer credentials below to view or manage.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5 text-left bg-[#060b19] border border-cyan-950 p-5 rounded-2xl">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Renuka"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Secret Key (Password)
                </label>
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {authError && (
                <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Authorized Records</span>
              </button>

              <div className="text-[10px] text-slate-500 text-center font-mono">
                Hint: Username <span className="text-cyan-400">Renuka</span> · Secret Key <span className="text-cyan-400">2026</span>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Tabs & Search Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('database')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'database'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  All 36 Faculty Records ({filteredFaculty.length})
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'logs'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Live System Logs ({logs.length})</span>
                </button>
              </div>

              {activeTab === 'database' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, phone..."
                      className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
                    />
                  </div>

                  <button
                    onClick={exportCsv}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 transition-colors"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active Content: Table or Logs */}
            {activeTab === 'database' ? (
              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-[#050917]">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="sticky top-0 bg-[#0a1228] text-slate-400 border-b border-slate-800 text-[11px] font-mono">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Photo</th>
                      <th className="py-2.5 px-3">Faculty Name</th>
                      <th className="py-2.5 px-3">Designation</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Phone Number</th>
                      <th className="py-2.5 px-3 text-right">Instant Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredFaculty.map((faculty) => (
                      <tr key={faculty.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{faculty.id}</td>
                        <td className="py-2 px-3">
                          <img
                            src={faculty.photoUrl}
                            alt={faculty.name}
                            className="w-8 h-8 rounded-lg object-cover border border-cyan-800/60"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/robot.jpeg';
                            }}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-white">
                            {faculty.salutation} {faculty.name}
                          </div>
                          <div className="text-[10px] text-cyan-400/90 font-mono">{faculty.vipToken}</div>
                        </td>
                        <td className="py-2 px-3 text-slate-300">{faculty.designation}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                          {faculty.department}
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-400 font-medium">
                          +91 {faculty.phone}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onTriggerFacultyTest(faculty);
                                onClose();
                              }}
                              className="px-2 py-1 bg-cyan-900/70 hover:bg-cyan-800 text-cyan-300 rounded text-[10px] font-semibold transition-colors"
                              title="Simulate Webcam Recognition"
                            >
                              Scan
                            </button>
                            <button
                              onClick={() => onTriggerVoiceTest(faculty)}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                              title="Play Speaker Voice"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                            <button
                              onClick={() => onTriggerSmsTest(faculty)}
                              className="p-1 bg-blue-900/60 hover:bg-blue-800 text-blue-300 rounded transition-colors"
                              title="Send Test SMS"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onTriggerPrinterTest(faculty)}
                              className="p-1 bg-amber-900/60 hover:bg-amber-800 text-amber-300 rounded transition-colors"
                              title="Print Thermal Pass"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Live Log Reports Display ("Final ga, e dashboard lo log reports display cheyyali") */
              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-[#040816] p-3 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800 mb-2">
                  <span>REAL-TIME SYSTEM AUDIT &amp; OPERATION LOGS</span>
                  <span className="text-emerald-400">STATUS: SYNCED</span>
                </div>
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No logs generated yet.</div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              log.level === 'success'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : log.level === 'warning'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            }`}
                          >
                            {log.category}
                          </span>
                        </div>
                        <div className="text-slate-200 text-[11px]">{log.message}</div>
                        {log.details && <div className="text-[10px] text-slate-400">{log.details}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
