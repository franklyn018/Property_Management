import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PaymentsPage from "./pages/admin/PaymentsPage";
import MessagesPage from "./pages/admin/MessagesPage";
import CashFlowPage from "./pages/admin/CashFlowPage";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cashflow"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CashFlowPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tenant"
          element={
            <ProtectedRoute allowedRoles={["tenant"]}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;