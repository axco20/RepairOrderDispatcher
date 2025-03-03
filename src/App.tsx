import React from 'react';
import { useAuth } from '../server/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { AuthProvider } from '../server/AuthContext';
import { RepairOrderProvider } from './context/RepairOrderContext';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {currentUser ? (
        <>
          <Dashboard />
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
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