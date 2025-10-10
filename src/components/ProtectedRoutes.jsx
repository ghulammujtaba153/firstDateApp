import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

// A wrapper for private/protected routes
const ProtectedRoute = ({ redirectTo = "/login" }) => {
  const { user, loading } = useAuth();

  console.log("user in protected route",user);

  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    );
  }

  // If no user → redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }


  if(user.onboardingComlete == false) {
    return <Navigate to="/onboarding" replace />;
  }

  



  // Otherwise, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
