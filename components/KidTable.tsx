import React, { useState, useEffect } from "react";

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

interface KidTableProps {
  kids: Kid[];
  isAdmin: boolean;
  onViewProfile: (kid: Kid) => void;
  onCheckInOut?: (kid: Kid) => void;
}

export default function KidTable({
  kids,
  isAdmin,
  onViewProfile,
  onCheckInOut,
}: KidTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrentPage(1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [kids]);

  if (kids.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 font-semibold text-sm">
        No child records found.
      </div>
    );
  }

  const totalPages = Math.ceil(kids.length / itemsPerPage);
  const displayedKids = kids.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      {/* Mobile Card Grid (Visible on mobile, hidden on tablet and larger) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {displayedKids.map((kid) => (
          <div key={kid.id} className="p-5 flex flex-col gap-4 hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-all animate-fade-in">
            {/* Header: Student Name and Status */}
            <div className="flex justify-between items-start">
              <div>
                <span className="block font-bold text-sm text-slate-900 dark:text-slate-100">{kid.firstName} {kid.lastName}</span>
                <span className="block text-[10px] text-slate-400 font-medium">Age: {kid.age} • {kid.gender}</span>
              </div>
              <div>
                {kid.checkedIn ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Out
                  </span>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="block uppercase tracking-wider font-extrabold text-[9px] text-slate-400 mb-0.5">Parent / Guardian</span>
                <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">{kid.parentName}</span>
                <span className="block text-slate-500 dark:text-slate-400 font-normal truncate">{kid.parentEmail}</span>
                <span className="block text-slate-500 dark:text-slate-400 font-normal">{kid.parentPhone}</span>
              </div>
              <div>
                <span className="block uppercase tracking-wider font-extrabold text-[9px] text-slate-400 mb-0.5">Authorized Pickup</span>
                <span className="block font-bold text-slate-600 dark:text-slate-400 line-clamp-2">{kid.authorizedToPickup}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => onViewProfile(kid)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-lg text-xs transition-all font-bold cursor-pointer"
              >
                {isAdmin ? "Edit" : "View Profile"}
              </button>
              {!isAdmin && onCheckInOut && (
                <button
                  onClick={() => onCheckInOut(kid)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                    kid.checkedIn
                      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"
                  }`}
                >
                  {kid.checkedIn ? "Check Out" : "Check In"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Table Layout (Hidden on mobile, visible on medium screens and larger) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {isAdmin ? (
            <>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/70">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Parent details</th>
                  <th className="px-6 py-4">Authorized Pickup</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold">
                {displayedKids.map((kid) => (
                  <tr key={kid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="px-6 py-4">
                      <span className="block text-slate-955 dark:text-slate-100">{kid.firstName} {kid.lastName}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Age: {kid.age} • {kid.gender}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-slate-955 dark:text-slate-200 font-semibold">{kid.parentName}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">{kid.parentEmail}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">{kid.parentPhone}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold max-w-[120px] truncate">
                      {kid.authorizedToPickup}
                    </td>
                    <td className="px-6 py-4">
                      {kid.checkedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Out
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onViewProfile(kid)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs transition-all font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            <>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/70">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Age / Gender</th>
                  <th className="px-6 py-4">Parent / Guardian</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
                {displayedKids.map((kid) => (
                  <tr key={kid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {kid.firstName} {kid.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 dark:text-slate-400">
                      {kid.age} yrs • {kid.gender}
                    </td>
                    <td className="px-6 py-5">
                      <span className="block text-slate-900 dark:text-slate-200">{kid.parentName}</span>
                      <span className="block text-xs text-slate-400 font-normal">{kid.parentEmail}</span>
                    </td>
                    <td className="px-6 py-5">
                      {kid.checkedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          Checked Out
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right space-x-3">
                      <button
                        onClick={() => onViewProfile(kid)}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        View Profile
                      </button>
                      {onCheckInOut && (
                        <button
                          onClick={() => onCheckInOut(kid)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                            kid.checkedIn
                              ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"
                          }`}
                        >
                          {kid.checkedIn ? "Check Out" : "Check In"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/25">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
