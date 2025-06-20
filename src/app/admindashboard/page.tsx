"use client"; // Needed for hooks in Next.js

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import AdminSidebar, { AdminPage } from '../../components/AdminSideBar';
import { useRealTimeUpdates } from "@/lib/useRealTimeOrders";
import RealTimeStatus from '@/components/RealTimeStatus';

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

  // Get real-time connection status
  const { isConnected, error } = useRealTimeUpdates();

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
        {/* Header with real-time status */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            {activePage === 'Dashboard' && 'Admin Dashboard'}
            {activePage === 'Technicians' && 'Team Management'}
            {activePage === 'Queue' && 'Queue Management'}
            {activePage === 'Orders' && 'Repair Orders'}
            {activePage === 'Performance' && 'Performance Analytics'}
            {activePage === 'Help' && 'Help & Support'}
          </h1>
          <RealTimeStatus isConnected={isConnected} error={error} />
        </header>

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
