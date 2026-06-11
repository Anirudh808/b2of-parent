import React, { useState } from "react";

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

interface ActivityLogFeedProps {
  logs: ActivityLog[];
  loading: boolean;
}

export default function ActivityLogFeed({
  logs,
  loading,
}: ActivityLogFeedProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span className="text-sm text-slate-500 font-medium">
          Loading activity timeline...
        </span>
      </div>
    );
  }

  // Grouping logs into pairs chronologically per kid
  const groupLogsIntoPairs = (logsList: ActivityLog[]) => {
    const groupedByKid: {
      [kidId: string]: { kidName: string; logs: ActivityLog[] };
    } = {};

    // Sort oldest to newest to pair chronologically
    const sortedLogs = [...logsList].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    for (const log of sortedLogs) {
      if (!groupedByKid[log.kidId]) {
        groupedByKid[log.kidId] = {
          kidName: log.kidName,
          logs: [],
        };
      }
      groupedByKid[log.kidId].logs.push(log);
    }

    interface PairedLog {
      id: string;
      kidId: string;
      kidName: string;
      checkIn: ActivityLog | null;
      checkOut: ActivityLog | null;
      latestTimestamp: string;
    }

    const pairedList: PairedLog[] = [];

    for (const kidId of Object.keys(groupedByKid)) {
      const { kidName, logs: kidLogs } = groupedByKid[kidId];
      let currentPair: {
        checkIn: ActivityLog | null;
        checkOut: ActivityLog | null;
      } = { checkIn: null, checkOut: null };

      for (const log of kidLogs) {
        if (log.type === "checkin") {
          if (currentPair.checkIn) {
            pairedList.push({
              id: `${kidId}_in_${currentPair.checkIn.id}`,
              kidId,
              kidName,
              checkIn: currentPair.checkIn,
              checkOut: null,
              latestTimestamp: currentPair.checkIn.timestamp,
            });
          }
          currentPair = { checkIn: log, checkOut: null };
        } else if (log.type === "checkout") {
          if (currentPair.checkIn) {
            pairedList.push({
              id: `${kidId}_pair_${currentPair.checkIn.id}_${log.id}`,
              kidId,
              kidName,
              checkIn: currentPair.checkIn,
              checkOut: log,
              latestTimestamp: log.timestamp,
            });
            currentPair = { checkIn: null, checkOut: null };
          } else {
            pairedList.push({
              id: `${kidId}_out_${log.id}`,
              kidId,
              kidName,
              checkIn: null,
              checkOut: log,
              latestTimestamp: log.timestamp,
            });
          }
        }
      }

      if (currentPair.checkIn) {
        pairedList.push({
          id: `${kidId}_in_${currentPair.checkIn.id}`,
          kidId,
          kidName,
          checkIn: currentPair.checkIn,
          checkOut: null,
          latestTimestamp: currentPair.checkIn.timestamp,
        });
      }
    }

    // Sort so newest activity shows first
    return pairedList.sort(
      (a, b) =>
        new Date(b.latestTimestamp).getTime() -
        new Date(a.latestTimestamp).getTime(),
    );
  };

  const pairedLogs = groupLogsIntoPairs(logs);

  if (pairedLogs.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 font-semibold text-sm">
        No check-in/out records found for this date.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-150 overflow-y-auto">
        {pairedLogs.map((pair) => (
          <div
            key={pair.id}
            className="p-5 flex flex-col md:flex-row gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-all items-stretch justify-between animate-fade-in border-b border-slate-100 dark:border-slate-800"
          >
            {/* Student info */}
            <div className="flex flex-col justify-between py-1 min-w-35 gap-1">
              <div>
                <span className="block font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {pair.kidName}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                  ID: {pair.kidId.slice(0, 8)}...
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {pair.checkIn ? (
                  <span className="block font-semibold">
                    Email: {pair.checkIn.parentEmail.slice(0, 15)}...
                  </span>
                ) : pair.checkOut ? (
                  <span className="block font-semibold">
                    Email: {pair.checkOut.parentEmail.slice(0, 15)}...
                  </span>
                ) : null}
              </div>
            </div>

            {/* Timings columns */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Check In Block */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl flex gap-3 items-center">
                {pair.checkIn ? (
                  <>
                    <button
                      onClick={() => setLightboxImage(pair.checkIn!.photoUrl)}
                      className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0 cursor-zoom-in"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pair.checkIn.photoUrl}
                        alt="Check In Evidence"
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 mb-1">
                        Checked In
                      </span>
                      <span className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                        {new Date(pair.checkIn.timestamp).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                      <span className="block text-[9px] text-slate-400 truncate font-medium">
                        by {pair.checkIn.parentName}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-center py-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      No Check In
                    </span>
                  </div>
                )}
              </div>

              {/* Check Out Block */}
              <div
                className={`p-3 rounded-xl flex gap-3 items-center ${
                  pair.checkOut
                    ? "bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60"
                    : "bg-indigo-50/20 dark:bg-indigo-950/5 border border-dashed border-indigo-200/50 dark:border-indigo-800/20"
                }`}
              >
                {pair.checkOut ? (
                  <>
                    <button
                      onClick={() => setLightboxImage(pair.checkOut!.photoUrl)}
                      className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0 cursor-zoom-in"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pair.checkOut.photoUrl}
                        alt="Check Out Evidence"
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 mb-1">
                        Checked Out
                      </span>
                      <span className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                        {new Date(pair.checkOut.timestamp).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                      <span className="block text-[9px] text-slate-400 truncate font-medium">
                        by {pair.checkOut.parentName}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-center py-2 flex flex-col items-center justify-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></span>
                      Still at Academy
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Photo Evidence Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-zoom-out animate-fade-in"
        >
          {/* Floating Close Button */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 z-51 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/50 backdrop-blur-sm cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
            aria-label="Close lightbox"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-[95vw] md:max-w-3xl animate-scale-in"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage}
                alt="Security Evidence"
                className="w-auto h-auto max-w-[90vw] max-h-[70vh] md:max-w-3xl md:max-h-[75vh] object-contain rounded-2xl block"
              />
            </div>

            {/* Caption Info */}
            <div className="mt-4 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-lg flex items-center gap-2 text-[11px] font-semibold text-slate-300 tracking-wide select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-ring"></span>
              Security Photo Evidence
            </div>
          </div>
        </div>
      )}
    </>
  );
}
