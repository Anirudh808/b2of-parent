import React from "react";
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
  // Admin filter helper
  const filteredAdminKids = adminKids.filter((k) => {
    if (adminFilter === "in") return k.checkedIn;
    if (adminFilter === "out") return !k.checkedIn;
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-10 animate-fade-in">
      {/* Top counters */}
      <StatCards
        totalKids={adminKids.length}
        checkedInCount={adminKids.filter((k) => k.checkedIn).length}
        checkedOutCount={adminKids.filter((k) => !k.checkedIn).length}
        totalLogs={adminLogs.length}
      />

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Kids Listing */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
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
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-extrabold text-lg">
              Live Security Activity Logs
            </h3>
          </div>

          {adminLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="text-sm text-slate-500 font-medium">Loading activity timeline...</span>
            </div>
          ) : (
            <ActivityLogFeed
              logs={adminLogs}
              loading={adminLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
