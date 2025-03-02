import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '2', name: 'Tech 1', role: 'technician' },
  { id: '3', name: 'Tech 2', role: 'technician' },
  { id: '4', name: 'Tech 3', role: 'technician' },
];

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.id === selectedUser);
    if (user) {
      login(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Dealership Repair Order System
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
              Select User
            </label>
            <select
              id="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a user</option>
              {MOCK_USERS.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={!selectedUser}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;