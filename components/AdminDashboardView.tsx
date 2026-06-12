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
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [selectedAges, setSelectedAges] = useState<number[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableAges = React.useMemo(() => {
    const ages = adminKids
      .map((k) => k.age)
      .filter((age): age is number => age !== null && age !== undefined);
    return Array.from(new Set(ages)).sort((a, b) => a - b);
  }, [adminKids]);

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (adminFilter !== "all") count++;
    if (genderFilter !== "all") count++;
    if (selectedAges.length > 0) count++;
    return count;
  }, [adminFilter, genderFilter, selectedAges]);

  // Admin filter helper
  const filteredAdminKids = adminKids.filter((k) => {
    // Filter by check-in status
    if (adminFilter === "in" && !k.checkedIn) return false;
    if (adminFilter === "out" && k.checkedIn) return false;

    // Filter by gender
    if (genderFilter === "male" && k.gender.toLowerCase() !== "male") return false;
    if (genderFilter === "female" && k.gender.toLowerCase() !== "female") return false;

    // Filter by age (multi-select)
    if (selectedAges.length > 0 && (k.age === null || k.age === undefined || !selectedAges.includes(k.age))) {
      return false;
    }

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
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-lg">
                Registered Students
              </h3>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filtersOpen || activeFiltersCount > 0
                    ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/85 text-indigo-600 dark:text-indigo-400"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
                </svg>
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setAdminFilter("all");
                    setGenderFilter("all");
                    setSelectedAges([]);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 font-extrabold transition-all cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={onAddChildClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          {filtersOpen && (
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 flex flex-col gap-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Section */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Status
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-inner w-fit">
                    <button
                      type="button"
                      onClick={() => setAdminFilter("all")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        adminFilter === "all"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminFilter("in")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        adminFilter === "in"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      Checked In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminFilter("out")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        adminFilter === "out"
                          ? "bg-slate-600 text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      Checked Out
                    </button>
                  </div>
                </div>

                {/* Gender Section */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Gender
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-inner w-fit">
                    <button
                      type="button"
                      onClick={() => setGenderFilter("all")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        genderFilter === "all"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenderFilter("male")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        genderFilter === "male"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenderFilter("female")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        genderFilter === "female"
                          ? "bg-pink-600 text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Age Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Ages
                    </span>
                    {selectedAges.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedAges([])}
                        className="text-[9px] text-indigo-500 hover:text-indigo-650 dark:hover:text-indigo-400 font-extrabold transition-all cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-22 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 p-1 flex flex-col gap-0.5 shadow-xs">
                    {availableAges.map((age) => {
                      const isChecked = selectedAges.includes(age);
                      return (
                        <label
                          key={age}
                          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedAges(selectedAges.filter((a) => a !== age));
                              } else {
                                setSelectedAges([...selectedAges, age]);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded-sm border-slate-350 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>Age {age}</span>
                        </label>
                      );
                    })}
                    {availableAges.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic px-2 py-1 block">No ages found</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
