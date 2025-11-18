import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

const UserRoutes = () => {
  const { user } = useAuth();

  // if user exists -> go to dashboard
  // if not -> go to login
  return user ? <Navigate to="/home" /> : <Navigate to="/login" />;
};

export default UserRoutes;
