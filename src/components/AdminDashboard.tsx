// src/components/AdminDashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar, { AdminPage } from './AdminSideBar';

// Import your tab components
import TeamMembers from './AdminTabs/TeamMembers';
import Queue from './AdminTabs/Queue';
import Orders from './AdminTabs/Orders';
import Performance from './AdminTabs/Performance';
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
        

        {/* Render different main content depending on activePage */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {activePage === 'Dashboard' && <AdminHome />}
          {activePage === 'Technicians' && <TeamMembers />}
          {activePage === 'Queue' && <Queue />}
          {activePage === 'Orders' && <Orders />}
          {activePage === 'Performance' && <Performance />}
          {activePage === 'Help' && <AdminHelp />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;