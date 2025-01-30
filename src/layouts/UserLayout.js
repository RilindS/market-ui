import React from 'react';
import { Routes } from 'react-router-dom';
import { UserRoutes } from '../routes/routesConfig';
import UserSidebar from '../sidebar/UserSidebar';
import generateRoutes from '../utils/generateRoutes';



import "./Layout.scss";

const UserLayout = () => (
  <div className="layout">
    <UserSidebar />
    <div className="content">
      <Routes>{generateRoutes(UserRoutes)}</Routes>
    </div>
  </div>
);

export default UserLayout;