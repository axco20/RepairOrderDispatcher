import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Repair Order Management</h1>
          <span className="bg-indigo-500 px-2 py-1 rounded text-xs">
            {isAdmin ? 'Admin' : 'Technician'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            Logged in as <strong>{currentUser.name}</strong>
          </span>
          
          <button 
            onClick={logout}
            className="flex items-center space-x-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;