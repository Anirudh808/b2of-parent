import React from "react";
import KidTable from "./KidTable";

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

interface ParentPortalViewProps {
  searchFirst: string;
  setSearchFirst: (val: string) => void;
  searchLast: string;
  setSearchLast: (val: string) => void;
  parentKids: Kid[];
  searchPerformed: boolean;
  parentSearchLoading: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
  onInitiateAction: (kid: Kid, action: "profile" | "checkinout") => void;
}

export default function ParentPortalView({
  searchFirst,
  setSearchFirst,
  searchLast,
  setSearchLast,
  parentKids,
  searchPerformed,
  parentSearchLoading,
  onSearchSubmit,
  onInitiateAction,
}: ParentPortalViewProps) {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header info */}
      <div className="text-center md:text-left space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-slate-100 dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent">
          Child Check-In & Check-Out
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base font-medium">
          Search using your child&apos;s first and last name to view details, verify authorized pickups, or log attendance.
        </p>
      </div>

      {/* Double Search Bar Form */}
      <form onSubmit={onSearchSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        <div className="md:col-span-5 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Child&apos;s First Name</label>
          <input
            type="text"
            placeholder="e.g. John"
            value={searchFirst}
            onChange={(e) => setSearchFirst(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
          />
        </div>

        <div className="md:col-span-5 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Child&apos;s Last Name</label>
          <input
            type="text"
            placeholder="e.g. Doe"
            value={searchLast}
            onChange={(e) => setSearchLast(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={parentSearchLoading}
          className="md:col-span-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {parentSearchLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </>
          )}
        </button>
      </form>

      {/* Results Table Section */}
      {searchPerformed && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Search Results
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2.5 py-1 rounded-full font-bold">
                {parentKids.length}
              </span>
            </h3>
          </div>

          {parentSearchLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-slate-500">Retrieving academic records...</span>
            </div>
          ) : parentKids.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No Children Found</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                We couldn&apos;t find any student matching exactly <strong>&ldquo;{searchFirst} {searchLast}&rdquo;</strong>. Please verify spelling or contact academy administration.
              </p>
            </div>
          ) : (
            <KidTable
              kids={parentKids}
              isAdmin={false}
              onViewProfile={(kid) => onInitiateAction(kid, "profile")}
              onCheckInOut={(kid) => onInitiateAction(kid, "checkinout")}
            />
          )}
        </div>
      )}
    </div>
  );
}
