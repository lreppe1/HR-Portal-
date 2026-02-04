import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { apiGet, apiPatch, apiPost } from "../api/client";

export default function LeaveRequests() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const all = await apiGet("/leaveRequests");
    setItems(all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const mine = useMemo(() => items.filter((r) => r.employeeId === user.id), [items, user?.id]);
  const pending = useMemo(() => items.filter((r) => r.status === "Pending"), [items]);

  const submit = async (e) => {
    e.preventDefault();
    await apiPost("/leaveRequests", {
      id: `lr-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      startDate,
      endDate,
      reason,
      status: "Pending",
      decisionNote: "",
      createdAt: Date.now(),
    });
    setStartDate(""); setEndDate(""); setReason("");
    await load();
  };

  const decide = async (id, status) => {
    const note = prompt(`Optional note for ${status}:`) || "";
    await apiPatch(`/leaveRequests/${id}`, { status, decisionNote: note });
    await load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Leave Requests</h1>

      {!isAdmin ? (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Create leave request</h3>
          <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <label style={label}>
              Start date
              <input style={input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label style={label}>
              End date
              <input style={input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
            <label style={label}>
              Reason
              <input style={input} value={reason} onChange={(e) => setReason(e.target.value)} required />
            </label>
            <button style={btn} type="submit">Submit</button>
          </form>
        </div>
      ) : null}

      <div style={{ height: 12 }} />

      {loading ? <div>Loading…</div> : null}

      {isAdmin ? (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Pending approvals</h3>
          {pending.length === 0 ? <div>No pending requests.</div> : null}
          <Grid rows={pending} isAdmin onDecide={decide} />
        </div>
      ) : (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>My requests</h3>
          {mine.length === 0 ? <div>No requests yet.</div> : null}
          <Grid rows={mine} />
        </div>
      )}
    </div>
  );
}

function Grid({ rows, isAdmin, onDecide }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((r) => (
        <div key={r.id} style={row}>
          <div><strong>{r.employeeName}</strong> — {r.startDate} → {r.endDate}</div>
          <div style={{ opacity: 0.8 }}>{r.reason}</div>
          <div>
            Status: <strong>{r.status}</strong>
            {r.decisionNote ? <span style={{ opacity: 0.7 }}> — {r.decisionNote}</span> : null}
          </div>

          {isAdmin ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnSmall} onClick={() => onDecide(r.id, "Approved")} type="button">Approve</button>
              <button style={btnSmallAlt} onClick={() => onDecide(r.id, "Denied")} type="button">Deny</button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 };
const row = { border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa", display: "grid", gap: 6 };
const label = { display: "grid", gap: 6, fontWeight: 700 };
const input = { padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" };
const btn = { padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "white", cursor: "pointer", width: "fit-content" };
const btnSmall = { ...btn, padding: "8px 10px" };
const btnSmallAlt = { ...btnSmall, background: "white", color: "#111" };
