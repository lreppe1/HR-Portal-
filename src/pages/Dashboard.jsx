import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Card({ title, desc, onOpen }) {
  return (
    <div style={styles.card}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
      <div style={{ opacity: 0.75, marginTop: 4 }}>{desc}</div>
      <button onClick={onOpen} style={styles.btn}>
        Open
      </button>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const user = useSelector((s) => s.auth?.user);
  const isAdmin = user?.role === "admin";

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <div style={{ opacity: 0.8, marginBottom: 14 }}>
        Welcome, <strong>{user?.name || "User"}</strong> 👋
      </div>

      <div style={styles.grid}>
        <Card
          title="Leave Requests"
          desc="Submit a request and track approval status."
          onOpen={() => nav("/leave")} // ✅ MUST match App.jsx
        />

        <Card
          title="Payroll"
          desc="View payroll details."
          onOpen={() => nav("/payroll")} // ✅ MUST match App.jsx
        />

        {!isAdmin && (
          <Card
            title="Request Profile Update"
            desc="Submit a profile change request."
            onOpen={() => nav("/profile-update")} // ✅ MUST match App.jsx
          />
        )}

        {isAdmin && (
          <>
            <Card
              title="Employee Directory (Admin)"
              desc="Add/edit employees."
              onOpen={() => nav("/employees")} // ✅ MUST match App.jsx
            />

            <Card
              title="Profile Approvals"
              desc="Approve/deny profile update requests."
              onOpen={() => nav("/profile-approvals")} // ✅ MUST match App.jsx
            />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
    alignItems: "stretch",
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    display: "grid",
    gap: 10,
  },
  btn: {
    width: "fit-content",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
  },
};
