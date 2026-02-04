import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiGet } from "../api/client";

export default function Payroll() {
  const { user } = useSelector((s) => s.auth);

  const [stubs, setStubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        let data;

        // Admin sees all paystubs
        if (user.role === "admin") {
          data = await apiGet("/paystubs");
        } else {
          // Employee sees only theirs
          data = await apiGet(`/paystubs?employeeId=${user.id}`);
        }

        setStubs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Could not load paystubs.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return <div style={{ padding: 16 }}>Loading pay history…</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Payroll</h1>

      <p style={{ opacity: 0.75 }}>
        {user?.role === "admin"
          ? "Admin view – all employee paystubs"
          : "Your pay history"}
      </p>

      {error && <div style={styles.error}>{error}</div>}

      {stubs.length === 0 && (
        <div style={styles.empty}>No paystubs available.</div>
      )}

      <div style={styles.grid}>
        {stubs.map((s) => (
          <StubCard key={s.id} stub={s} user={user} />
        ))}
      </div>
    </div>
  );
}

function StubCard({ stub, user }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <strong>Pay Period:</strong> {stub.period}
      </div>

      <Row label="Pay Date" value={stub.payDate} />
      {user.role === "admin" && (
        <Row label="Employee ID" value={stub.employeeId} />
      )}

      <Row label="Gross" value={`$${stub.gross}`} />
      <Row label="Tax" value={`$${stub.tax}`} />
      <Row label="Net" value={`$${stub.net}`} />

      {stub.deductions?.length ? (
        <>
          <div style={styles.sub}>Deductions</div>
          {stub.deductions.map((d, i) => (
            <Row key={i} label={d.name} value={`$${d.amount}`} />
          ))}
        </>
      ) : null}

      <button style={styles.btn} onClick={() => alert("Pretend PDF download")}>
        View / Download
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={{ opacity: 0.75 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },

  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    background: "white",
    display: "grid",
    gap: 6,
  },

  header: {
    borderBottom: "1px solid #eee",
    paddingBottom: 6,
    marginBottom: 6,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
  },

  sub: {
    marginTop: 6,
    fontWeight: 700,
  },

  btn: {
    marginTop: 8,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },

  error: {
    padding: 10,
    borderRadius: 10,
    background: "#ffe7e7",
    border: "1px solid #ffb3b3",
    color: "#7a0000",
    marginBottom: 10,
  },

  empty: {
    padding: 12,
    opacity: 0.75,
  },
};
