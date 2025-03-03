import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TechnicianDashboard from './TechnicianDashboard';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Check role from user object
  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard />;
    case "technician":
      return <TechnicianDashboard />;
    default:
      return <p className="text-red-500 text-center">Unauthorized access</p>; // Handle unknown roles
  }
};

export default Dashboard;
