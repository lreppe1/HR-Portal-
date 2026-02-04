// src/pages/ProfileChangesAdmin.jsx
import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../api/client";
import { useSelector } from "react-redux";

// ✅ Helpers (keep outside component)
function Row({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 10 }}>
      <div style={{ fontWeight: 800, opacity: 0.8 }}>{label}</div>
      <div style={{ whiteSpace: "pre-wrap" }}>{value || "—"}</div>
    </div>
  );
}

function formatAddress(a) {
  if (!a) return "";
  const parts = [a.line1, a.city, a.state, a.zip].filter(Boolean);
  return parts.join(", ");
}

function formatEmergency(ec) {
  if (!ec) return "";
  const parts = [
    ec.name ? `Name: ${ec.name}` : null,
    ec.relationship ? `Relation: ${ec.relationship}` : null,
    ec.phone ? `Phone: ${ec.phone}` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

export default function ProfileChangesAdmin() {
  const user = useSelector((s) => s.auth?.user);
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const isPending = (r) => String(r?.status || "").toLowerCase() === "pending";

  const load = async () => {
    try {
      setErr("");
      setMsg("");
      const data = await apiGet("/profileChangeRequests");
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
      setItems(list);
    } catch (e) {
      setErr("Could not load profile change requests. Is json-server running?");
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (req) => {
    if (!isPending(req)) return;

    try {
      setErr("");
      setMsg("");
      setBusyId(req.id);

      // 1) Apply approved changes to employee
      await apiPatch(`/employees/${req.employeeId}`, req.requestedChanges);

      // 2) Mark request as approved
      await apiPatch(`/profileChangeRequests/${req.id}`, {
        status: "approved",
        reviewedAt: Date.now(),
        reviewedBy: user?.id || "a-9001",
      });

      setMsg("Approved ✅ Changes applied to employee profile.");
      await load();
    } catch (e) {
      setErr(`Approve failed: ${String(e?.message || e)}`);
    } finally {
      setBusyId(null);
    }
  };

  const deny = async (req) => {
    if (!isPending(req)) return;

    try {
      setErr("");
      setMsg("");
      setBusyId(req.id);

      await apiPatch(`/profileChangeRequests/${req.id}`, {
        status: "denied",
        reviewedAt: Date.now(),
        reviewedBy: user?.id || "a-9001",
      });

      setMsg("Denied ✅");
      await load();
    } catch (e) {
      setErr(`Deny failed: ${String(e?.message || e)}`);
    } finally {
      setBusyId(null);
    }
  };

  if (!user?.id) return <div style={{ padding: 16 }}>Please log in.</div>;
  if (!isAdmin) return <div style={{ padding: 16 }}>Admins only.</div>;

  return (
    <div style={{ padding: 16, maxWidth: 1100 }}>
      <h1 style={{ marginTop: 0 }}>Profile Change Approvals</h1>
      <p style={{ opacity: 0.75 }}>Approve/deny employee profile update requests.</p>

      {err ? <div style={styles.error}>{err}</div> : null}
      {msg ? <div style={styles.ok}>{msg}</div> : null}

      {items.length === 0 ? (
        <div style={styles.card}>No profile change requests.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((r) => {
            const pending = isPending(r);
            const busy = busyId === r.id;

            const changes = r.requestedChanges || {};
            const address = formatAddress(changes.address);
            const emergency = formatEmergency(changes?.contactDetails?.emergencyContact);

            return (
              <div key={r.id} style={styles.card}>
                <div style={styles.row}>
                  <div>
                    <div>
                      <strong>Employee:</strong> {r.employeeName || r.employeeId}
                    </div>
                    <div>
                      <strong>Email:</strong> {r.employeeEmail || "—"}
                    </div>
                    <div>
                      <strong>Status:</strong> {String(r.status || "")}
                    </div>
                    <div>
                      <strong>Created:</strong>{" "}
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => approve(r)}
                      disabled={!pending || busy}
                      style={{ ...styles.btn, opacity: pending && !busy ? 1 : 0.5 }}
                    >
                      {busy ? "Working..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deny(r)}
                      disabled={!pending || busy}
                      style={{ ...styles.btnOutline, opacity: pending && !busy ? 1 : 0.5 }}
                    >
                      Deny
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <h3 style={{ margin: "0 0 8px" }}>Requested Changes</h3>

                  <div style={{ display: "grid", gap: 8 }}>
                    <Row label="First Name" value={changes.firstName} />
                    <Row label="Last Name" value={changes.lastName} />
                    <Row label="Gender" value={changes.gender} />
                    <Row label="Date of Birth" value={changes.dateOfBirth} />
                    <Row label="Marital Status" value={changes.maritalStatus} />
                    <Row label="Nationality" value={changes.nationality} />
                    <Row label="Phone" value={changes.phone} />
                    <Row label="Address" value={address} />
                    <Row label="Personal Email" value={changes?.contactDetails?.personalEmail} />
                    <Row label="Mobile Number" value={changes?.contactDetails?.mobileNumber} />
                    <Row label="Emergency Contact" value={emergency} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#111",
    background: "#111",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  },
  btnOutline: {
    padding: "10px 12px",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    background: "white",
    color: "#111",
    cursor: "pointer",
    fontWeight: 800,
  },
  error: {
    padding: 12,
    borderRadius: 12,
    background: "#ffe7e7",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ffb3b3",
    color: "#7a0000",
    marginBottom: 10,
  },
  ok: {
    padding: 12,
    borderRadius: 12,
    background: "#eaffea",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#b5ffb5",
    color: "#045b04",
    marginBottom: 10,
  },
};
