"use client"; // Needed for hooks in Next.js

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import AdminSidebar, { AdminPage } from '../../components/AdminSideBar';

// Import your tab components
import TeamMembers from '../../components/AdminTabs/TeamMembers';
import Queue from '../../components/AdminTabs/Queue';
import Orders from '../../components/AdminTabs/Orders';
import Performance from '../../components/AdminTabs/Performance';
import AdminHelp from '../../components/AdminTabs/AdminHelp';
import AdminHome from '../../components/AdminTabs/AdminHome';


const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  // "Dashboard" is your default active tab/page
  const [activePage, setActivePage] = useState<AdminPage>('Dashboard');

  if (!currentUser) return null;

  // Define a logout function that also redirects to the landing page
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar
        userName={currentUser?.name || 'Admin User'}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout} // Use the new logout handler
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
