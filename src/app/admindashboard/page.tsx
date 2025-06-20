"use client"; // Needed for hooks in Next.js

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import AdminSidebar, { AdminPage } from '../../components/AdminSideBar';
import { useRealTimeUpdates } from "@/lib/useRealTimeOrders";
import RealTimeStatus from '@/components/RealTimeStatus';
import AdminHome from '../../components/AdminTabs/AdminHome';

// Import your tab components
import TeamMembers from '../../components/AdminTabs/TeamMembers';
import Queue from '../../components/AdminTabs/Queue';
import Orders from '../../components/AdminTabs/Orders';
import Performance from '../../components/AdminTabs/Performance';
import AdminHelp from '../../components/AdminTabs/AdminHelp';

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Get real-time connection status
  const { isConnected, error } = useRealTimeUpdates();

  // "Dashboard" is your default active tab/page
  const [activePage, setActivePage] = useState<AdminPage>('Dashboard');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    router.push("/loginpage"); // Redirect if not logged in
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar
        userName={user?.name || 'Admin User'}
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
