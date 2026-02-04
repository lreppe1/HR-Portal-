import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

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

const STEPS = ["personal", "address", "store", "payroll", "documents", "complete"];

export default function OnboardingAdmin() {
  const { employeeId } = useParams();

  const [employee, setEmployee] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const activeStep = onboarding?.step || "personal";

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const emp = await apiGet(`/employees/${employeeId}`);
      setEmployee(emp);

      const ob = await apiGet(`/onboarding?employeeId=${encodeURIComponent(employeeId)}`);
      if (ob?.[0]) {
        setOnboarding(ob[0]);
      } else {
        // Create onboarding if missing
        const created = await apiPost("/onboarding", {
          employeeId,
          step: "personal",
          personal: { dob: "", ssnLast4: "", emergencyContact: "" },
          address: { line1: "", line2: "", city: "", state: "", zip: "" },
          store: { storeId: "", storeName: "", position: "", startDate: "" },
          payroll: { payType: "Hourly", rate: 0, taxStatus: "", bankLast4: "" },
          documents: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        setOnboarding(created);
        await apiPatch(`/employees/${employeeId}`, { onboardingId: created.id });
      }
    } catch (e) {
      setErr("Failed to load onboarding. Check json-server and IDs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const stepIndex = useMemo(() => STEPS.indexOf(activeStep), [activeStep]);
  const progress = useMemo(() => Math.max(0, Math.min(100, (stepIndex / 5) * 100)), [stepIndex]);

  const setStep = async (nextStep) => {
    if (!onboarding?.id) return;
    const updated = await apiPatch(`/onboarding/${onboarding.id}`, { step: nextStep, updatedAt: Date.now() });
    setOnboarding(updated);
  };

  const saveBlock = async (blockName, updates) => {
    if (!onboarding?.id) return;
    const updated = await apiPatch(`/onboarding/${onboarding.id}`, {
      [blockName]: { ...(onboarding[blockName] || {}), ...updates },
      updatedAt: Date.now(),
    });
    setOnboarding(updated);
    alert("Saved.");
  };

  const addDoc = async (doc) => {
    if (!onboarding?.id) return;
    const current = Array.isArray(onboarding.documents) ? onboarding.documents : [];
    const updated = await apiPatch(`/onboarding/${onboarding.id}`, {
      documents: [
        ...current,
        { id: `doc-${Math.random().toString(16).slice(2)}`, uploadedAt: Date.now(), ...doc },
      ],
      updatedAt: Date.now(),
    });
    setOnboarding(updated);
  };

  if (loading) return <div style={{ padding: 16 }}>Loading onboarding...</div>;
  if (err) return <div style={{ padding: 16, color: "#991b1b" }}>{err}</div>;

  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0 }}>Onboarding</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
            Employee: <strong>{employee?.name}</strong> • {employee?.email} • ID: {employeeId}
          </p>
        </div>

        <Link to="/employees" style={styles.btnLink}>
          ← Back to Employees
        </Link>
      </div>

      <div style={styles.progressWrap}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.75 }}>Step: <strong>{activeStep}</strong></div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>{Math.round(progress)}%</div>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </div>

      <div style={styles.tabs}>
        {["personal", "address", "store", "payroll", "documents"].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            style={tabBtn(s === activeStep)}
          >
            {capitalize(s)}
          </button>
        ))}
        <button onClick={() => setStep("complete")} style={tabBtn(activeStep === "complete")}>
          Complete
        </button>
      </div>

      {activeStep === "personal" ? (
        <SectionPersonal ob={onboarding} onSave={(u) => saveBlock("personal", u)} onNext={() => setStep("address")} />
      ) : null}

      {activeStep === "address" ? (
        <SectionAddress ob={onboarding} onSave={(u) => saveBlock("address", u)} onNext={() => setStep("store")} />
      ) : null}

      {activeStep === "store" ? (
        <SectionStore ob={onboarding} onSave={(u) => saveBlock("store", u)} onNext={() => setStep("payroll")} />
      ) : null}

      {activeStep === "payroll" ? (
        <SectionPayroll ob={onboarding} onSave={(u) => saveBlock("payroll", u)} onNext={() => setStep("documents")} />
      ) : null}

      {activeStep === "documents" ? (
        <SectionDocs ob={onboarding} onAdd={addDoc} onFinish={() => setStep("complete")} />
      ) : null}

      {activeStep === "complete" ? (
        <div style={styles.card}>
          <h2 style={{ marginTop: 0 }}>Onboarding Complete ✅</h2>
          <p style={{ opacity: 0.75 }}>
            You can still edit steps or add documents.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={styles.btn} onClick={() => setStep("personal")}>Review</button>
            <Link style={styles.btnLink} to="/employees">Back to Employees</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionPersonal({ ob, onSave, onNext }) {
  const [dob, setDob] = useState(ob.personal?.dob || "");
  const [ssnLast4, setSsnLast4] = useState(ob.personal?.ssnLast4 || "");
  const [emergencyContact, setEmergencyContact] = useState(ob.personal?.emergencyContact || "");

  return (
    <div style={styles.card}>
      <h2 style={{ marginTop: 0 }}>Personal Info</h2>

      <div style={styles.grid2}>
        <Field label="Date of Birth" value={dob} onChange={setDob} placeholder="YYYY-MM-DD" />
        <Field label="SSN Last 4" value={ssnLast4} onChange={setSsnLast4} placeholder="1234" />
      </div>

      <Field label="Emergency Contact" value={emergencyContact} onChange={setEmergencyContact} placeholder="Name + phone" />

      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={() => onSave({ dob, ssnLast4, emergencyContact })}>
          Save
        </button>
        <button style={styles.btn} onClick={onNext}>Next → Address</button>
      </div>
    </div>
  );
}

function SectionAddress({ ob, onSave, onNext }) {
  const [line1, setLine1] = useState(ob.address?.line1 || "");
  const [line2, setLine2] = useState(ob.address?.line2 || "");
  const [city, setCity] = useState(ob.address?.city || "");
  const [state, setState] = useState(ob.address?.state || "");
  const [zip, setZip] = useState(ob.address?.zip || "");

  return (
    <div style={styles.card}>
      <h2 style={{ marginTop: 0 }}>Address</h2>

      <Field label="Line 1" value={line1} onChange={setLine1} />
      <Field label="Line 2" value={line2} onChange={setLine2} />

      <div style={styles.grid3}>
        <Field label="City" value={city} onChange={setCity} />
        <Field label="State" value={state} onChange={setState} />
        <Field label="ZIP" value={zip} onChange={setZip} />
      </div>

      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={() => onSave({ line1, line2, city, state, zip })}>
          Save
        </button>
        <button style={styles.btn} onClick={onNext}>Next → Store</button>
      </div>
    </div>
  );
}

function SectionStore({ ob, onSave, onNext }) {
  const [storeId, setStoreId] = useState(ob.store?.storeId || "");
  const [storeName, setStoreName] = useState(ob.store?.storeName || "");
  const [position, setPosition] = useState(ob.store?.position || "");
  const [startDate, setStartDate] = useState(ob.store?.startDate || "");

  return (
    <div style={styles.card}>
      <h2 style={{ marginTop: 0 }}>Store / Job</h2>

      <div style={styles.grid2}>
        <Field label="Store ID" value={storeId} onChange={setStoreId} />
        <Field label="Store Name" value={storeName} onChange={setStoreName} />
      </div>

      <div style={styles.grid2}>
        <Field label="Position" value={position} onChange={setPosition} />
        <Field label="Start Date" value={startDate} onChange={setStartDate} placeholder="YYYY-MM-DD" />
      </div>

      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={() => onSave({ storeId, storeName, position, startDate })}>
          Save
        </button>
        <button style={styles.btn} onClick={onNext}>Next → Payroll</button>
      </div>
    </div>
  );
}

function SectionPayroll({ ob, onSave, onNext }) {
  const [payType, setPayType] = useState(ob.payroll?.payType || "Hourly");
  const [rate, setRate] = useState(ob.payroll?.rate ?? 0);
  const [taxStatus, setTaxStatus] = useState(ob.payroll?.taxStatus || "");
  const [bankLast4, setBankLast4] = useState(ob.payroll?.bankLast4 || "");

  return (
    <div style={styles.card}>
      <h2 style={{ marginTop: 0 }}>Payroll</h2>

      <div style={styles.grid2}>
        <label style={styles.label}>
          Pay Type
          <select style={styles.input} value={payType} onChange={(e) => setPayType(e.target.value)}>
            <option value="Hourly">Hourly</option>
            <option value="Salary">Salary</option>
          </select>
        </label>

        <Field label={payType === "Salary" ? "Annual Salary" : "Hourly Rate"} value={String(rate)} onChange={(v) => setRate(Number(v || 0))} />
      </div>

      <div style={styles.grid2}>
        <Field label="Tax Status" value={taxStatus} onChange={setTaxStatus} placeholder="Single / Married ..." />
        <Field label="Bank Last 4" value={bankLast4} onChange={setBankLast4} placeholder="4321" />
      </div>

      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={() => onSave({ payType, rate, taxStatus, bankLast4 })}>
          Save
        </button>
        <button style={styles.btn} onClick={onNext}>Next → Documents</button>
      </div>
    </div>
  );
}

function SectionDocs({ ob, onAdd, onFinish }) {
  const docs = Array.isArray(ob.documents) ? ob.documents : [];

  const [name, setName] = useState("");
  const [type, setType] = useState("I-9");
  const [notes, setNotes] = useState("");

  const add = () => {
    if (!name.trim()) return alert("Document name required (example: I-9.pdf)");
    onAdd({ name: name.trim(), type, notes: notes.trim() });
    setName("");
    setNotes("");
  };

  return (
    <div style={styles.card}>
      <h2 style={{ marginTop: 0 }}>Supporting Documents</h2>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        This stores document metadata in db.json (file upload can be added later).
      </p>

      <div style={styles.docGrid}>
        <Field label="Document Name" value={name} onChange={setName} placeholder="I-9.pdf" />
        <label style={styles.label}>
          Type
          <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="I-9">I-9</option>
            <option value="W-4">W-4</option>
            <option value="ID">ID</option>
            <option value="DirectDeposit">Direct Deposit</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <Field label="Notes" value={notes} onChange={setNotes} placeholder="Signed / pending / verified..." />
        <button style={styles.primaryBtn} onClick={add}>Add Doc</button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {docs.length === 0 ? (
          <div style={{ opacity: 0.75 }}>No documents added yet.</div>
        ) : (
          docs.map((d) => (
            <div key={d.id} style={styles.docRow}>
              <div>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  Type: {d.type} • {d.notes || "—"} • {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : ""}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.actions}>
        <button style={styles.btn} onClick={onFinish}>Finish → Complete</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label style={styles.label}>
      {label}
      <input
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function tabBtn(active) {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: active ? "1px solid #111" : "1px solid #e5e7eb",
    background: active ? "#111" : "white",
    color: active ? "white" : "#111",
    cursor: "pointer",
  };
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = {
  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
  btnLink: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    textDecoration: "none",
    color: "#111",
    height: "fit-content",
  },
  progressWrap: { marginTop: 14 },
  progressBar: {
    height: 10,
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "white",
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: { height: "100%", background: "#111" },
  tabs: { display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },
  label: { display: "grid", gap: 6, fontSize: 13 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    background: "white",
  },
  grid2: { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" },
  grid3: { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  docGrid: { display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr 2fr auto", alignItems: "end" },
  docRow: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
  },
};
