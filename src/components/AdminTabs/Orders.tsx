"use client";

import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '@/context/RepairOrderContext';
import { supabase } from '@/lib/supabaseClient';
import Select from 'react-select';

import {
  Plus,
  Check,
  RefreshCw,
  FileText,
  Clock,
  AlertCircle,
  User,} from 'lucide-react';

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

// For react-select
interface TechnicianOption {
  value: string;
  label: string;
}

// Define priority types
type PriorityType = 'WAIT' | 'VALET' | 'LOANER';

export default function Orders() {
  // Bring in the repair order methods and data from context
  const {
    pendingOrders,
    inProgressOrders,
    completedOrders,
    addRepairOrder,
    reassignRepairOrder,
    returnToQueue,
    technicianActiveOrderCount,
  } = useRepairOrders();

  // State for storing technicians
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<TechnicianOption[]>([]);

  // State for new order form
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityType>('VALET');
  const [showAddForm, setShowAddForm] = useState(false);

  // State for reassigning
  const [selectedTechnicianOption, setSelectedTechnicianOption] = useState<TechnicianOption | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>('');

  // State for form feedback
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'pending' | 'inProgress' | 'completed'>('pending');

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
        
        // Create options for react-select
        const options = data.map(tech => ({
          value: tech.auth_id,
          label: `${tech.name} (${technicianActiveOrderCount(tech.auth_id)} active)`
        }));
        setTechnicianOptions(options);
      }
    };
    fetchTechnicians();
  }, [technicianActiveOrderCount]);

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

  // Reset form and feedback
  const resetForm = () => {
    setDescription('');
    setSelectedPriority('VALET');
    setFormError('');
  };

  // Add a new order with priority
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!description.trim()) {
      setFormError('Repair Order ID is required');
      return;
    }
    
    // Check for duplicate order ID
    const isDuplicate = pendingOrders.some(order => 
      order.description.trim() === description.trim()
    );
    
    if (isDuplicate) {
      setFormError('A repair order with this ID already exists');
      return;
    }

    // Calculate priority based on type
    const priorityValue = getPriorityValue(selectedPriority);
    
    // Add the order with the provided information
    addRepairOrder({ 
      description: description.trim(),
      priority: priorityValue,
      priorityType: selectedPriority
    });
    
    // Display success message
    setFormSuccess('Repair order added successfully');
    
    // Reset form
    resetForm();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setFormSuccess('');
    }, 3000);
  };

  // Reassign an order to a particular technician
  const handleReassign = () => {
    if (selectedOrder && selectedTechnicianOption) {
      reassignRepairOrder(selectedOrder, selectedTechnicianOption.value);
      setSelectedOrder('');
      setSelectedTechnicianOption(null);
    }
  };

  // Return an order to the queue
  const handleReturnToQueue = (orderId: string) => {
    returnToQueue(orderId);
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#374151',
      borderColor: '#4B5563',
      color: 'white',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#6366F1'
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#1F2937',
      color: 'white',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    option: (base: any, state: { isSelected: any; isFocused: any; }) => ({
      ...base,
      backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#374151' : '#1F2937',
      ':active': {
        backgroundColor: '#4F46E5'
      },
      color: 'white'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white'
    }),
    input: (base: any) => ({
      ...base,
      color: 'white'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9CA3AF'
    })
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Repair Orders</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:border-indigo-700 focus:ring focus:ring-indigo-200 active:bg-indigo-600 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Repair Order
        </button>
      </div>

      {/* Add new order form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden transition-all duration-300">
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-indigo-700">Create New Repair Order</h2>
          </div>
          
          <div className="p-6">
            {/* Error Message */}
            {formError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {formSuccess && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-700">{formSuccess}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Repair Order ID
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  placeholder="Enter repair order ID"
                />
              </div>
              
              {/* Priority Selection Dropdown */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Priority Level
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as PriorityType)}
                    className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="WAIT">WAIT (Highest Priority)</option>
                    <option value="VALET">VALET (Medium Priority)</option>
                    <option value="LOANER">LOANER (Lowest Priority)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                    text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm 
                    text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className={`bg-white rounded-lg shadow-md p-6 border-b-4 ${activeTab === 'pending' ? 'border-indigo-500' : 'border-transparent'} cursor-pointer transition-all hover:shadow-lg`}
          onClick={() => setActiveTab('pending')}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-gray-700 mb-1 font-semibold">Pending Orders</h3>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-indigo-600">{pendingOrders.length}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting assignment</p>
        </div>
        
        <div 
          className={`bg-white rounded-lg shadow-md p-6 border-b-4 ${activeTab === 'inProgress' ? 'border-yellow-500' : 'border-transparent'} cursor-pointer transition-all hover:shadow-lg`}
          onClick={() => setActiveTab('inProgress')}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-gray-700 mb-1 font-semibold">In Progress</h3>
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-yellow-500">{inProgressOrders.length}</p>
          <p className="text-sm text-gray-500 mt-1">Currently being worked on</p>
        </div>
        
        <div 
          className={`bg-white rounded-lg shadow-md p-6 border-b-4 ${activeTab === 'completed' ? 'border-green-500' : 'border-transparent'} cursor-pointer transition-all hover:shadow-lg`}
          onClick={() => setActiveTab('completed')}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-gray-700 mb-1 font-semibold">Completed</h3>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-green-600">{completedOrders.length}</p>
          <p className="text-sm text-gray-500 mt-1">Successfully finished</p>
        </div>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'inProgress'
                  ? 'text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
            </button>
          </nav>
        </div>
          
        <div className="overflow-x-auto">
          {/* Pending Orders Table */}
          {activeTab === 'pending' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repair Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No pending repair orders</p>
                        <p className="text-sm mt-1">Click &quot;Add Repair Order&quot; to create a new one</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(order.priority)}`}>
                          {getPriorityLabel(order.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <User className="h-3.5 w-3.5 mr-1" />
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* In Progress Orders Table */}
          {activeTab === 'inProgress' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repair Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inProgressOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Clock className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No in-progress repair orders</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inProgressOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm mr-2">
                            {getTechnicianName(order.assignedTo)[0]}
                          </div>
                          <div className="text-sm text-gray-900">{getTechnicianName(order.assignedTo)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(order.priority)}`}>
                          {getPriorityLabel(order.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => handleReturnToQueue(order.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          
          {/* Completed Orders Table */}
          {activeTab === 'completed' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repair Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Check className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No completed repair orders</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  completedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm mr-2">
                            {getTechnicianName(order.assignedTo)[0]}
                          </div>
                          <div className="text-sm text-gray-900">{getTechnicianName(order.assignedTo)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.completedAt ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {new Date(order.completedAt).toLocaleString()}
                            </div>
                          ) : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(order.priority)}`}>
                          {getPriorityLabel(order.priority)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Assignment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="fixed inset-0 " onClick={() => setSelectedOrder("")}></div>
          <div className="bg-[#1F2937] rounded-lg shadow-lg max-w-md w-full border border-gray-700 relative">
            {/* Header */}
            <div className="bg-[#111827] px-6 py-4 border-b border-gray-700 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Assign Technician</h3>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Technician Selection with react-select */}
              <div className="mb-4">
                <label htmlFor="technician-select" className="block text-sm font-medium text-gray-300 mb-1">
                  Select Technician
                </label>
                <Select
                  id="technician-select"
                  options={technicianOptions}
                  value={selectedTechnicianOption}
                  onChange={setSelectedTechnicianOption}
                  placeholder="Search for a technician..."
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                /><p className="mt-2 text-xs text-gray-400">
                Technicians can have up to{" "}
                <span className="text-indigo-400 font-semibold">3 active orders</span>{" "}
                at once.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder("")}
                className="px-4 py-2 border border-gray-500 rounded-md shadow-sm 
                  text-sm font-medium text-gray-300 bg-[#374151] hover:bg-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedTechnicianOption}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm 
                  text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                  disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}