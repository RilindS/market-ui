import React from "react";
import { Route } from "react-router-dom";

const generateRoutes = (routes) => {
  return routes.map((route, index) => (
    <Route key={index} path={route.path} element={route.element} />
  ));
};

export default generateRoutes;
