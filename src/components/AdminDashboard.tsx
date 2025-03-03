// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '../context/RepairOrderContext';
import { RepairOrder } from '../types';
import { useAuth } from '../../server/AuthContext';
import { supabase } from '../../server/supabaseClient';
import { Plus, ArrowUp, ArrowDown, UserCheck, Home, Users, FileText, BarChart2, Settings, HelpCircle, AlertTriangle, Clock, List, LogOut } from 'lucide-react';

// Define the Technician type based on your Supabase schema
interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const { currentUser, logout} = useAuth();
  
  const { 
    pendingOrders, 
    inProgressOrders, 
    completedOrders,
    addRepairOrder,
    reassignRepairOrder,
    returnToQueue,
    updatePriority,
    technicianActiveOrderCount
  } = useRepairOrders();
  
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [newOrderDescription, setNewOrderDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [activePage, setActivePage] = useState('Dashboard');

  // Fetch technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'technician');
      
      if (error) {
        console.error('Error fetching technicians:', error);
      } else if (data) {
        setTechnicians(data);
      }
    };

    fetchTechnicians();
  }, []);

  // Function to get technician name by auth_id
  const getTechnicianName = (auth_id?: string) => {
    if (!auth_id) return 'Unknown';
    const tech = technicians.find(t => t.auth_id === auth_id);
    return tech ? tech.name : 'Unknown';
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderDescription.trim()) {
      addRepairOrder({ description: newOrderDescription.trim() });
      setNewOrderDescription('');
      setShowAddForm(false);
    }
  };

  const handleReassign = () => {
    if (selectedOrder && selectedTechnician) {
      reassignRepairOrder(selectedOrder, selectedTechnician);
      setSelectedOrder('');
      setSelectedTechnician('');
    }
  };

  const handleReturnToQueue = (orderId: string) => {
    returnToQueue(orderId);
  };

  const handlePriorityChange = (order: RepairOrder, increase: boolean) => {
    const newPriority = increase 
      ? Math.max(1, order.priority - 1) 
      : order.priority + 1;
    updatePriority(order.id, newPriority);
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen w-full">
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
              {currentUser?.name ? getUserInitials(currentUser.name) : 'AU'}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-medium">{currentUser?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-400">Administrator</p>
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
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Technicians' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Technicians')}
              >
                <Users size={18} />
                <span className="ml-3">Technicians</span>
              </button>
            </li>
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Queue' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Queue')}
              >
                <List size={18} />
                <span className="ml-3">Queue Management</span>
              </button>
            </li>
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Orders' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Orders')}
              >
                <FileText size={18} />
                <span className="ml-3">All Repair Orders</span>
              </button>
            </li>
          </ul>
          
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reports</p>
          </div>
          
          <ul className="p-2">
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Performance' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Performance')}
              >
                <BarChart2 size={18} />
                <span className="ml-3">Performance</span>
              </button>
            </li>
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Turnaround' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Turnaround')}
              >
                <Clock size={18} />
                <span className="ml-3">Turnaround Time</span>
              </button>
            </li>
          </ul>
          
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
          </div>
          
          <ul className="p-2">
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Alerts' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Alerts')}
              >
                <AlertTriangle size={18} />
                <span className="ml-3">Alerts</span>
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
              </button>
            </li>
            <li className="mb-1">
              <button 
                className={`flex items-center w-full p-3 rounded-md ${activePage === 'Settings' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
                onClick={() => handleNavigate('Settings')}
              >
                <Settings size={18} />
                <span className="ml-3">Settings</span>
              </button>
            </li>
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
          <button onClick={logout} className="flex items-center w-full p-3 rounded-md hover:bg-gray-700 text-gray-300">
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
              <h1 className="text-xl font-bold">Repair Order Management</h1>
              <span className="mt-1 ml-3 px-2 py-1 text-xs bg-indigo-900 rounded">Admin</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Logged in as {currentUser?.name || 'Admin User'}</span>
            </div>
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">Pending Orders</h3>
              <p className="text-4xl font-bold text-indigo-600 text-center">{pendingOrders.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">In Progress</h3>
              <p className="text-4xl font-bold text-yellow-500 text-center">{inProgressOrders.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">Completed</h3>
              <p className="text-4xl font-bold text-green-600 text-center">{completedOrders.length}</p>
            </div>
          </div>

          {/* Admin Dashboard */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                <Plus size={16} />
                <span>Add Repair Order</span>
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Add New Repair Order</h3>
                <form onSubmit={handleAddOrder} className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newOrderDescription}
                      onChange={(e) => setNewOrderDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add Order
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h3 className="text-lg font-semibold p-4 border-b">Pending Repair Orders</h3>
              {pendingOrders.length === 0 ? (
                <p className="p-4 text-gray-500">No pending repair orders</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{order.priority}</span>
                              <div className="flex flex-col">
                                <button 
                                  onClick={() => handlePriorityChange(order, true)}
                                  className="text-gray-500 hover:text-indigo-600"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button 
                                  onClick={() => handlePriorityChange(order, false)}
                                  className="text-gray-500 hover:text-indigo-600"
                                >
                                  <ArrowDown size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{order.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setSelectedOrder(order.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Assign
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
              <h3 className="text-lg font-semibold p-4 border-b">In Progress Repair Orders</h3>
              {inProgressOrders.length === 0 ? (
                <p className="p-4 text-gray-500">No repair orders in progress</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
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
                      {inProgressOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{order.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <UserCheck size={16} className="text-indigo-500 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {getTechnicianName(order.assignedTo) || 'Unknown'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {order.assignedAt ? new Date(order.assignedAt).toLocaleString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleReturnToQueue(order.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Return to Queue
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
              <h3 className="text-lg font-semibold p-4 border-b">Completed Repair Orders</h3>
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
                          Completed By
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
                            <div className="text-sm font-medium text-gray-900">
                              {getTechnicianName(order.assignedTo) || 'Unknown'}
                            </div>
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
        </main>
      </div>

      {/* Modal for assigning orders */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Repair Order</h3>
            <div className="mb-4">
              <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-1">
                Select Technician
              </label>
              <select
                id="technician"
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a technician</option>
                {technicians.map(tech => (
                  <option key={tech.auth_id} value={tech.auth_id}>
                    {tech.name} ({technicianActiveOrderCount(tech.auth_id)} active orders)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedOrder('')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedTechnician}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;