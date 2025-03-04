// src/components/AdminTabs/AdminHome.tsx
import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '../../context/RepairOrderContext';
import { RepairOrder } from '../../types';
import { supabase } from '@/lib/supabaseClient';
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

// Define priority types
type PriorityType = 'WAIT' | 'VALET' | 'LOANER';

const AdminHome: React.FC = () => {

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
  const [repairOrderId, setRepairOrderId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityType>('VALET');
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

  // Helper to get a technician's name by auth_id
  const getTechnicianName = (auth_id?: string) => {
    if (!auth_id) return 'Unknown';
    const tech = technicians.find((t) => t.auth_id === auth_id);
    return tech ? tech.name : 'Unknown';
  };

  // Get priority numeric value based on type
  const getPriorityValue = (priorityType: PriorityType): number => {
    switch (priorityType) {
      case 'WAIT': return 1;
      case 'VALET': return 2;
      case 'LOANER': return 3;
      default: return 2; // Default to medium priority
    }
  };

  // Get priority label for display
  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'WAIT';
      case 2: return 'VALET';
      case 3: return 'LOANER';
      default: return 'VALET';
    }
  };

  // Get CSS class for priority label
  const getPriorityClass = (priority: number): string => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800'; // High priority - WAIT
      case 2: return 'bg-yellow-100 text-yellow-800'; // Medium priority - VALET
      case 3: return 'bg-green-100 text-green-800'; // Low priority - LOANER
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add a new order with priority
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (repairOrderId.trim()) {
      // Calculate priority based on type
      const priorityValue = getPriorityValue(selectedPriority);
      
      // Add the order with the description as the repair order ID and the calculated priority
      addRepairOrder({ 
        description: repairOrderId.trim(),
        priority: priorityValue,
        priorityType: selectedPriority
      });
      
      // Reset form
      setRepairOrderId('');
      setSelectedPriority('VALET');
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
    // Get current priority
    const currentPriority = order.priority;
    
    // Calculate new priority
    let newPriority: number;
    if (increase) {
      // Limit to highest priority (1 = WAIT)
      newPriority = Math.max(1, currentPriority - 1);
    } else {
      // Limit to lowest priority (3 = LOANER)
      newPriority = Math.min(3, currentPriority + 1);
    }
    
    // Only update if changed
    if (newPriority !== currentPriority) {
      updatePriority(order.id, newPriority);
    }
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

      {/* Add new order form - UPDATED */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Add New Repair Order</h3>
          <form onSubmit={handleAddOrder} className="space-y-4">
            <div>
              <label
                htmlFor="repairOrderId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Repair Order ID
              </label>
              <input
                id="repairOrderId"
                type="text"
                value={repairOrderId}
                onChange={(e) => setRepairOrderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {/* Priority Selection Dropdown - NEW */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Priority Level
              </label>
              <select
                id="priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as PriorityType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="WAIT">WAIT (Highest Priority)</option>
                <option value="VALET">VALET (Medium Priority)</option>
                <option value="LOANER">LOANER (Lowest Priority)</option>
              </select>
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
        PENDING ORDERS TABLE - UPDATED to show priority type
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
              <th className="px-4 py-2 font-medium text-gray-700">Repair Order ID</th>
              <th className="px-4 py-2 font-medium text-gray-700">Priority</th>
              <th className="px-4 py-2 font-medium text-gray-700">Priority Type</th>
              <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.id.substring(0, 8)}...</td>
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(order.priority)}`}>
                    {getPriorityLabel(order.priority)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setSelectedOrder(order.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Assign
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