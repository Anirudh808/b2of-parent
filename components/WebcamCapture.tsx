import React, { RefObject } from "react";

interface WebcamCaptureProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraActive: boolean;
  cameraError: string;
}

export default function WebcamCapture({
  videoRef,
  cameraActive,
  cameraError,
}: WebcamCaptureProps) {
  return (
    <div className="w-full flex flex-col items-center gap-3 mb-6">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse-ring"></span>
        Security Webcam Feed
      </span>
      
      <div className="relative w-48 h-36 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
        />
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-3">
            <span className="text-[10px] text-slate-400 font-semibold">
              {cameraError || "Initializing security camera..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
