"use client"; // Needed for hooks in Next.js

import React from "react";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";
import AdminDashboard from "@/app/admindashboard/page";
import TechnicianDashboard from "@/app/techniciandashboard/page";

export default function Page() {
  const { currentUser } = useAuth();

  // If no user is logged in
  if (!currentUser) {
    return <LoginForm />;
  }

  // If user is logged in, show the appropriate dashboard
  return currentUser.role === "admin" ? <AdminDashboard /> : <TechnicianDashboard />;
}