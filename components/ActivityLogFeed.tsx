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

export default function ActivityLogFeed({ logs, loading }: ActivityLogFeedProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span className="text-sm text-slate-500 font-medium">Loading activity timeline...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 font-semibold text-sm">
        No check-in/out records found yet.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="p-5 flex gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all items-start animate-fade-in">
            
            {/* Photo Thumbnail Button */}
            <button
              onClick={() => setLightboxImage(log.photoUrl)}
              className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={log.photoUrl}
                alt="Evidence"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </button>

            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                  {log.kidName}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {log.type === "checkin" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    Check In
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                    Check Out
                  </span>
                )}
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  by {log.parentName}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 font-normal">
                Email: {log.parentEmail}
              </div>
              <div className="text-[9px] text-slate-400 font-normal">
                {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Security Photo Evidence Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="Security Evidence Lightbox"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
