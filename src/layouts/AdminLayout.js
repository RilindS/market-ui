import React from 'react';
import { Routes } from 'react-router-dom';
import { AdminRoutes } from '../routes/routesConfig';
import AdminSidebar from '../sidebar/AdminSidebar';
import generateRoutes from '../utils/generateRoutes';

import "./Layout.scss";

const AdminLayout = () => (
  <div className="layout">
    <AdminSidebar />
    <div className="content">
      <Routes>{generateRoutes(AdminRoutes)}</Routes>
    </div>
  </div>
);

export default AdminLayout;