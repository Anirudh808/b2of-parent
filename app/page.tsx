'use client';

import React from "react";
import ParentPortalView from "@/components/ParentPortalView";
import AdminDashboardView from "@/components/AdminDashboardView";
import KidProfileModal from "@/components/KidProfileModal";
import CreateKidModal from "@/components/CreateKidModal";
import PasscodeAuthModal from "@/components/PasscodeAuthModal";
import { useAcademyPortal } from "@/hooks/useAcademyPortal";

export default function App() {
  const {
    currentRole,
    setCurrentRole,
    searchFirst,
    setSearchFirst,
    searchLast,
    setSearchLast,
    parentKids,
    searchPerformed,
    parentSearchLoading,
    adminKids,
    adminLogs,
    adminLoading,
    adminFilter,
    setAdminFilter,
    selectedKid,
    setSelectedKid,
    activeAction,
    setActiveAction,
    showEditProfileModal,
    setShowEditProfileModal,
    editingKid,
    showCreateKidModal,
    setShowCreateKidModal,
    toast,
    showToast,
    activeSearchFirst,
    activeSearchLast,
    handleParentSearch,
    initiateKidAction,
    handleAuthSuccess,
    handleEditSaveSuccess,
    handleCreateSuccess,
    setEditingKid,
  } = useAcademyPortal();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200" 
            : "bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
        }`}>
          {toast.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Main Layout Header */}
      <header className="sticky top-0 z-40 w-full glass shadow-sm py-4 px-6 md:px-12 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md tracking-wider">
            A
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              AcaCheck
            </span>
            <span className="text-xs block text-slate-500 dark:text-slate-400 font-medium">Academy Safety Portal</span>
          </div>
        </div>

        {/* Role Selector Segment Control */}
        <div className="flex bg-slate-200/75 dark:bg-slate-800/75 p-1 rounded-xl shadow-inner border border-slate-300/40 dark:border-slate-700/40">
          <button
            onClick={() => setCurrentRole("parent")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              currentRole === "parent"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Parent Portal
          </button>
          <button
            onClick={() => setCurrentRole("admin")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              currentRole === "admin"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Panel
          </button>
        </div>
      </header>

      {/* Main Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
        
        {/* Parent Portal view */}
        {currentRole === "parent" ? (
          <ParentPortalView
            searchFirst={searchFirst}
            setSearchFirst={setSearchFirst}
            searchLast={searchLast}
            setSearchLast={setSearchLast}
            activeSearchFirst={activeSearchFirst}
            activeSearchLast={activeSearchLast}
            parentKids={parentKids}
            searchPerformed={searchPerformed}
            parentSearchLoading={parentSearchLoading}
            onSearchSubmit={handleParentSearch}
            onInitiateAction={initiateKidAction}
          />
        ) : (
          /* Admin Dashboard view */
          <AdminDashboardView
            adminKids={adminKids}
            adminLogs={adminLogs}
            adminLoading={adminLoading}
            adminFilter={adminFilter}
            setAdminFilter={setAdminFilter}
            onAddChildClick={() => setShowCreateKidModal(true)}
            onEditChildClick={(kid) => {
              setEditingKid(kid);
              setShowEditProfileModal(true);
            }}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-400 mt-auto bg-white/40 dark:bg-slate-900/40 font-medium">
        © 2026 AcaCheck Academy Child Safety Pickup Portal. All Rights Reserved.
      </footer>

      {/* --- MODAL DIALOGS --- */}

      {/* Passcode Authentication Modal (PIN Pad, OTP Setup, Webcam Checkinout) */}
      <PasscodeAuthModal
        selectedKid={selectedKid}
        activeAction={activeAction}
        onClose={() => {
          setSelectedKid(null);
          setActiveAction(null);
        }}
        onSuccess={handleAuthSuccess}
        showToast={showToast}
      />

      {/* Edit Kid Profile Modal (Parent / Admin) */}
      <KidProfileModal
        kid={editingKid}
        isOpen={showEditProfileModal}
        onClose={() => {
          setShowEditProfileModal(false);
        }}
        onSaveSuccess={handleEditSaveSuccess}
      />

      {/* Admin Create Kid Modal */}
      <CreateKidModal
        isOpen={showCreateKidModal}
        onClose={() => setShowCreateKidModal(false)}
        onCreateSuccess={handleCreateSuccess}
      />

    </div>
  );
}
