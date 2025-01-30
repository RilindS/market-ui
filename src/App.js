import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import LoginRegisterPage from "./pages/authentication/LoginAndRegisterPage";
import Unauthorized from "./pages/authentication/Unauthorized";

import PrivateRoute from "./routes/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/" element={<LoginRegisterPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/admin/*" element={<PrivateRoute roles={['ADMIN']} component={AdminLayout} />} />
        <Route path="/user/*" element={<PrivateRoute roles={['USER']} component={UserLayout} />} />
        {/* <Route path="/patient/*" element={<PrivateRoute roles={['PATIENT']} component={PatientLayout} />} />
        <Route path="/nurse/*" element={<PrivateRoute roles={['NURSE']} component={NurseLayout} />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
