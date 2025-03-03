// src/components/Home.tsx
import React from 'react';
import { useAuth } from '../../../server/AuthContext';
import { useRepairOrders } from '../../context/RepairOrderContext';
import { Clock } from 'lucide-react';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    technicianOrders,
    technicianActiveOrderCount,
    canRequestNewOrder,
    pendingOrders,
  } = useRepairOrders();

  if (!currentUser) return null;

  // Gather data for the logged-in technician
  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter((order) => order.status === 'in_progress');
  const completedOrders = myOrders.filter((order) => order.status === 'completed');
  const activeOrderCount = technicianActiveOrderCount(currentUser.id);
  const canGetNewOrder = canRequestNewOrder(currentUser.id);

  return (
    <>
      {/* Status Card Row */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">Pending Orders</h3>
          <p className="text-4xl font-bold text-indigo-600 text-center">{pendingOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">In Progress</h3>
          <p className="text-4xl font-bold text-yellow-500 text-center">{activeOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">Completed</h3>
          <p className="text-4xl font-bold text-green-600 text-center">{completedOrders.length}</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
        {/* Warning banners */}
        {!canGetNewOrder && activeOrderCount >= 3 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <div className="flex">
              <Clock className="h-5 w-5 text-amber-500" />
              <div className="ml-3 text-sm text-amber-700">
                You have reached the maximum number of active orders (3). Complete at least one
                order before requesting a new one.
              </div>
            </div>
          </div>
        )}

        {!canGetNewOrder && activeOrderCount < 3 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <div className="flex">
              <Clock className="h-5 w-5 text-amber-500" />
              <div className="ml-3 text-sm text-amber-700">
                You need to wait 5 minutes after your last assignment before requesting a new order.
              </div>
            </div>
          </div>
        )}

        {/* 
          Active Orders & Completed Orders blocks removed here. 
          If you want to display *nothing*, just leave it blank or add your own content.
        */}
      </main>
    </>
  );
};

export default Home;
