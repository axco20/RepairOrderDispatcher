// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '../context/RepairOrderContext';
import { RepairOrder } from '../types';
import { useAuth } from '../../server/AuthContext';
import { supabase } from '../../server/supabaseClient';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  UserCheck 
} from 'lucide-react';

import AdminSidebar, { AdminPage } from './AdminSidebar'; // <-- Import your new sidebar

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    pendingOrders,
    inProgressOrders,
    completedOrders,
    addRepairOrder,
    reassignRepairOrder,
    returnToQueue,
    updatePriority,
    technicianActiveOrderCount,
  } = useRepairOrders();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [newOrderDescription, setNewOrderDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');

  // Here we define the same union-based state for which page is active
  const [activePage, setActivePage] = useState<AdminPage>('Dashboard');

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

  if (!currentUser) return null;

  const getTechnicianName = (auth_id?: string) => {
    if (!auth_id) return 'Unknown';
    const tech = technicians.find((t) => t.auth_id === auth_id);
    return tech ? tech.name : 'Unknown';
  };

  const getUserInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  /** Add a new order */
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderDescription.trim()) {
      addRepairOrder({ description: newOrderDescription.trim() });
      setNewOrderDescription('');
      setShowAddForm(false);
    }
  };

  /** Reassign an order to a particular technician */
  const handleReassign = () => {
    if (selectedOrder && selectedTechnician) {
      reassignRepairOrder(selectedOrder, selectedTechnician);
      setSelectedOrder('');
      setSelectedTechnician('');
    }
  };

  /** Return an order to the queue */
  const handleReturnToQueue = (orderId: string) => {
    returnToQueue(orderId);
  };

  /** Increase or decrease priority */
  const handlePriorityChange = (order: RepairOrder, increase: boolean) => {
    const newPriority = increase
      ? Math.max(1, order.priority - 1)
      : order.priority + 1;
    updatePriority(order.id, newPriority);
  };

  return (
    <div className="flex h-screen w-full">
      
      <AdminSidebar
        userName={currentUser?.name || 'Admin User'}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={logout}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-indigo-600 text-white shadow">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Repair Order Management</h1>
              <span className="mt-1 ml-3 px-2 py-1 text-xs bg-indigo-900 rounded">Admin</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">
                Logged in as {currentUser?.name || 'Admin User'}
              </span>
            </div>
          </div>
        </header>

        {/* Render different main content depending on activePage */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {activePage === 'Dashboard' && (
            <>
              {/* The summary cards and Admin Dashboard area */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">
                    Pending Orders
                  </h3>
                  <p className="text-4xl font-bold text-indigo-600 text-center">
                    {pendingOrders.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">
                    In Progress
                  </h3>
                  <p className="text-4xl font-bold text-yellow-500 text-center">
                    {inProgressOrders.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">
                    Completed
                  </h3>
                  <p className="text-4xl font-bold text-green-600 text-center">
                    {completedOrders.length}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Admin Dashboard
                  </h2>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                  >
                    <Plus size={16} />
                    <span>Add Repair Order</span>
                  </button>
                </div>

                {/* Add new order form */}
                {showAddForm && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Add New Repair Order
                    </h3>
                    <form onSubmit={handleAddOrder} className="space-y-4">
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
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

                {/* Pending Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <h3 className="text-lg font-semibold p-4 border-b">
                    Pending Repair Orders
                  </h3>
                  {/* ...pendingOrders table code... */}
                  {/* You can keep the same table you had. */}
                </div>

                {/* In Progress Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <h3 className="text-lg font-semibold p-4 border-b">
                    In Progress Repair Orders
                  </h3>
                  {/* ...inProgressOrders table code... */}
                </div>

                {/* Completed Orders */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <h3 className="text-lg font-semibold p-4 border-b">
                    Completed Repair Orders
                  </h3>
                  {/* ...completedOrders table code... */}
                </div>
              </div>
            </>
          )}

          {/* If you want to show placeholders for the other pages */}
          {activePage === 'Technicians' && (
            <h2 className="text-xl font-bold">Technicians Page</h2>
          )}

          {activePage === 'Queue' && (
            <h2 className="text-xl font-bold">Queue Management Page</h2>
          )}

          {activePage === 'Orders' && (
            <h2 className="text-xl font-bold">All Repair Orders Page</h2>
          )}

          {activePage === 'Performance' && (
            <h2 className="text-xl font-bold">Performance Reports</h2>
          )}

          {activePage === 'Turnaround' && (
            <h2 className="text-xl font-bold">Turnaround Time Page</h2>
          )}

          {activePage === 'Alerts' && (
            <h2 className="text-xl font-bold">Alerts Page</h2>
          )}

          {activePage === 'Settings' && (
            <h2 className="text-xl font-bold">Settings Page</h2>
          )}

          {activePage === 'Help' && (
            <h2 className="text-xl font-bold">Help & Support Page</h2>
          )}
        </main>
      </div>

      {/* Modal for assigning orders */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Repair Order</h3>
            <div className="mb-4">
              <label
                htmlFor="technician"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Technician
              </label>
              <select
                id="technician"
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a technician</option>
                {technicians.map((tech) => (
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
