import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { login } from "../redux/Authslice";

export default function Login() {
  const dispatch = useDispatch();

  const { isAuthenticated, error, loading } = useSelector((s) => s.auth);

  const [role, setRole] = useState("employee");
  const [email, setEmail] = useState("employee@company.com");
  const [password, setPassword] = useState("Employee123!");

  // ✅ FIX: useEffect instead of useMemo for side-effects
  useEffect(() => {
    if (role === "employee") {
      setEmail("employee@company.com");
      setPassword("Employee123!");
    } else {
      setEmail("admin@company.com");
      setPassword("Admin123!");
    }
  }, [role]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password, role }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ margin: 0 }}>Sign in</h1>
        <p style={{ marginTop: 6, opacity: 0.75 }}>
          Employee or HR Admin
        </p>

        <div style={styles.roleRow}>
          <button
            type="button"
            onClick={() => setRole("employee")}
            style={{
              ...styles.roleBtn,
              ...(role === "employee" ? styles.roleActive : {}),
            }}
          >
            Employee
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            style={{
              ...styles.roleBtn,
              ...(role === "admin" ? styles.roleActive : {}),
            }}
          >
            HR Admin
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? (
            <div style={styles.error}>{error}</div>
          ) : null}

          <button
            style={styles.primary}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Demo:
            <div>Employee → employee@company.com / Employee123!</div>
            <div>Admin → admin@company.com / Admin123!</div>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 52px)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    background: "#f6f7fb",
  },

  card: {
    width: "min(520px, 100%)",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 18,
  },

  roleRow: {
    display: "flex",
    gap: 10,
    margin: "12px 0",
  },

  roleBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    cursor: "pointer",
    fontWeight: 700,
  },

  roleActive: {
    background: "#111",
    color: "white",
    borderColor: "#111",
  },

  label: {
    display: "grid",
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
  },

  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
  },

  primary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  },

  error: {
    padding: 10,
    borderRadius: 12,
    background: "#ffe7e7",
    border: "1px solid #ffb3b3",
    color: "#7a0000",
  },
};
