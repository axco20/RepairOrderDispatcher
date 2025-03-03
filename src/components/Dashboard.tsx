import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TechnicianDashboard from './TechnicianDashboard';

const Dashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return null;
    return isAdmin ? <AdminDashboard /> : <TechnicianDashboard />;
};

export default Dashboard;