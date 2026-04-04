"use client";
import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../providers";
import { isAdmin } from "../../constants";
import { authFetch } from "../../utils/firebase-client";
import { FadeIn } from "../shared/UIComponents";

export default function AdminPage() {
  const { user, nav } = useApp();
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Redirect non-admin
  useEffect(() => {
    if (user !== null && !isAdmin(user)) nav("home");
  }, [user, nav]);

  const fetchData = useCallback(async () => {
    if (!isAdmin(user)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Failed to fetch admin data:", e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      await authFetch("/api/admin/requests", { requestId, action });
      await fetchData();
    } catch (e) {
      console.error("Action failed:", e);
    }
    setActionLoading(null);
  };

  if (!user || !isAdmin(user)) {
    return <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: "#F9FAFB" }}>
      <p style={{ color: "#9CA3AF", fontSize: 14 }}>Access restricted. Please sign in as admin.</p>
    </div>;
  }

  const pending = requests.filter(r => r.status === "pending");
  const resolved = requests.filter(r => r.status !== "pending");

  return <div className="min-h-screen" style={{ paddingTop: 56, background: "#F9FAFB" }}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-bold" style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#111827", fontSize: 28 }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>Manage user access requests and permissions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[["requests", `Requests${pending.length > 0 ? ` (${pending.length})` : ""}`], ["users", "Users"], ["history", "History"]].map(([key, label]) =>
            <button key={key} onClick={() => setTab(key)} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{
              background: tab === key ? "#F3E8FF" : "#FFFFFF",
              color: tab === key ? "#9333EA" : "#4B5563",
              border: `1px solid ${tab === key ? "rgba(147,51,234,0.3)" : "#E5E7EB"}`
            }}>{label}</button>
          )}
        </div>
      </FadeIn>

      {loading ? <div className="text-center py-12"><p style={{ color: "#9CA3AF", fontSize: 14 }}>Loading...</p></div> : <>

        {/* Pending Requests */}
        {tab === "requests" && <FadeIn delay={40}>
          {pending.length === 0 ? <div className="rounded-2xl p-8 text-center" style={{ background: "white", border: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 14, color: "#9CA3AF" }}>No pending requests</p>
          </div> : <div className="space-y-3">
            {pending.map(r => <div key={r.id} className="rounded-xl p-4 flex items-center justify-between" style={{ background: "white", border: "1px solid #E5E7EB" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: "#111827" }}>{r.userName || r.userEmail}</span>
                  <span className="px-2 py-0.5 rounded-full font-bold" style={{ fontSize: 10, background: r.feature === "arena" ? "#FDE8E0" : "#E3F2FD", color: r.feature === "arena" ? "#E8734A" : "#3B6B9B" }}>
                    {r.feature === "arena" ? "Arena" : "Loom Extras"}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#9CA3AF" }}>{r.userEmail} &middot; {new Date(r.requestedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(r.id, "approve")} disabled={actionLoading === r.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: "#2D8A6E", color: "white" }}>
                  {actionLoading === r.id ? "..." : "Approve"}
                </button>
                <button onClick={() => handleAction(r.id, "deny")} disabled={actionLoading === r.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: "#EF4444", color: "white" }}>
                  Deny
                </button>
              </div>
            </div>)}
          </div>}
        </FadeIn>}

        {/* Users */}
        {tab === "users" && <FadeIn delay={40}>
          {users.length === 0 ? <div className="rounded-2xl p-8 text-center" style={{ background: "white", border: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 14, color: "#9CA3AF" }}>No registered users yet</p>
          </div> : <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #E5E7EB" }}>
            <div className="divide-y" style={{ borderColor: "#F3F4F6" }}>
              {users.map(u => {
                const userRequests = requests.filter(r => r.userId === u.id);
                const arenaAccess = userRequests.some(r => r.feature === "arena" && r.status === "approved");
                const loomAccess = userRequests.some(r => r.feature === "loom_extras" && r.status === "approved");
                return <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ background: "#F3E8FF", color: "#9333EA", fontSize: 12 }}>{(u.name || u.email || "?").charAt(0).toUpperCase()}</div>}
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#111827" }}>{u.name || "Unknown"}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF" }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: arenaAccess ? "#E0F2EC" : "#F3F4F6", color: arenaAccess ? "#2D8A6E" : "#9CA3AF" }}>Arena {arenaAccess ? "✓" : "—"}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: loomAccess ? "#E3F2FD" : "#F3F4F6", color: loomAccess ? "#3B6B9B" : "#9CA3AF" }}>Loom {loomAccess ? "✓" : "—"}</span>
                  </div>
                </div>;
              })}
            </div>
          </div>}
        </FadeIn>}

        {/* History */}
        {tab === "history" && <FadeIn delay={40}>
          {resolved.length === 0 ? <div className="rounded-2xl p-8 text-center" style={{ background: "white", border: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 14, color: "#9CA3AF" }}>No resolved requests yet</p>
          </div> : <div className="space-y-2">
            {resolved.map(r => <div key={r.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: "white", border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: r.status === "approved" ? "#2D8A6E" : "#EF4444" }} />
                <span className="text-sm" style={{ color: "#111827" }}>{r.userName || r.userEmail}</span>
                <span className="px-2 py-0.5 rounded-full font-bold" style={{ fontSize: 9, background: r.feature === "arena" ? "#FDE8E0" : "#E3F2FD", color: r.feature === "arena" ? "#E8734A" : "#3B6B9B" }}>
                  {r.feature === "arena" ? "Arena" : "Loom Extras"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: r.status === "approved" ? "#2D8A6E" : "#EF4444" }}>
                  {r.status === "approved" ? "Approved" : "Denied"}
                </span>
                <span style={{ fontSize: 10, color: "#9CA3AF" }}>{r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : ""}</span>
              </div>
            </div>)}
          </div>}
        </FadeIn>}
      </>}
    </div>
  </div>;
}

async function getToken() {
  try {
    const { getFirebase } = await import("../../utils/firebase-client");
    const { auth } = await getFirebase();
    return auth?.currentUser ? await auth.currentUser.getIdToken() : "";
  } catch { return ""; }
}
