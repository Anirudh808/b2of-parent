import React, { useState, useEffect, useRef } from "react";
import PinPad from "./PinPad";
import WebcamCapture from "./WebcamCapture";

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

interface PasscodeAuthModalProps {
  selectedKid: Kid | null;
  activeAction: "profile" | "checkinout" | "admin" | null;
  onClose: () => void;
  onSuccess: (action: "profile" | "checkinout" | "admin", verifiedPasscode?: string) => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

export default function PasscodeAuthModal({
  selectedKid,
  activeAction,
  onClose,
  onSuccess,
  showToast,
}: PasscodeAuthModalProps) {
  // Passcode entry state
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const [shakeKeypad, setShakeKeypad] = useState(false);
  const [, setHasPasscode] = useState<boolean | null>(null);

  // Email verification state
  const [showEmailVerificationScreen, setShowEmailVerificationScreen] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // OTP setup state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Forgot passcode state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPasscode, setForgotNewPasscode] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [enteredResetEmail, setEnteredResetEmail] = useState("");

  // Webcam stream capture refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");



  // 1.1 Email verification screen form submit handler
  const handleEmailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKid) return;
    setEmailError("");

    if (enteredEmail.trim().toLowerCase() !== selectedKid.parentEmail.toLowerCase()) {
      setEmailError("The entered email address does not match the registered parent email for this child.");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedKid.parentEmail }),
      });
      const json = await res.json();

      if (json.success) {
        setShowOtpModal(true);
        setOtpCode("");
        setNewPasscode("");
        setOtpError("");
        showToast(`Verification code sent to ${selectedKid.parentEmail}`);
        setShowEmailVerificationScreen(false);
      } else {
        setEmailError(json.error || "Failed to send OTP code.");
      }
    } catch (err) {
      console.error(err);
      setEmailError("Failed to connect for sending OTP.");
    } finally {
      setEmailLoading(false);
    }
  };

  // 2. Webcam stream management (Asynchronous to avoid set-state-in-effect)
  const startCamera = async () => {
    await Promise.resolve();
    setCameraActive(false);
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      } else {
        // If unmounted before stream bound, terminate tracks immediately
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (err) {
      console.error("Webcam access failed:", err);
      setCameraError("Camera access denied or unavailable. Please grant webcam permissions.");
      showToast("Camera access required for verification.", "error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    // Defer state update to run after React render commits
    Promise.resolve().then(() => {
      setCameraActive(false);
    });
  };

  // 3. Verify OTP & Save new passcode
  const handleVerifyOtpAndSetPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }
    if (!newPasscode.trim() || newPasscode.length !== 6 || isNaN(Number(newPasscode))) {
      setOtpError("Passcode must be a 6-digit numeric PIN.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-otp-set-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedKid?.parentEmail,
          otp: otpCode.trim(),
          passcode: newPasscode.trim(),
        }),
      });
      const json = await res.json();

      if (json.success) {
        showToast("Passcode set successfully!");
        setHasPasscode(true);
        setShowOtpModal(false);
        setEnteredPasscode("");
      } else {
        setOtpError(json.error || "Validation failed.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Connection error validating OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // 4. Webcam Canvas capture
  const captureWebcamSnapshot = (): string | null => {
    if (!videoRef.current || !cameraActive) return null;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.85);
      }
      return null;
    } catch (e) {
      console.error("Failed to capture snapshot:", e);
      return null;
    }
  };

  // 5. Perform check-in or checkout transaction
  const executeCheckInOut = async (passcode: string) => {
    if (!selectedKid) return;
    const base64Photo = captureWebcamSnapshot();

    if (!base64Photo) {
      if (cameraError) {
        setPasscodeError("Verification photo required. " + cameraError);
      } else {
        setPasscodeError("Webcam is initializing. Please wait a moment.");
      }
      setEnteredPasscode("");
      return;
    }

    setPasscodeLoading(true);
    try {
      const res = await fetch("/api/check-in-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kidId: selectedKid.id,
          email: selectedKid.parentEmail,
          passcode,
          photo: base64Photo,
        }),
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message);
        onSuccess("checkinout");
      } else {
        setPasscodeError(json.error || "Status update failed.");
        setEnteredPasscode("");
      }
    } catch (err) {
      console.error(err);
      setPasscodeError("Network error checking in/out.");
    } finally {
      setPasscodeLoading(false);
    }
  };

  // 6. Submit entered PIN
  const handlePinPadSubmit = async (pin: string) => {
    if (pin.length !== 6) return;

    if (activeAction === "admin") {
      setPasscodeLoading(true);
      setPasscodeError("");
      try {
        const res = await fetch("/api/auth/verify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: pin }),
        });
        const json = await res.json();

        if (json.success) {
          onSuccess("admin", pin);
        } else {
          setShakeKeypad(true);
          setTimeout(() => setShakeKeypad(false), 500);
          setPasscodeError(json.error || "Incorrect admin passcode.");
          setEnteredPasscode("");
        }
      } catch (err) {
        console.error(err);
        setPasscodeError("Server verification error. Try again.");
      } finally {
        setPasscodeLoading(false);
      }
      return;
    }

    if (!selectedKid) return;

    setPasscodeLoading(true);
    setPasscodeError("");
    try {
      const res = await fetch("/api/auth/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedKid.parentEmail, passcode: pin }),
      });
      const json = await res.json();

      if (json.success) {
        if (activeAction === "profile") {
          onSuccess("profile", pin);
        } else if (activeAction === "checkinout") {
          await executeCheckInOut(pin);
        }
      } else {
        setShakeKeypad(true);
        setTimeout(() => setShakeKeypad(false), 500);
        setPasscodeError(json.error || "Incorrect passcode.");
        setEnteredPasscode("");
      }
    } catch (err) {
      console.error(err);
      setPasscodeError("Server verification error. Try again.");
    } finally {
      setPasscodeLoading(false);
    }
  };

  // 7. PIN Pad helpers
  const handlePinPadClick = (val: string) => {
    if (enteredPasscode.length >= 6) return;
    const nextPin = enteredPasscode + val;
    setEnteredPasscode(nextPin);
    if (nextPin.length === 6) {
      handlePinPadSubmit(nextPin);
    }
  };

  const handlePinPadDelete = () => {
    setEnteredPasscode((prev) => prev.slice(0, -1));
  };

  const handlePinPadClear = () => {
    setEnteredPasscode("");
  };

  // 8. Forgot passcode handlers
  const handleForgotPasscodeTrigger = () => {
    setForgotStep(1);
    setForgotError("");
    setForgotOtp("");
    setForgotNewPasscode("");
    setEnteredResetEmail("");
    setShowForgotModal(true);
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKid) return;

    if (enteredResetEmail.trim().toLowerCase() !== selectedKid.parentEmail.toLowerCase()) {
      setForgotError("The entered email address does not match the registered parent email for this child.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedKid.parentEmail }),
      });
      const json = await res.json();

      if (json.success) {
        setForgotStep(2);
        showToast("OTP sent to your email!");
      } else {
        setForgotError(json.error || "Email not registered.");
      }
    } catch (err) {
      console.error(err);
      setForgotError("Connection error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKid) return;
    if (!forgotOtp.trim() || forgotOtp.length !== 6) {
      setForgotError("Please enter a valid 6-digit OTP.");
      return;
    }
    if (!forgotNewPasscode.trim() || forgotNewPasscode.length !== 6 || isNaN(Number(forgotNewPasscode))) {
      setForgotError("Passcode must be a 6-digit numeric PIN.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    try {
      const res = await fetch("/api/auth/verify-otp-set-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedKid.parentEmail,
          otp: forgotOtp.trim(),
          passcode: forgotNewPasscode.trim(),
        }),
      });
      const json = await res.json();

      if (json.success) {
        showToast("Passcode reset successfully!");
        setShowForgotModal(false);
        setEnteredPasscode("");
        setHasPasscode(true);
      } else {
        setForgotError(json.error || "Failed to reset passcode.");
      }
    } catch (err) {
      console.error(err);
      setForgotError("Connection error.");
    } finally {
      setForgotLoading(false);
    }
  };

  // 9. Effects section

  // Check passcode status and show email prompt if none exists
  useEffect(() => {
    if (selectedKid) {
      const checkPasscodeStatus = async () => {
        setPasscodeLoading(true);
        setPasscodeError("");
        try {
          const res = await fetch("/api/auth/check-passcode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: selectedKid.parentEmail }),
          });
          const json = await res.json();

          if (json.success) {
            setHasPasscode(json.hasPasscode);
            if (!json.hasPasscode) {
              setShowEmailVerificationScreen(true);
            } else {
              setShowEmailVerificationScreen(false);
            }
          } else {
            setPasscodeError(json.error || "Authentication check failed.");
          }
        } catch (err) {
          console.error(err);
          setPasscodeError("Connection error checking passcode status.");
        } finally {
          setPasscodeLoading(false);
        }
      };

      checkPasscodeStatus();
    }
  }, [selectedKid]);

  // Clean up and reset modal states whenever activeAction or selectedKid changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setEnteredPasscode("");
    setPasscodeError("");
    setPasscodeLoading(false);
    
    setShowEmailVerificationScreen(false);
    setEnteredEmail("");
    setEmailError("");
    setEmailLoading(false);
    
    setShowOtpModal(false);
    setOtpCode("");
    setNewPasscode("");
    setOtpError("");
    setOtpLoading(false);
    
    setShowForgotModal(false);
    setForgotOtp("");
    setForgotNewPasscode("");
    setForgotStep(1);
    setForgotError("");
    setForgotLoading(false);
    setEnteredResetEmail("");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedKid, activeAction]);

  // Handle webcam stream attachment
  useEffect(() => {
    if (selectedKid && activeAction === "checkinout" && !showOtpModal && !showForgotModal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKid, activeAction, showOtpModal, showForgotModal]);

  if (!activeAction || (activeAction !== "admin" && !selectedKid)) return null;

  return (
    <>
      {/* Passcode Verification Modal */}
      {!showOtpModal && !showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
          <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-fade-in ${
            shakeKeypad ? "animate-shake" : ""
          }`}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {activeAction === "admin" ? "Admin Panel Authorization" : activeAction === "profile" ? "Access Child Profile" : "Check In / Out Security Check"}
                </h4>
                {activeAction !== "admin" && selectedKid && (
                  <p className="text-[10px] text-slate-400 font-medium">Parent email: {selectedKid.parentEmail}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center w-full">
              
              {/* Webcam view for check-in/out verification */}
              {activeAction === "checkinout" && (
                <WebcamCapture
                  videoRef={videoRef}
                  cameraActive={cameraActive}
                  cameraError={cameraError}
                />
              )}

              {passcodeLoading ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-slate-400">Verifying credential security...</span>
                </div>
              ) : showEmailVerificationScreen ? (
                <form onSubmit={handleEmailVerificationSubmit} className="w-full space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed text-center">
                    Passcode setup required for safety. Enter your registered parent email address to receive an OTP verification code.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered Parent Email</label>
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={enteredEmail}
                      onChange={(e) => setEnteredEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {emailError && (
                    <span className="text-rose-500 text-xs font-bold text-center block">
                      {emailError}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all text-xs disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {emailLoading ? "Verifying..." : "Verify & Send OTP"}
                  </button>
                </form>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <PinPad
                    enteredPin={enteredPasscode}
                    onNumberClick={handlePinPadClick}
                    onClear={handlePinPadClear}
                    onDelete={handlePinPadDelete}
                    error={passcodeError}
                  />

                  {activeAction !== "admin" && (
                    <button
                      onClick={handleForgotPasscodeTrigger}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-600 tracking-wide mt-4 cursor-pointer"
                    >
                      Forgot passcode PIN?
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* OTP setup / Reset Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-base">Register Parent Passcode</h4>
                <p className="text-[10px] text-slate-400">Email: {selectedKid?.parentEmail}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleVerifyOtpAndSetPasscode} className="p-6 space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Security required: A 6-digit OTP code has been issued. Enter it below alongside your chosen 6-digit PIN code.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold tracking-widest text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Create Passcode (6-Digit PIN)</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold tracking-widest text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {otpError && (
                <span className="text-rose-500 text-xs font-bold text-center block">
                  {otpError}
                </span>
              )}

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {otpLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Verify & Register Passcode"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Passcode Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <h4 className="font-extrabold text-base">Reset Passcode PIN</h4>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotStep1} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered parent email address. We will verify it and send a 6-digit OTP passcode reset code.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Parent Registered Email</label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={enteredResetEmail}
                    onChange={(e) => setEnteredResetEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium"
                  />
                </div>

                {forgotError && (
                  <span className="text-rose-500 text-xs font-bold text-center block">
                    {forgotError}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></span>
                  ) : (
                    "Send Reset OTP"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotStep2} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter the 6-digit OTP code sent to your email and select a new 6-digit passcode PIN.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold tracking-widest text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New Passcode (6-Digit PIN)</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={forgotNewPasscode}
                    onChange={(e) => setForgotNewPasscode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold tracking-widest text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {forgotError && (
                  <span className="text-rose-500 text-xs font-bold text-center block">
                    {forgotError}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></span>
                  ) : (
                    "Reset & Set Passcode"
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
