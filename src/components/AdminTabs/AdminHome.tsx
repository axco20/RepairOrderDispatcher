// src/components/AdminTabs/AdminHome.tsx
import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '../../context/RepairOrderContext';
import { RepairOrder } from '../../types';
import { supabase } from '../../../server/supabaseClient';
import { useAuth } from '../../../server/AuthContext';
import {
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

const AdminHome: React.FC = () => {
  const { currentUser } = useAuth();

  // Bring in the repair order methods and data from context
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

  // State for storing technicians
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  // State for new order form
  const [newOrderDescription, setNewOrderDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // State for reassigning
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');

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

  // Helper to get a technician’s name by auth_id
  const getTechnicianName = (auth_id?: string) => {
    if (!auth_id) return 'Unknown';
    const tech = technicians.find((t) => t.auth_id === auth_id);
    return tech ? tech.name : 'Unknown';
  };

  // Add a new order
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderDescription.trim()) {
      addRepairOrder({ description: newOrderDescription.trim() });
      setNewOrderDescription('');
      setShowAddForm(false);
    }
  };

  // Reassign an order to a particular technician
  const handleReassign = () => {
    if (selectedOrder && selectedTechnician) {
      reassignRepairOrder(selectedOrder, selectedTechnician);
      setSelectedOrder('');
      setSelectedTechnician('');
    }
  };

  // Return an order to the queue
  const handleReturnToQueue = (orderId: string) => {
    returnToQueue(orderId);
  };

  // Increase or decrease priority
  const handlePriorityChange = (order: RepairOrder, increase: boolean) => {
    const newPriority = increase
      ? Math.max(1, order.priority - 1)
      : order.priority + 1;
    updatePriority(order.id, newPriority);
  };

  return (
    <div>
      {/* Summary Cards */}
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

      {/* Header Row: Title + "Add Order" Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
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
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Add New Repair Order</h3>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm 
                  text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/*
        ===========================
        PENDING ORDERS TABLE
        ===========================
      */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h3 className="text-lg font-semibold p-4 border-b">
          Pending Repair Orders
        </h3>
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-700">ID</th>
              <th className="px-4 py-2 font-medium text-gray-700">Description</th>
              <th className="px-4 py-2 font-medium text-gray-700">Priority</th>
              <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.description}</td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  <span>{order.priority}</span>
                  {/* Increase/Decrease Priority */}
                  <button onClick={() => handlePriorityChange(order, true)}>
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => handlePriorityChange(order, false)}>
                    <ArrowDown size={16} />
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setSelectedOrder(order.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Assign
                  </button>
                  {/* Return to Queue (in case you have that flow) */}
                  <button
                    onClick={() => handleReturnToQueue(order.id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*
        ===========================
        IN-PROGRESS ORDERS TABLE
        ===========================
      */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h3 className="text-lg font-semibold p-4 border-b">
          In Progress Repair Orders
        </h3>
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-700">ID</th>
              <th className="px-4 py-2 font-medium text-gray-700">Description</th>
              <th className="px-4 py-2 font-medium text-gray-700">Assigned To</th>
              <th className="px-4 py-2 font-medium text-gray-700">Priority</th>
              <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inProgressOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.description}</td>
                <td className="px-4 py-2">
                  {getTechnicianName(order.assignedTo)}
                </td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  <span>{order.priority}</span>
                  {/* Increase/Decrease Priority */}
                  <button onClick={() => handlePriorityChange(order, true)}>
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => handlePriorityChange(order, false)}>
                    <ArrowDown size={16} />
                  </button>
                </td>
                <td className="px-4 py-2">
                  {/* Reassign Button */}
                  <button
                    onClick={() => setSelectedOrder(order.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Reassign
                  </button>
                  {/* Return to Queue */}
                  <button
                    onClick={() => handleReturnToQueue(order.id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*
        ===========================
        COMPLETED ORDERS TABLE
        ===========================
      */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h3 className="text-lg font-semibold p-4 border-b">
          Completed Repair Orders
        </h3>
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-700">ID</th>
              <th className="px-4 py-2 font-medium text-gray-700">Description</th>
              <th className="px-4 py-2 font-medium text-gray-700">Assigned To</th>
              <th className="px-4 py-2 font-medium text-gray-700">Priority</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.description}</td>
                <td className="px-4 py-2">
                  {getTechnicianName(order.assignedTo)}
                </td>
                <td className="px-4 py-2">{order.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a technician</option>
                {technicians.map((tech) => (
                  <option key={tech.auth_id} value={tech.auth_id}>
                    {tech.name} ({technicianActiveOrderCount(tech.auth_id)} active)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedOrder('')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedTechnician}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm 
                  text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                  disabled:bg-gray-400"
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

export default AdminHome;
