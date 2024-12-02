import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.scss'; // Add styles here

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h2 className="sidebar-title">Admin Dashboard</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/admin/dashboard" activeClassName="active">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users" activeClassName="active">
              Manage Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/reports" activeClassName="active">
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/settings" activeClassName="active">
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/products" activeClassName="active">
              Products
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
