import React, { useState } from 'react';
import { useAuth } from '../../server/AuthContext';
import { useRepairOrders } from '../context/RepairOrderContext';
import { Clock, CheckCircle, Home, LogOut, HelpCircle } from 'lucide-react';

const TechnicianDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { 
    technicianOrders, 
    getNextRepairOrder, 
    completeRepairOrder,
    technicianActiveOrderCount,
    canRequestNewOrder,
    pendingOrders
  } = useRepairOrders();
  
  const [activePage, setActivePage] = useState('Dashboard');
  
  if (!currentUser) return null;
  
  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter(order => order.status === 'in_progress');
  const completedOrders = myOrders.filter(order => order.status === 'completed');
  const activeOrderCount = technicianActiveOrderCount(currentUser.id);
  const canGetNewOrder = canRequestNewOrder(currentUser.id);

  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col h-screen">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 bg-indigo-600">
          <h2 className="text-xl font-bold">Repair Order</h2>
          <p className="text-sm text-gray-300">Management System</p>
        </div>
        
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-700 flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="font-bold">
              {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'T1'}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-medium">{currentUser?.name}</p>
            <p className="text-xs text-gray-400">Technician</p>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2">
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Dashboard' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Dashboard')}
              >
                <Home size={18} />
                <span className="ml-3">Dashboard</span>
              </button>
            </li>
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'ActiveOrders' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('ActiveOrders')}
              >
                <span className="ml-3">My Active Orders</span>
                {activeOrders.length > 0 && (
                  <span className="ml-auto bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                    {activeOrders.length}
                  </span>
                )}
              </button>
            </li>
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'CompletedOrders' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('CompletedOrders')}
              >
                <CheckCircle size={18} />
                <span className="ml-3">Completed Orders</span>
              </button>
            </li>
          </ul>
          
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Help</p>
          </div>
          
          <ul className="p-2">
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Help' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Help')}
              >
                <HelpCircle size={18} />
                <span className="ml-3">Help & Support</span>
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="p-3 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-md hover:bg-gray-700 text-gray-300"
          >
            <LogOut size={18} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-indigo-600 text-white shadow">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Technician Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                Active Orders: <strong>{activeOrderCount}/3</strong>
              </span>
              <button
                onClick={getNextRepairOrder}
                disabled={!canGetNewOrder || pendingOrders.length === 0}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded text-sm disabled:bg-gray-500"
              >
                Get Next Repair Order
              </button>
            </div>
          </div>
        </header>
        
        {/* Status Card Header - ADDED THIS SECTION */}
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
        
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Warning Banners */}
          {!canGetNewOrder && activeOrderCount >= 3 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
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
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
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

          {/* My Active Repair Orders */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
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

          {/* My Completed Repair Orders */}
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
        </main>
      </div>
    </div>
  );
};

export default TechnicianDashboard;