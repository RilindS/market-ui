// src/pages/admin/AdminLayout.js
import React from 'react';
import AdminSidebar from './AdminSidebar'; // Your sidebar component
import './AdminLayout.scss'; // Optional CSS for layout styling

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </div>
  );
};

export default AdminLayout;
