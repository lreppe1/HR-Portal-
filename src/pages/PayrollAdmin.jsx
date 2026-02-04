import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/client";

export default function PayrollAdmin() {
  const [employees, setEmployees] = useState([]);
  const [paystubs, setPaystubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [periodStart, setPeriodStart] = useState("2026-02-01");
  const [periodEnd, setPeriodEnd] = useState("2026-02-15");
  const [payDate, setPayDate] = useState("2026-02-15");
  const [gross, setGross] = useState(3200);
  const [tax, setTax] = useState(550);
  const [deductions, setDeductions] = useState([
    { name: "Health", amount: 100 },
    { name: "401k", amount: 100 },
  ]);

  const net = useMemo(() => {
    const d = deductions.reduce((sum, x) => sum + (Number(x.amount) || 0), 0);
    return (Number(gross) || 0) - (Number(tax) || 0) - d;
  }, [gross, tax, deductions]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [emps, stubs] = await Promise.all([
        apiGet("/employees"),
        apiGet("/paystubs"),
      ]);

      const empsArr = Array.isArray(emps) ? emps : [];
      const stubsArr = Array.isArray(stubs) ? stubs : [];

      setEmployees(empsArr);
      setPaystubs(
        stubsArr.sort((a, b) => (b.payDate || "").localeCompare(a.payDate || ""))
      );

      // default select first employee
      if (!employeeId && empsArr.length) setEmployeeId(empsArr[0].id);
    } catch (e) {
      setErr(
        "Could not load payroll data. Make sure json-server is running on http://localhost:4000"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDeduction = (idx, key, value) => {
    setDeductions((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [key]: value } : d))
    );
  };

  const addDeductionRow = () => {
    setDeductions((prev) => [...prev, { name: "Other", amount: 0 }]);
  };

  const removeDeductionRow = (idx) => {
    setDeductions((prev) => prev.filter((_, i) => i !== idx));
  };

  const onCreatePaystub = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!employeeId) {
      setErr("Pick an employee.");
      return;
    }

    const payload = {
      // let json-server generate numeric id, or use your own string id
      id: `p-${Date.now()}`,
      employeeId,
      period: `${periodStart} → ${periodEnd}`,
      payDate,
      gross: Number(gross) || 0,
      tax: Number(tax) || 0,
      net: Number(net) || 0,
      deductions: deductions.map((d) => ({
        name: String(d.name || "").trim(),
        amount: Number(d.amount) || 0,
      })),
      createdAt: Date.now(),
    };

    try {
      await apiPost("/paystubs", payload);
      setMsg("Paystub created ✅");
      await load();
    } catch (e2) {
      setErr("Failed to create paystub. Check json-server and db.json.");
    }
  };

  const empName = (id) =>
    employees.find((e) => e.id === id)?.name || id || "—";

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Payroll Admin (Admin)</h1>
      <p style={{ opacity: 0.75 }}>
        Create paystubs and view all employee paystubs.
      </p>

      {err ? <div style={styles.err}>{err}</div> : null}
      {msg ? <div style={styles.ok}>{msg}</div> : null}

      <div style={styles.grid}>
        {/* Create Paystub */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Create Paystub</h3>

          <form onSubmit={onCreatePaystub} style={{ display: "grid", gap: 12 }}>
            <label style={styles.label}>
              Employee
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                style={styles.input}
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </select>
            </label>

            <div style={styles.row2}>
              <label style={styles.label}>
                Period start
                <input
                  style={styles.input}
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </label>
              <label style={styles.label}>
                Period end
                <input
                  style={styles.input}
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </label>
            </div>

            <label style={styles.label}>
              Pay date
              <input
                style={styles.input}
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </label>

            <div style={styles.row2}>
              <label style={styles.label}>
                Gross
                <input
                  style={styles.input}
                  type="number"
                  value={gross}
                  onChange={(e) => setGross(e.target.value)}
                />
              </label>
              <label style={styles.label}>
                Tax
                <input
                  style={styles.input}
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                />
              </label>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>
                Deductions
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {deductions.map((d, idx) => (
                  <div key={idx} style={styles.row3}>
                    <input
                      style={styles.input}
                      value={d.name}
                      onChange={(e) =>
                        updateDeduction(idx, "name", e.target.value)
                      }
                      placeholder="Name"
                    />
                    <input
                      style={styles.input}
                      type="number"
                      value={d.amount}
                      onChange={(e) =>
                        updateDeduction(idx, "amount", e.target.value)
                      }
                      placeholder="Amount"
                    />
                    <button
                      type="button"
                      onClick={() => removeDeductionRow(idx)}
                      style={styles.smallBtn}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={addDeductionRow}
                  style={styles.secondary}
                >
                  + Add deduction
                </button>
              </div>
            </div>

            <div style={styles.summary}>
              <div>
                <strong>Net (auto):</strong> ${Number(net || 0).toFixed(2)}
              </div>
            </div>

            <button type="submit" style={styles.primary}>
              Create paystub
            </button>
          </form>
        </div>

        {/* Paystub list */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>All Paystubs</h3>

          {loading ? (
            <div>Loading…</div>
          ) : paystubs.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No paystubs available.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Pay date</th>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Period</th>
                    <th style={styles.th}>Gross</th>
                    <th style={styles.th}>Tax</th>
                    <th style={styles.th}>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {paystubs.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.payDate}</td>
                      <td style={styles.td}>{empName(p.employeeId)}</td>
                      <td style={styles.td}>{p.period}</td>
                      <td style={styles.td}>${Number(p.gross || 0).toFixed(2)}</td>
                      <td style={styles.td}>${Number(p.tax || 0).toFixed(2)}</td>
                      <td style={styles.td}>${Number(p.net || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
                Tip: Employees will only see their own paystubs on the Payroll
                page.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    alignItems: "start",
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },
  label: { display: "grid", gap: 6, fontWeight: 800, fontSize: 14 },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  row3: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.6fr auto",
    gap: 10,
    alignItems: "center",
  },
  smallBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 800,
  },
  primary: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
  },
  secondary: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    cursor: "pointer",
    fontWeight: 900,
  },
  summary: {
    padding: 10,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fafafa",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 10, borderBottom: "1px solid #eee" },
  td: { padding: 10, borderBottom: "1px solid #f1f1f1" },
  err: {
    padding: 10,
    borderRadius: 12,
    background: "#ffe7e7",
    border: "1px solid #ffb3b3",
    color: "#7a0000",
    marginBottom: 12,
  },
  ok: {
    padding: 10,
    borderRadius: 12,
    background: "#e7ffe7",
    border: "1px solid #b3ffb3",
    color: "#004d00",
    marginBottom: 12,
  },
};
