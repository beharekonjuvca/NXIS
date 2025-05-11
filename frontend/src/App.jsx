import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout/Layout";
import NgoDashboard from "./components/NgoDashboard/NgoDashboard";
import { validateToken } from "./endpoints";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import NGOManagement from "./components/AdminDashboard/NGOManagement";
import VolunteerList from "./components/AdminDashboard/VolunteerList";
import VolunteerApplications from "./components/AdminDashboard/VolunteerApplications";
import PendingNGOs from "./components/AdminDashboard/PendingNGOs";
import Users from "./components/AdminDashboard/Users";
import ChangePassword from "./components/ChangePassword";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("userRole");
    setIsAuthenticated(!!token);
    setUserRole(storedRole);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const storedRole = localStorage.getItem("userRole");

      if (token) {
        try {
          await validateToken();
          setIsAuthenticated(true);
          setUserRole(storedRole);
        } catch (error) {
          localStorage.clear();
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogin = () => {
    checkAuth();
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userRole === "ngo" ? (
                <Navigate to="/ngo-dashboard" />
              ) : userRole === "admin" ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Layout>
                  <Dashboard onLogout={handleLogout} />
                </Layout>
              )
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              userRole === "ngo" ? (
                <Navigate to="/ngo-dashboard" />
              ) : userRole === "admin" ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Layout>
                <AuthForm onLoginSuccess={handleLogin} />
              </Layout>
            )
          }
        />

        <Route
          path="/ngo-dashboard"
          element={
            isAuthenticated && userRole === "ngo" ? (
              <Layout>
                <NgoDashboard onLogout={handleLogout} />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Layout>
                <AdminDashboard onLogout={handleLogout} />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/admin-dashboard/users"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Layout>
                <Users />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/admin-dashboard/ngos"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Layout>
                <NGOManagement />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/admin-dashboard/volunteers"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Layout>
                <VolunteerList />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/admin/volunteers/:id/applications"
          element={<VolunteerApplications />}
        />
        <Route
          path="/admin-dashboard/pending-ngos"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Layout>
                <PendingNGOs />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/change-password"
          element={
            isAuthenticated ? (
              <Layout>
                <ChangePassword />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
