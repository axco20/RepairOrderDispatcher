import React, { useState } from 'react';
import { useAuth } from '../../server/AuthContext';
import { useRepairOrders } from '../context/RepairOrderContext';
import TechSidebar from './TechSidebar'; 
import Home from './TechnicianTabs/Home'; 
import ActiveOrders from './TechnicianTabs/ActiveOrders';
import CompletedOrders from './TechnicianTabs/CompletedOrders';
import Help from './TechnicianTabs/Help';



const TechnicianDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { 
    technicianOrders, 
  } = useRepairOrders();
  
  // Tracks which 'page' is active in the main content area
  const [activePage, setActivePage] = useState<'Home' | 'ActiveOrders' | 'CompletedOrders' | 'Help'>('Home');
  
  if (!currentUser) return null;

  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter(order => order.status === 'in_progress');

  const handleLogout = () => {
    if (logout) logout();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TechSidebar
        userName={currentUser.name}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        activeOrdersCount={activeOrders.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-indigo-600 text-white shadow">
        </header>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100">
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {activePage === 'Home' && (
            <div>
              <Home />
            </div>
          )}

          {activePage === 'ActiveOrders' && (
            <div>
              <ActiveOrders/>
            </div>
          )}

          {activePage === 'CompletedOrders' && (
            <div>
              <CompletedOrders/>
            </div>
          )}

          {activePage === 'Help' && (
            <div>
              <Help/>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
