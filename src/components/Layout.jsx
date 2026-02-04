import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

export default function Layout() {
  const user = useSelector((s) => s.auth?.user);
  const location = useLocation();

  // ✅ TEMP DEBUG: shows the exact path you're on
  console.log("CURRENT PATH:", location.pathname);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ padding: 24, background: "#f6f7fb" }}>
        <Outlet />
      </main>
    </div>
  );
}
