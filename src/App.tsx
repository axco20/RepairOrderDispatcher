import React from 'react';
import { useAuth } from '../server/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { AuthProvider } from '../server/AuthContext';
import { RepairOrderProvider } from './context/RepairOrderContext';
import AdminDashboard from './components/AdminDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';

function AppContent() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginForm />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <TechnicianDashboard />;
  }
}

function App() {
  return (
    <AuthProvider>
      <RepairOrderProvider>
        <AppContent />
      </RepairOrderProvider>
    </AuthProvider>
  );
}

export default App;