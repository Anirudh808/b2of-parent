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
}

interface KidProfileModalProps {
  kid: Kid | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function KidProfileModal({
  kid,
  isOpen,
  onClose,
  onSaveSuccess,
}: KidProfileModalProps) {
  const [editingKid, setEditingKid] = useState<Partial<Kid>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (kid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingKid({ ...kid });
      setEditError("");
    }
  }, [kid]);

  if (!isOpen || !kid) return null;

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch(`/api/kids/${editingKid.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingKid)
      });
      const json = await res.json();

      if (json.success) {
        onSaveSuccess();
        onClose();
      } else {
        setEditError(json.error || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      setEditError("Connection error updating profile.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center sticky top-0 z-10 glass">
          <div>
            <h4 className="font-extrabold text-base">Edit Child Profile</h4>
            <p className="text-[10px] text-slate-400 font-medium">Student ID: {editingKid.id}</p>
          </div>
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

        <form onSubmit={handleEditProfileSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">First Name</label>
              <input
                type="text"
                required
                value={editingKid.firstName || ""}
                onChange={(e) => setEditingKid({ ...editingKid, firstName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Name</label>
              <input
                type="text"
                required
                value={editingKid.lastName || ""}
                onChange={(e) => setEditingKid({ ...editingKid, lastName: e.target.value })}
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
                value={editingKid.age || ""}
                onChange={(e) => setEditingKid({ ...editingKid, age: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</label>
              <select
                value={editingKid.gender || "Male"}
                onChange={(e) => setEditingKid({ ...editingKid, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
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
                value={editingKid.parentName || ""}
                onChange={(e) => setEditingKid({ ...editingKid, parentName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered Parent Email (Critical Key)</label>
              <input
                type="email"
                required
                value={editingKid.parentEmail || ""}
                onChange={(e) => setEditingKid({ ...editingKid, parentEmail: e.target.value })}
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
                value={editingKid.parentPhone || ""}
                onChange={(e) => setEditingKid({ ...editingKid, parentPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Authorized Pickup Names</label>
              <input
                type="text"
                required
                placeholder="e.g. Grandma Jane, Uncle Jim"
                value={editingKid.authorizedToPickup || ""}
                onChange={(e) => setEditingKid({ ...editingKid, authorizedToPickup: e.target.value })}
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
                value={editingKid.emergencyContactName || ""}
                onChange={(e) => setEditingKid({ ...editingKid, emergencyContactName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact Phone</label>
              <input
                type="text"
                required
                value={editingKid.emergencyContactPhone || ""}
                onChange={(e) => setEditingKid({ ...editingKid, emergencyContactPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medical or General Notes</label>
            <textarea
              placeholder="Enter allergies, medical instructions, or authorization notes..."
              value={editingKid.notes || ""}
              onChange={(e) => setEditingKid({ ...editingKid, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium min-h-[80px]"
            />
          </div>

          {editError && (
            <span className="text-rose-500 text-xs font-bold text-center block">
              {editError}
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
              disabled={editLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {editLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
