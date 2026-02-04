import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/Authslice";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "16px 14px",
  borderRadius: 14,
  marginBottom: 10,
  background: isActive ? "#111" : "white",
  color: isActive ? "white" : "#111",
  textDecoration: "none",
  border: isActive ? "1px solid #111" : "1px solid #e5e7eb",
  fontWeight: 800,
});

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth?.user);

  const onLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <aside style={{ padding: 16, background: "#fff", borderRight: "1px solid #e5e7eb" }}>
      <div
        style={{
          padding: 14,
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>{user?.name || "User"}</div>
        <div style={{ opacity: 0.7 }}>{user?.role || ""}</div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Log out
        </button>
      </div>

      <NavLink to="/dashboard" style={linkStyle}>
        Dashboard
      </NavLink>

      <NavLink to="/employees" style={linkStyle}>
        Employees
      </NavLink>

      <NavLink to="/leave" style={linkStyle}>
        Leave Requests
      </NavLink>

      <NavLink to="/payroll" style={linkStyle}>
        Payroll
      </NavLink>

      <NavLink to="/profile-update" style={linkStyle}>
        Request Profile Update
      </NavLink>

      {user?.role === "admin" && (
        <NavLink to="/profile-approvals" style={linkStyle}>
          Profile Approvals
        </NavLink>
      )}
    </aside>
  );
}
