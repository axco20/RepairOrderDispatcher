"use client"; // Needed for hooks in Next.js

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";
import AdminDashboard from "../components/AdminDashboard";
import TechnicianDashboard from "../components/TechnicianDashboard";
import LandingPage from "@/website/landingPage"; // Import the landing page component

export default function Page() {
  const { currentUser } = useAuth();
  const [showingLandingPage, setShowingLandingPage] = useState(!currentUser);

  // Show login form if requested from landing page
  const handleShowLogin = () => {
    setShowingLandingPage(false);
  };

  // If no user is logged in
  if (!currentUser) {
    // Show landing page or login form based on state
    return showingLandingPage ? (
      <LandingPage onLogin={handleShowLogin} onSignup={function (): void {
        throw new Error("Function not implemented.");
      } } />
    ) : (
      <LoginForm />
    );
  }

  // If user is logged in, show the appropriate dashboard
  return currentUser.role === "admin" ? <AdminDashboard /> : <TechnicianDashboard />;
}