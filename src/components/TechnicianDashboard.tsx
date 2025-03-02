import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRepairOrders } from '../context/RepairOrderContext';
import { Clock, CheckCircle } from 'lucide-react';

const TechnicianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    technicianOrders, 
    getNextRepairOrder, 
    completeRepairOrder,
    technicianActiveOrderCount,
    canRequestNewOrder,
    pendingOrders
  } = useRepairOrders();
  
  if (!currentUser) return null;
  
  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter(order => order.status === 'in_progress');
  const completedOrders = myOrders.filter(order => order.status === 'completed');
  const activeOrderCount = technicianActiveOrderCount(currentUser.id);
  const canGetNewOrder = canRequestNewOrder(currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Technician Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Active Orders: <strong>{activeOrderCount}/3</strong>
          </span>
          <button
            onClick={getNextRepairOrder}
            disabled={!canGetNewOrder || pendingOrders.length === 0}
            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            <span>Get Next Repair Order</span>
          </button>
        </div>
      </div>

      {!canGetNewOrder && activeOrderCount >= 3 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                You have reached the maximum number of active orders (3). Complete at least one order before requesting a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {!canGetNewOrder && activeOrderCount < 3 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                You need to wait 5 minutes after your last assignment before requesting a new order.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">My Active Repair Orders</h3>
        {activeOrders.length === 0 ? (
          <p className="p-4 text-gray-500">No active repair orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.assignedAt ? new Date(order.assignedAt).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => completeRepairOrder(order.id)}
                        className="flex items-center text-green-600 hover:text-green-900"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Mark Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">My Completed Repair Orders</h3>
        {completedOrders.length === 0 ? (
          <p className="p-4 text-gray-500">No completed repair orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.completedAt ? new Date(order.completedAt).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;