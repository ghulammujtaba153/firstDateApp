import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

// A wrapper for free/public routes (login, register, etc.)
// Redirects to dashboard if user is already authenticated
const FreeScreenProtectedRoutes = ({ redirectTo = "/home" }) => {
  const { user, loading } = useAuth();

  console.log("user in free screen route", user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    );
  }

  // If user exists, check onboarding status
  if (user) {
    // If onboarding is complete, redirect to dashboard
    if (user.onboardingComlete === true) {
      return <Navigate to="/home" replace />;
    }
    // If onboarding is not complete, redirect to onboarding
    return <Navigate to="/onboarding" replace />;
  }

  // Otherwise, render child routes (login, register, etc.)
  return <Outlet />;
};

export default FreeScreenProtectedRoutes;

