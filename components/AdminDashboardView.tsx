import React, { useState } from "react";
import StatCards from "./StatCards";
import KidTable from "./KidTable";
import ActivityLogFeed from "./ActivityLogFeed";

interface Kid {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  parentName: string;
  parentEmail: string;
  authorizedToPickup: string;
  parentPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
  checkedIn: boolean;
  lastStatusChange: string;
  registrationStart?: string;
  registrationEnd?: string;
}

interface ActivityLog {
  id: string;
  kidId: string;
  kidName: string;
  parentEmail: string;
  parentName: string;
  type: "checkin" | "checkout";
  timestamp: string;
  photoUrl: string;
}

interface AdminDashboardViewProps {
  adminKids: Kid[];
  adminLogs: ActivityLog[];
  adminLoading: boolean;
  adminFilter: "all" | "in" | "out";
  setAdminFilter: (val: "all" | "in" | "out") => void;
  onAddChildClick: () => void;
  onEditChildClick: (kid: Kid) => void;
}

export default function AdminDashboardView({
  adminKids,
  adminLogs,
  adminLoading,
  adminFilter,
  setAdminFilter,
  onAddChildClick,
  onEditChildClick,
}: AdminDashboardViewProps) {
  const todayDateString = React.useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [logDateFilter, setLogDateFilter] = useState<string>(todayDateString);

  // Admin filter helper
  const filteredAdminKids = adminKids.filter((k) => {
    if (adminFilter === "in") return k.checkedIn;
    if (adminFilter === "out") return !k.checkedIn;
    return true;
  });

  const filteredLogs = adminLogs.filter((log) => {
    if (!logDateFilter) return true;
    const logDate = new Date(log.timestamp);
    const localYear = logDate.getFullYear();
    const localMonth = String(logDate.getMonth() + 1).padStart(2, "0");
    const localDay = String(logDate.getDate()).padStart(2, "0");
    const logDateString = `${localYear}-${localMonth}-${localDay}`;
    return logDateString === logDateFilter;
  });

  const [activeTab, setActiveTab] = useState<"students" | "logs">("students");

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10 animate-fade-in">
      {/* Top counters */}
      <StatCards
        totalKids={adminKids.length}
        checkedInCount={adminKids.filter((k) => k.checkedIn).length}
        checkedOutCount={adminKids.filter((k) => !k.checkedIn).length}
        totalLogs={adminLogs.length}
      />

      {/* Mobile Tab Control (Visible only on mobile/tablet viewports) */}
      <div className="flex md:hidden border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl gap-1">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "students"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-850"
          }`}
        >
          Registered Students
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "logs"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-855"
          }`}
        >
          Activity Logs
        </button>
      </div>

      {/* Split Screen / Tabbed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Kids Listing */}
        <div className={`lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex-col ${
          activeTab === "students" ? "flex" : "hidden md:flex"
        }`}>
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              Registered Students
            </h3>
            <button
              onClick={onAddChildClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 flex gap-2 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/25">
            <button
              onClick={() => setAdminFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                adminFilter === "all"
                  ? "bg-slate-800 dark:bg-slate-700 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              All Students
            </button>
            <button
              onClick={() => setAdminFilter("in")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                adminFilter === "in"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60"
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setAdminFilter("out")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                adminFilter === "out"
                  ? "bg-slate-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Checked Out
            </button>
          </div>

          {adminLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="text-sm text-slate-500 font-medium">Fetching academy rosters...</span>
            </div>
          ) : (
            <KidTable
              kids={filteredAdminKids}
              isAdmin={true}
              onViewProfile={onEditChildClick}
            />
          )}
        </div>

        {/* Right Column: Live Logs Feed */}
        <div className={`lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex-col ${
          activeTab === "logs" ? "flex" : "hidden md:flex"
        }`}>
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Live Security Activity Logs
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={logDateFilter}
                onChange={(e) => setLogDateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer text-slate-700 dark:text-slate-200"
              />
              {logDateFilter !== todayDateString && (
                <button
                  onClick={() => setLogDateFilter(todayDateString)}
                  className="text-xs text-slate-400 hover:text-indigo-500 font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Today
                </button>
              )}
            </div>
          </div>

          {adminLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="text-sm text-slate-500 font-medium">Loading activity timeline...</span>
            </div>
          ) : (
            <ActivityLogFeed
              logs={filteredLogs}
              loading={adminLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
