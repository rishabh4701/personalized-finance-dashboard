import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";

// This wrapper handles the Navbar logic
function AppLayout({ children }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");
  
  // Define which paths should NOT show the navbar
  const hideNavbarOn = ["/", "/register"];
  const shouldShowNavbar = isAuthenticated && !hideNavbarOn.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
}

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <AppLayout>
      <Routes>
        {/* Public/Auth Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;