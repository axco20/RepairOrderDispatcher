import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRepairOrders } from '../context/RepairOrderContext';
import AdminDashboard from './AdminDashboard';
import TechnicianDashboard from './TechnicianDashboard';

const Dashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { 
    pendingOrders, 
    inProgressOrders, 
    completedOrders 
  } = useRepairOrders();

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-indigo-600">{pendingOrders.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-amber-500">{inProgressOrders.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
        </div>
      </div>
      
      {isAdmin ? <AdminDashboard /> : <TechnicianDashboard />}
    </div>
  );
};

export default Dashboard;