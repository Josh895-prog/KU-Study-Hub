import React, { useEffect, useState } from "react";
import { getResources, getAllUsers, approveResourceService, rejectResourceService, setUserRole } from "../firebase/services";

export default function AdminPage({ currentUser }) {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await getResources();
      setPending(all.filter((r) => r.status === "pending"));
      const u = await getAllUsers();
      setUsers(u);
      setLoading(false);
    }
    load();
  }, []);

  const handleApprove = async (id) => {
    const res = await approveResourceService(id, currentUser);
    if (res?.success) {
      setPending((p) => p.filter((x) => x.id !== id));
    } else {
      alert(res?.error || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    const res = await rejectResourceService(id, currentUser, reason);
    if (res?.success) {
      setPending((p) => p.filter((x) => x.id !== id));
    } else {
      alert(res?.error || "Failed to reject");
    }
  };

  const promote = async (uid) => {
    if (!window.confirm("Promote this user to admin?")) return;
    const res = await setUserRole(uid, "admin", currentUser);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: "admin" } : u)));
    } else alert(res.error || "Failed to promote");
  };

  const demote = async (uid) => {
    if (!window.confirm("Remove admin privileges from this user?")) return;
    const res = await setUserRole(uid, "student", currentUser);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: "student" } : u)));
    } else alert(res.error || "Failed to demote");
  };

  if (!currentUser || !(currentUser.role === "admin" || currentUser.role === "superAdmin")) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Unauthorized</h2>
        <p>You do not have access to the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Pending Documents</h3>
        {loading ? (
          <p>Loading...</p>
        ) : pending.length === 0 ? (
          <p>No pending documents.</p>
        ) : (
          <ul>
            {pending.map((p) => (
              <li key={p.id} style={{ marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem" }}>
                <strong>{p.courseCode}</strong> — {p.title}
                <div style={{ marginTop: "0.5rem" }}>
                  <button onClick={() => handleApprove(p.id)} style={{ marginRight: "0.5rem" }}>Approve</button>
                  <button onClick={() => handleReject(p.id)}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {currentUser.role === "superAdmin" && (
        <section style={{ marginTop: "2rem" }}>
          <h3>Admin Management</h3>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Name</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Email</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Role</th>
                  <th style={{ padding: "0.5rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid}>
                    <td style={{ padding: "0.5rem" }}>{u.displayName || "—"}</td>
                    <td style={{ padding: "0.5rem" }}>{u.email}</td>
                    <td style={{ padding: "0.5rem" }}>{u.role || "student"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      {u.role !== "admin" && (
                        <button onClick={() => promote(u.uid)} style={{ marginRight: "0.5rem" }}>Make Admin</button>
                      )}
                      {u.role === "admin" && (
                        <button onClick={() => demote(u.uid)}>Remove Admin</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
