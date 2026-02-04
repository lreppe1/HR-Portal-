import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { apiGet, apiPost } from "../api/client";

export default function EmployeeProfile() {
  const { user } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);

  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    gender: "MALE",
    dateOfBirth: "",
    maritalStatus: "SINGLE",
    nationality: "",
    contactDetails: {
      personalEmail: "",
      mobileNumber: "",
      emergencyContact: { name: "", relationship: "", phone: "" },
    },
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const emp = await apiGet(`/employees/${user.id}`);
        setEmployee(emp);

        // hydrate form from employee record
        setForm({
          employeeId: emp.employeeId || emp.id || "",
          firstName: emp.firstName || (emp.name ? emp.name.split(" ")[0] : "") || "",
          lastName:
            emp.lastName ||
            (emp.name ? emp.name.split(" ").slice(1).join(" ") : "") ||
            "",
          gender: emp.gender || "MALE",
          dateOfBirth: emp.dateOfBirth || "",
          maritalStatus: emp.maritalStatus || "SINGLE",
          nationality: emp.nationality || "",
          contactDetails: {
            personalEmail: emp.contactDetails?.personalEmail || emp.email || "",
            mobileNumber: emp.contactDetails?.mobileNumber || emp.phone || "",
            emergencyContact: {
              name: emp.contactDetails?.emergencyContact?.name || "",
              relationship: emp.contactDetails?.emergencyContact?.relationship || "",
              phone: emp.contactDetails?.emergencyContact?.phone || "",
            },
          },
        });
      } catch (e) {
        setErr("Could not load employee profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const updateContact = (k, v) =>
    setForm((p) => ({
      ...p,
      contactDetails: { ...(p.contactDetails || {}), [k]: v },
    }));

  const updateEmergency = (k, v) =>
    setForm((p) => ({
      ...p,
      contactDetails: {
        ...(p.contactDetails || {}),
        emergencyContact: { ...(p.contactDetails?.emergencyContact || {}), [k]: v },
      },
    }));

  const validation = useMemo(() => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required.";
    if (!form.lastName.trim()) errors.lastName = "Last name is required.";

    if (!form.contactDetails.personalEmail.trim())
      errors.personalEmail = "Personal email is required.";

    if (!form.contactDetails.mobileNumber.trim())
      errors.mobileNumber = "Mobile number is required.";

    return errors;
  }, [form]);

  const hasErrors = Object.keys(validation).length > 0;

  const onSubmitForApproval = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (hasErrors) {
      setErr("Please fix the highlighted fields.");
      return;
    }

    try {
      // We submit changes as a request for approval (NOT patching /employees directly)
      const payload = {
        id: `pc-${crypto.randomUUID?.() || Date.now()}`,
        employeeId: user.id,
        status: "PENDING",
        createdAt: Date.now(),
        // send the exact shape you asked for:
        changes: {
          employeeId: form.employeeId,
          firstName: form.firstName,
          lastName: form.lastName,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          maritalStatus: form.maritalStatus,
          nationality: form.nationality,
          contactDetails: form.contactDetails,
        },
      };

      await apiPost("/profileChanges", payload);

      setMsg("Submitted for approval ✅ (HR Admin must approve before it updates.)");
    } catch (e2) {
      setErr("Could not submit request. Is json-server running on :4000?");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading profile…</div>;
  if (err && !employee) return <div style={{ padding: 16, color: "#7a0000" }}>{err}</div>;

  return (
    <div style={{ padding: 16, maxWidth: 820 }}>
      <h1 style={{ marginTop: 0 }}>My Profile</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>
        Updates are submitted for HR approval.
      </p>

      <form onSubmit={onSubmitForApproval} style={card}>
        <h3 style={{ marginTop: 0 }}>Personal Information</h3>

        <div style={grid2}>
          <Field
            label="First name"
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
            error={validation.firstName}
          />
          <Field
            label="Last name"
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
            error={validation.lastName}
          />
        </div>

        <div style={grid3}>
          <SelectField
            label="Gender"
            value={form.gender}
            onChange={(v) => update("gender", v)}
            options={[
              { label: "MALE", value: "MALE" },
              { label: "FEMALE", value: "FEMALE" },
              { label: "OTHER", value: "OTHER" },
            ]}
          />
          <Field
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(v) => update("dateOfBirth", v)}
          />
          <SelectField
            label="Marital Status"
            value={form.maritalStatus}
            onChange={(v) => update("maritalStatus", v)}
            options={[
              { label: "SINGLE", value: "SINGLE" },
              { label: "MARRIED", value: "MARRIED" },
              { label: "DIVORCED", value: "DIVORCED" },
            ]}
          />
        </div>

        <Field
          label="Nationality"
          value={form.nationality}
          onChange={(v) => update("nationality", v)}
        />

        <hr style={hr} />

        <h3>Contact Details</h3>

        <div style={grid2}>
          <Field
            label="Personal Email"
            value={form.contactDetails.personalEmail}
            onChange={(v) => updateContact("personalEmail", v)}
            error={validation.personalEmail}
          />
          <Field
            label="Mobile Number"
            value={form.contactDetails.mobileNumber}
            onChange={(v) => updateContact("mobileNumber", v)}
            error={validation.mobileNumber}
          />
        </div>

        <h4 style={{ marginBottom: 6 }}>Emergency Contact</h4>

        <div style={grid3}>
          <Field
            label="Name"
            value={form.contactDetails.emergencyContact.name}
            onChange={(v) => updateEmergency("name", v)}
          />
          <Field
            label="Relationship"
            value={form.contactDetails.emergencyContact.relationship}
            onChange={(v) => updateEmergency("relationship", v)}
          />
          <Field
            label="Phone"
            value={form.contactDetails.emergencyContact.phone}
            onChange={(v) => updateEmergency("phone", v)}
          />
        </div>

        {err ? <div style={errorBox}>{err}</div> : null}
        {msg ? <div style={okBox}>{msg}</div> : null}

        <button type="submit" style={{ ...btn, opacity: hasErrors ? 0.8 : 1 }}>
          Submit changes for approval
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", error }) {
  return (
    <label style={{ display: "grid", gap: 6, fontWeight: 700 }}>
      {label}
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...input,
          borderColor: error ? "#ffb3b3" : "#d1d5db",
          background: error ? "#fff7f7" : "white",
        }}
      />
      {error ? <div style={{ color: "#7a0000", fontWeight: 600, fontSize: 13 }}>{error}</div> : null}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label style={{ display: "grid", gap: 6, fontWeight: 700 }}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={input}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const card = {
  marginTop: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "white",
  display: "grid",
  gap: 12,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 12,
};

const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "white",
  cursor: "pointer",
  width: "fit-content",
  fontWeight: 800,
};

const hr = { border: "none", borderTop: "1px solid #eee", margin: "6px 0" };

const errorBox = {
  padding: 10,
  borderRadius: 12,
  background: "#ffe7e7",
  border: "1px solid #ffb3b3",
  color: "#7a0000",
  fontWeight: 700,
};

const okBox = {
  padding: 10,
  borderRadius: 12,
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  color: "#065f46",
  fontWeight: 700,
};
