import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/Authslice";

export default function TopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const handleSwitch = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header style={styles.bar}>
      <div style={{ fontWeight: 900 }}>HR Portal</div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {user?.name} • {user?.role}
            </div>
            <button style={styles.btn} onClick={handleSwitch} type="button">
              Switch account
            </button>
          </>
        ) : (
          <button style={styles.btn} onClick={() => navigate("/login")} type="button">
            Login
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  bar: {
    height: 52,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    background: "white",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  btn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
};
