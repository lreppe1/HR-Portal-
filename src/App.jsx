import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateFromStorage } from "./redux/Authslice";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import LeaveRequests from "./pages/LeaveRequests";
import Payroll from "./pages/Payroll";
import ProfileUpdateRequests from "./pages/ProfileUpdateRequests";
import ProfileChangesAdmin from "./pages/ProfileChangesAdmin";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/leave" element={<LeaveRequests />} />
        <Route path="/profile-update" element={<ProfileUpdateRequests />} />
        <Route path="/profile-approvals" element={<ProfileChangesAdmin />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<div style={{ padding: 16 }}>404 - Not found</div>} />
      </Route>
    </Routes>
  );
}
