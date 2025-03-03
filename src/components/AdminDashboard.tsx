// src/components/AdminDashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../../server/AuthContext';
import AdminSidebar, { AdminPage } from './AdminSidebar';

// Import your tab components
import TeamMembers from './AdminTabs/TeamMembers';
import Queue from './AdminTabs/Queue';
import Orders from './AdminTabs/Orders';
import Performance from './AdminTabs/Performance';
import Turnaround from './AdminTabs/Turnaround';
import Alerts from './AdminTabs/Alerts';
import AdminSettings from './AdminTabs/AdminSettings';
import AdminHelp from './AdminTabs/AdminHelp';
import AdminHome from './AdminTabs/AdminHome';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  // "Dashboard" is your default active tab/page
  const [activePage, setActivePage] = useState<AdminPage>('Dashboard');

  if (!currentUser) return null;

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar
        userName={currentUser?.name || 'Admin User'}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={logout}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-indigo-600 text-white shadow">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Repair Order Management</h1>
              <span className="mt-1 ml-3 px-2 py-1 text-xs bg-indigo-900 rounded">
                Admin
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">
                Logged in as {currentUser?.name || 'Admin User'}
              </span>
            </div>
          </div>
        </header>

        {/* Render different main content depending on activePage */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {activePage === 'Dashboard' && <AdminHome />}
          {activePage === 'Technicians' && <TeamMembers />}
          {activePage === 'Queue' && <Queue />}
          {activePage === 'Orders' && <Orders />}
          {activePage === 'Performance' && <Performance />}
          {activePage === 'Turnaround' && <Turnaround />}
          {activePage === 'Alerts' && <Alerts />}
          {activePage === 'Settings' && <AdminSettings />}
          {activePage === 'Help' && <AdminHelp />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
