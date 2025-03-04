"use client"; // Needed for hooks in Next.js

import React from "react";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";

import AdminDashboard from "../components/AdminDashboard";
import TechnicianDashboard from "../components/TechnicianDashboard";

export default function Page() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginForm />;
  }

  return currentUser.role === "admin" ? <AdminDashboard /> : <TechnicianDashboard />;
}
