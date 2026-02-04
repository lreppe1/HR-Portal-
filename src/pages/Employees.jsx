import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:4000";

async function apiGet(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
async function apiPatch(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
async function apiDelete(path) {
  const res = await fetch(`${API}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error("API error");
  return true;
}

export default function Employees() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const all = await apiGet("/employees");
      // Hide admin accounts from grid (optional)
      setItems((all || []).filter((u) => u.role !== "admin"));
    } catch {
      setErr("Failed to load employees. Is json-server running on :4000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((e) => {
      const hay = `${e.name} ${e.email} ${e.department || ""} ${e.title || ""} ${e.id}`.toLowerCase();
      return hay.includes(t);
    });
  }, [items, q]);

  const onDelete = async (emp) => {
    if (!confirm(`Delete ${emp.name}?`)) return;
    try {
      await apiDelete(`/employees/${emp.id}`);
      // also remove onboarding record if exists
      const ob = await apiGet(`/onboarding?employeeId=${encodeURIComponent(emp.id)}`);
      if (ob?.[0]?.id) await apiDelete(`/onboarding/${ob[0].id}`);
      await load();
    } catch {
      alert("Delete failed.");
    }
  };

  const onCreateEmployee = async (payload) => {
    try {
      // create employee
      const created = await apiPost("/employees", payload);

      // start onboarding record
      const ob = await apiPost("/onboarding", {
        employeeId: created.id,
        step: "personal",
        personal: { dob: "", ssnLast4: "", emergencyContact: "" },
        address: { line1: "", line2: "", city: "", state: "", zip: "" },
        store: { storeId: "", storeName: "", position: "", startDate: "" },
        payroll: { payType: "Hourly", rate: 0, taxStatus: "", bankLast4: "" },
        documents: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // link onboardingId onto employee (optional)
      await apiPatch(`/employees/${created.id}`, { onboardingId: ob.id });

      setShowCreate(false);
      await load();
      alert("Employee created and onboarding started.");
    } catch {
      alert("Create failed. Check db.json + json-server.");
    }
  };

  const onSaveEdit = async (id, updates) => {
    try {
      await apiPatch(`/employees/${id}`, updates);
      setEditing(null);
      await load();
    } catch {
      alert("Update failed.");
    }
  };

  return (
    <div style={{ padding: 8 }}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ margin: 0 }}>Employees</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
            Admin grid: create employees + manage onboarding + basic edits.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setShowCreate(true)}>
          + New Employee
        </button>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, dept, title..."
        />
        <button style={styles.btn} onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {err ? <div style={styles.error}>{err}</div> : null}

      {loading ? (
        <div style={{ padding: 12, opacity: 0.8 }}>Loading...</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((emp) => (
            <div key={emp.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={styles.name}>{emp.name}</div>
                  <div style={styles.meta}>{emp.email}</div>
                  <div style={styles.meta}>
                    {emp.department || "—"} • {emp.title || "—"}
                  </div>
                  <div style={styles.meta}>ID: {emp.id}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={badge(emp.status)}>{emp.status || "Active"}</span>
                </div>
              </div>

              <div style={styles.actions}>
                <Link style={styles.linkBtn} to={`/onboarding/${emp.id}`}>
                  Onboarding
                </Link>

                <button style={styles.btn} onClick={() => setEditing(emp)}>
                  Edit
                </button>

                <button style={styles.dangerBtn} onClick={() => onDelete(emp)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 ? (
            <div style={{ padding: 12, opacity: 0.8 }}>No employees found.</div>
          ) : null}
        </div>
      )}

      {showCreate ? (
        <EmployeeModal
          title="Create Employee"
          onClose={() => setShowCreate(false)}
          onSave={onCreateEmployee}
          initial={{
            id: `e-${Math.floor(1000 + Math.random() * 9000)}`,
            role: "employee",
            name: "",
            email: "",
            password: "Employee123!",
            department: "",
            title: "",
            status: "Active",
            phone: "",
          }}
          saveLabel="Create + Start Onboarding"
        />
      ) : null}

      {editing ? (
        <EmployeeModal
          title={`Edit: ${editing.name}`}
          onClose={() => setEditing(null)}
          onSave={(payload) => onSaveEdit(editing.id, payload)}
          initial={{
            name: editing.name || "",
            email: editing.email || "",
            department: editing.department || "",
            title: editing.title || "",
            status: editing.status || "Active",
            phone: editing.phone || "",
          }}
          saveLabel="Save Changes"
          hideIdRolePassword
        />
      ) : null}
    </div>
  );
}

function EmployeeModal({ title, onClose, onSave, initial, saveLabel, hideIdRolePassword = false }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return alert("Name is required.");
    if (!form.email?.trim()) return alert("Email is required.");
    onSave(form);
  };

  return (
    <div style={styles.modalBackdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button style={styles.btn} onClick={onClose}>Close</button>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {!hideIdRolePassword ? (
            <div style={styles.row2}>
              <label style={styles.label}>
                Employee ID
                <input style={styles.input} value={form.id} onChange={(e) => set("id", e.target.value)} />
              </label>
              <label style={styles.label}>
                Role
                <select style={styles.input} value={form.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
              </label>
            </div>
          ) : null}

          <div style={styles.row2}>
            <label style={styles.label}>
              Name
              <input style={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </label>
            <label style={styles.label}>
              Email
              <input style={styles.input} value={form.email} onChange={(e) => set("email", e.target.value)} />
            </label>
          </div>

          {!hideIdRolePassword ? (
            <label style={styles.label}>
              Temp Password
              <input style={styles.input} value={form.password} onChange={(e) => set("password", e.target.value)} />
            </label>
          ) : null}

          <div style={styles.row3}>
            <label style={styles.label}>
              Department
              <input style={styles.input} value={form.department} onChange={(e) => set("department", e.target.value)} />
            </label>
            <label style={styles.label}>
              Title
              <input style={styles.input} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </label>
            <label style={styles.label}>
              Status
              <select style={styles.input} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>

          <label style={styles.label}>
            Phone
            <input style={styles.input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </label>

          <button style={styles.primaryBtn} type="submit">{saveLabel}</button>
        </form>
      </div>
    </div>
  );
}

function badge(status) {
  const s = (status || "").toLowerCase();
  const bg = s === "inactive" ? "#fff0f0" : "#ecfdf5";
  const br = s === "inactive" ? "#fecaca" : "#a7f3d0";
  const tx = s === "inactive" ? "#991b1b" : "#065f46";
  return {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    border: `1px solid ${br}`,
    background: bg,
    color: tx,
    fontSize: 12,
    height: "fit-content",
  };
}

const styles = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 12 },
  toolbar: { display: "flex", gap: 10, margin: "12px 0" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none", background: "white" },
  btn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" },
  primaryBtn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "white", cursor: "pointer", whiteSpace: "nowrap" },
  dangerBtn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #fecaca", background: "#fff0f0", color: "#991b1b", cursor: "pointer" },
  linkBtn: { display: "inline-block", padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "white", textDecoration: "none", textAlign: "center" },
  error: { padding: 10, borderRadius: 10, border: "1px solid #fecaca", background: "#fff0f0", color: "#991b1b", marginTop: 10 },
  grid: { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 12 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, display: "grid", gap: 12 },
  name: { fontSize: 16, fontWeight: 700 },
  meta: { fontSize: 13, opacity: 0.75, marginTop: 2 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 14, zIndex: 999 },
  modal: { width: "min(820px, 100%)", background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 14 },
  label: { display: "grid", gap: 6, fontSize: 13 },
  row2: { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" },
  row3: { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" },
};