import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSidebar from './pages/admin/AdminSidebar'; // Import the AdminSidebar component
import LoginRegisterPage from './pages/authentication/LoginAndRegisterPage';
import UserPage from './pages/user/UserPage';


const getRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
      return payload.role; // Extract the role
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
  return null;
};

const PrivateRoute = ({ children, allowedRole }) => {
  const role = getRoleFromToken();

  if (!role) {
    return <Navigate to="/" />; // Redirect to login if no role is found
  }
  if (role !== allowedRole) {
    return <Navigate to="/" />; // Redirect if the role doesn't match
  }
  return children; // Render the component if role matches
};

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginRegisterPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRole="ADMIN">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* User routes */}
        <Route
          path="/user/page"
          element={
            <PrivateRoute allowedRole="USER">
              <UserPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;