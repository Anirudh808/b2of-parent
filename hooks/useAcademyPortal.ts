import React, { useState, useEffect } from "react";

export interface Kid {
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
  createdAt?: string;
  updatedAt?: string;
  registrationStart?: string;
  registrationEnd?: string;
}

export interface ActivityLog {
  id: string;
  kidId: string;
  kidName: string;
  parentEmail: string;
  parentName: string;
  type: "checkin" | "checkout";
  timestamp: string;
  photoUrl: string;
}

export function useAcademyPortal() {
  // Navigation & Role State
  const [currentRole, setCurrentRoleState] = useState<"parent" | "admin">("parent");

  const setCurrentRole = (role: "parent" | "admin") => {
    if (role === "admin") {
      setSelectedKid(null);
      setActiveAction("admin");
    } else {
      setCurrentRoleState("parent");
    }
  };

  // Parent search state
  const [searchFirst, setSearchFirst] = useState("");
  const [searchLast, setSearchLast] = useState("");
  const [activeSearchFirst, setActiveSearchFirst] = useState("");
  const [activeSearchLast, setActiveSearchLast] = useState("");
  const [parentKids, setParentKids] = useState<Kid[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [parentSearchLoading, setParentSearchLoading] = useState(false);

  // Admin state
  const [adminKids, setAdminKids] = useState<Kid[]>([]);
  const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilter, setAdminFilter] = useState<"all" | "in" | "out">("all");

  // Selected Kid for action
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [activeAction, setActiveAction] = useState<"profile" | "checkinout" | "admin" | null>(null);

  // Edit Kid Profile State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingKid, setEditingKid] = useState<Kid | null>(null);

  // Create Kid Profile (Admin)
  const [showCreateKidModal, setShowCreateKidModal] = useState(false);

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Helper: Trigger custom toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      // 1. Fetch Kids
      const kidsRes = await fetch("/api/kids");
      const kidsJson = await kidsRes.json();
      if (kidsJson.success) {
        setAdminKids(kidsJson.data);
      } else {
        showToast(kidsJson.error || "Failed to load kids.", "error");
      }

      // 2. Fetch Activity Logs
      const logsRes = await fetch("/api/logs");
      const logsJson = await logsRes.json();
      if (logsJson.success) {
        setAdminLogs(logsJson.data);
      } else {
        showToast(logsJson.error || "Failed to load logs.", "error");
      }
    } catch (e) {
      console.error("Admin data fetch error:", e);
      showToast("Server error fetching dashboard metrics.", "error");
    } finally {
      setAdminLoading(false);
    }
  };

  // Search kids (Parent Mode)
  const handleParentSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const first = searchFirst.trim();
    const last = searchLast.trim();
    if (!first && !last) {
      showToast("Please enter at least one name to search.", "error");
      return;
    }

    setParentSearchLoading(true);
    setSearchPerformed(true);
    setActiveSearchFirst(first);
    setActiveSearchLast(last);
    try {
      const params = new URLSearchParams();
      if (first) params.append("firstName", first);
      if (last) params.append("lastName", last);

      const res = await fetch(`/api/kids?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setParentKids(json.data);
        setSearchFirst("");
        setSearchLast("");
      } else {
        showToast(json.error || "Failed to fetch search results.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Connection error searching kids.", "error");
    } finally {
      setParentSearchLoading(false);
    }
  };

  const refreshParentKids = async () => {
    try {
      const params = new URLSearchParams();
      if (activeSearchFirst) params.append("firstName", activeSearchFirst);
      if (activeSearchLast) params.append("lastName", activeSearchLast);

      const res = await fetch(`/api/kids?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setParentKids(json.data);
      }
    } catch (err) {
      console.error("Error refreshing parent kids list:", err);
    }
  };

  // Start checkout/checkin or profile edit flow for a kid
  const initiateKidAction = (kid: Kid, action: "profile" | "checkinout") => {
    setSelectedKid(kid);
    setActiveAction(action);
  };

  const handleAuthSuccess = (action: "profile" | "checkinout" | "admin") => {
    if (action === "admin") {
      setCurrentRoleState("admin");
      setSelectedKid(null);
      setActiveAction(null);
    } else if (action === "profile") {
      setEditingKid(selectedKid);
      setShowEditProfileModal(true);
      setSelectedKid(null);
      setActiveAction(null);
    } else if (action === "checkinout") {
      if (searchPerformed) {
        refreshParentKids();
      }
      if (currentRole === "admin") {
        fetchAdminData();
      }
      setSelectedKid(null);
      setActiveAction(null);
    }
  };

  const handleEditSaveSuccess = () => {
    showToast("Child profile updated successfully.");
    if (searchPerformed) {
      refreshParentKids();
    }
    if (currentRole === "admin") {
      fetchAdminData();
    }
  };

  const handleCreateSuccess = () => {
    showToast("Child registered successfully!");
    fetchAdminData();
  };

  // Fetch admin data when admin tab is loaded
  useEffect(() => {
    if (currentRole === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole]);

  return {
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
    setEditingKid,
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
  };
}
