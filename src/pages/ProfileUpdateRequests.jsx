// src/pages/ProfileUpdateRequests.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiGet, apiPost } from "../api/client";

export default function ProfileUpdateRequests() {
  const user = useSelector((s) => s.auth?.user);

  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        setErr("");
        const emp = await apiGet(`/employees/${user.id}`);

        // ✅ Build request payload to match db.json structure
        setForm({
          firstName: emp?.firstName ?? "",
          lastName: emp?.lastName ?? "",
          gender: emp?.gender ?? "",
          dateOfBirth: emp?.dateOfBirth ?? "",
          maritalStatus: emp?.maritalStatus ?? "",
          nationality: emp?.nationality ?? "",

          phone: emp?.phone ?? "",
          address: {
            line1: emp?.address?.line1 ?? "",
            city: emp?.address?.city ?? "",
            state: emp?.address?.state ?? "",
            zip: emp?.address?.zip ?? "",
          },

          contactDetails: {
            personalEmail: emp?.contactDetails?.personalEmail ?? "",
            mobileNumber: emp?.contactDetails?.mobileNumber ?? "",
            emergencyContact: {
              name: emp?.contactDetails?.emergencyContact?.name ?? "",
              relationship: emp?.contactDetails?.emergencyContact?.relationship ?? "",
              phone: emp?.contactDetails?.emergencyContact?.phone ?? "",
            },
          },
        });
      } catch {
        setErr("Could not load profile. Make sure json-server is running on http://localhost:4000");
      }
    })();
  }, [user?.id]);

  if (!user?.id) return <div style={{ padding: 16 }}>Please log in.</div>;
  if (!form) return <div style={{ padding: 16 }}>Loading…</div>;

  // Safe deep clone helper (works in older browsers)
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const update = (path, value) => {
    setForm((prev) => {
      const next = deepClone(prev);
      const keys = path.split(".");
      let obj = next;

      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = obj[keys[i]] ?? {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      await apiPost("/profileChangeRequests", {
        id: `pcr-${Date.now()}`, // ✅ string ids match db.json style (pcr-1)
        employeeId: user.id,
        employeeName: user.name ?? `${form.firstName} ${form.lastName}`.trim(),
        employeeEmail: user.email ?? form.contactDetails.personalEmail ?? "",

        status: "pending", // ✅ must match db.json casing

        requestedChanges: form,

        decisionNote: "",
        reviewedBy: null,
        reviewedAt: null,

        createdAt: Date.now(),
      });

      setMsg("Request submitted ✅ Waiting for admin approval.");
    } catch {
      setErr("Could not submit request. Is json-server running and does db.json include profileChangeRequests?");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1 style={{ marginTop: 0 }}>Request Profile Update</h1>
      <p style={{ opacity: 0.8 }}>
        Update your profile details below. HR must approve before changes are applied.
      </p>

      {err ? <div style={styles.error}>{err}</div> : null}
      {msg ? <div style={styles.ok}>{msg}</div> : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={styles.grid2}>
          <label style={styles.label}>
            First Name
            <input
              style={styles.input}
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </label>

          <label style={styles.label}>
            Last Name
            <input
              style={styles.input}
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </label>
        </div>

        <div style={styles.grid2}>
          <label style={styles.label}>
            Gender
            <select
              style={styles.input}
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Select</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="OTHER">OTHER</option>
              <option value="UNSPECIFIED">UNSPECIFIED</option>
            </select>
          </label>

          <label style={styles.label}>
            Date of Birth
            <input
              type="date"
              style={styles.input}
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </label>
        </div>

        <div style={styles.grid2}>
          <label style={styles.label}>
            Marital Status
            <select
              style={styles.input}
              value={form.maritalStatus}
              onChange={(e) => update("maritalStatus", e.target.value)}
            >
              <option value="">Select</option>
              <option value="SINGLE">SINGLE</option>
              <option value="MARRIED">MARRIED</option>
              <option value="DIVORCED">DIVORCED</option>
            </select>
          </label>

          <label style={styles.label}>
            Nationality
            <input
              style={styles.input}
              value={form.nationality}
              onChange={(e) => update("nationality", e.target.value)}
            />
          </label>
        </div>

        <h3 style={{ margin: "14px 0 0" }}>Phone & Address</h3>

        <div style={styles.grid2}>
          <label style={styles.label}>
            Phone
            <input
              style={styles.input}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>

          <label style={styles.label}>
            Address Line 1
            <input
              style={styles.input}
              value={form.address.line1}
              onChange={(e) => update("address.line1", e.target.value)}
            />
          </label>
        </div>

        <div style={styles.grid3}>
          <label style={styles.label}>
            City
            <input
              style={styles.input}
              value={form.address.city}
              onChange={(e) => update("address.city", e.target.value)}
            />
          </label>

          <label style={styles.label}>
            State
            <input
              style={styles.input}
              value={form.address.state}
              onChange={(e) => update("address.state", e.target.value)}
            />
          </label>

          <label style={styles.label}>
            ZIP
            <input
              style={styles.input}
              value={form.address.zip}
              onChange={(e) => update("address.zip", e.target.value)}
            />
          </label>
        </div>

        <h3 style={{ margin: "14px 0 0" }}>Contact Details</h3>

        <div style={styles.grid2}>
          <label style={styles.label}>
            Personal Email
            <input
              style={styles.input}
              value={form.contactDetails.personalEmail}
              onChange={(e) => update("contactDetails.personalEmail", e.target.value)}
            />
          </label>

          <label style={styles.label}>
            Mobile Number
            <input
              style={styles.input}
              value={form.contactDetails.mobileNumber}
              onChange={(e) => update("contactDetails.mobileNumber", e.target.value)}
            />
          </label>
        </div>

        <h3 style={{ margin: "14px 0 0" }}>Emergency Contact</h3>

        <div style={styles.grid3}>
          <label style={styles.label}>
            Name
            <input
              style={styles.input}
              value={form.contactDetails.emergencyContact.name}
              onChange={(e) => update("contactDetails.emergencyContact.name", e.target.value)}
            />
          </label>

          <label style={styles.label}>
            Relationship
            <input
              style={styles.input}
              value={form.contactDetails.emergencyContact.relationship}
              onChange={(e) =>
                update("contactDetails.emergencyContact.relationship", e.target.value)
              }
            />
          </label>

          <label style={styles.label}>
            Phone
            <input
              style={styles.input}
              value={form.contactDetails.emergencyContact.phone}
              onChange={(e) => update("contactDetails.emergencyContact.phone", e.target.value)}
            />
          </label>
        </div>

        <button style={styles.btn} type="submit">
          Submit Request for Approval
        </button>
      </form>
    </div>
  );
}

const styles = {
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
  label: { display: "grid", gap: 6, fontWeight: 800 },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "white",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "white",
    cursor: "pointer",
    width: "fit-content",
    fontWeight: 900,
  },
  error: {
    padding: 12,
    borderRadius: 12,
    background: "#ffe7e7",
    border: "1px solid #ffb3b3",
    color: "#7a0000",
    marginBottom: 10,
  },
  ok: {
    padding: 12,
    borderRadius: 12,
    background: "#eaffea",
    border: "1px solid #b5ffb5",
    color: "#045b04",
    marginBottom: 10,
  },
};
