import React, { useState } from "react";

interface CreateKidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
  adminPasscode?: string | null;
}

export default function CreateKidModal({
  isOpen,
  onClose,
  onCreateSuccess,
  adminPasscode,
}: CreateKidModalProps) {
  const [newKidForm, setNewKidForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "Male",
    parentName: "",
    parentEmail: "",
    authorizedToPickup: "",
    parentPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    notes: "",
    registrationStart: "",
    registrationEnd: "",
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  if (!isOpen) return null;

  const handleCreateKidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (adminPasscode) {
        headers["x-admin-passcode"] = adminPasscode;
      }

      const res = await fetch("/api/kids", {
        method: "POST",
        headers,
        body: JSON.stringify(newKidForm),
      });
      const json = await res.json();

      if (json.success) {
        // Reset form
        setNewKidForm({
          firstName: "",
          lastName: "",
          age: "",
          gender: "Male",
          parentName: "",
          parentEmail: "",
          authorizedToPickup: "",
          parentPhone: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          notes: "",
          registrationStart: "",
          registrationEnd: "",
        });
        onCreateSuccess();
        onClose();
      } else {
        setCreateError(json.error || "Failed to register child.");
      }
    } catch (err) {
      console.error(err);
      setCreateError("Connection error registering child.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center sticky top-0 z-10 glass">
          <h4 className="font-extrabold text-base">Register New Academy Student</h4>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleCreateKidSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">First Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John"
                value={newKidForm.firstName}
                onChange={(e) => setNewKidForm({ ...newKidForm, firstName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Doe"
                value={newKidForm.lastName}
                onChange={(e) => setNewKidForm({ ...newKidForm, lastName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Age</label>
              <input
                type="number"
                required
                placeholder="e.g. 7"
                value={newKidForm.age}
                onChange={(e) => setNewKidForm({ ...newKidForm, age: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</label>
              <select
                value={newKidForm.gender}
                onChange={(e) => setNewKidForm({ ...newKidForm, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium animate-none outline-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primary Parent/Guardian Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alice Doe"
                value={newKidForm.parentName}
                onChange={(e) => setNewKidForm({ ...newKidForm, parentName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Parent Email (Passcode verification key)</label>
              <input
                type="email"
                required
                placeholder="parent@example.com"
                value={newKidForm.parentEmail}
                onChange={(e) => setNewKidForm({ ...newKidForm, parentEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Parent Phone Number</label>
              <input
                type="text"
                required
                placeholder="e.g. +1 (555) 123-4567"
                value={newKidForm.parentPhone}
                onChange={(e) => setNewKidForm({ ...newKidForm, parentPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Authorized Pickups (Separated by commas)</label>
              <input
                type="text"
                required
                placeholder="e.g. Alice Doe, Bob Doe (Uncle)"
                value={newKidForm.authorizedToPickup}
                onChange={(e) => setNewKidForm({ ...newKidForm, authorizedToPickup: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Grandma Shirley"
                value={newKidForm.emergencyContactName}
                onChange={(e) => setNewKidForm({ ...newKidForm, emergencyContactName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact Phone</label>
              <input
                type="text"
                required
                placeholder="e.g. +1 (555) 987-6543"
                value={newKidForm.emergencyContactPhone}
                onChange={(e) => setNewKidForm({ ...newKidForm, emergencyContactPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registration Start Date</label>
              <input
                type="date"
                value={newKidForm.registrationStart}
                onChange={(e) => setNewKidForm({ ...newKidForm, registrationStart: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registration End Date</label>
              <input
                type="date"
                value={newKidForm.registrationEnd}
                onChange={(e) => setNewKidForm({ ...newKidForm, registrationEnd: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medical or General Notes</label>
            <textarea
              placeholder="allergies, medical conditions, specific pickup schedules..."
              value={newKidForm.notes}
              onChange={(e) => setNewKidForm({ ...newKidForm, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium min-h-[80px]"
            />
          </div>

          {createError && (
            <span className="text-rose-500 text-xs font-bold text-center block">
              {createError}
            </span>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {createLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
              ) : (
                "Register Student"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
