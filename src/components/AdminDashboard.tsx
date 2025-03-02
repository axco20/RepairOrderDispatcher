import React, { useState } from 'react';
import { useRepairOrders } from '../context/RepairOrderContext';
import { RepairOrder, User } from '../types';
import { Plus, ArrowUp, ArrowDown, UserCheck } from 'lucide-react';

// Mock users for demo purposes
const MOCK_TECHNICIANS: User[] = [
  { id: '2', name: 'Tech 1', role: 'technician' },
  { id: '3', name: 'Tech 2', role: 'technician' },
  { id: '4', name: 'Tech 3', role: 'technician' },
];

const AdminDashboard: React.FC = () => {
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
  
  const [newOrderDescription, setNewOrderDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');

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

  return (
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
                {MOCK_TECHNICIANS.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({technicianActiveOrderCount(tech.id)} active orders)
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
                          {MOCK_TECHNICIANS.find(t => t.id === order.assignedTo)?.name || 'Unknown'}
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
                        {MOCK_TECHNICIANS.find(t => t.id === order.assignedTo)?.name || 'Unknown'}
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
  );
};

export default AdminDashboard;