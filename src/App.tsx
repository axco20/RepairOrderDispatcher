import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { RepairOrderProvider } from './context/RepairOrderContext';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {currentUser ? (
        <>
          <Header />
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