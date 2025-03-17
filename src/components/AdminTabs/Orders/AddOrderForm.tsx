"use client";

import React, { useState } from 'react';
import { AlertCircle, Check, PlusCircle } from 'lucide-react';
import { useRepairOrders } from '@/context/RepairOrderContext';
import { PriorityType, getPriorityValue } from './utils';

type TabType = 'pending' | 'inProgress' | 'completed';

interface AddOrderFormProps {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ showAddForm, setShowAddForm }) => {
  const { pendingOrders, addRepairOrder } = useRepairOrders();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  // State for new order form
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityType>('VALET');
  const [orderDescription, setOrderDescription] = useState('');
  
  // State for form feedback
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Reset form and feedback
  const resetForm = () => {
    setDescription('');
    setOrderDescription('');
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
      orderDescription: orderDescription,
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

  return (
    <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden transition-all duration-300">
      {/* Tab Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <nav className="flex justify-between items-center">
          <div className="flex">
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
          </div>
          <div className="pr-4">
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Order
              </button>
            )}
          </div>
        </nav>
      </div>
      
      {/* Form or Content based on state */}
      {showAddForm ? (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Repair Order</h2>
          
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

            <div>
              <label
                htmlFor="orderDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order Description
              </label>
              <input
                id="orderDescription"
                type="text"
                value={orderDescription}
                onChange={(e) => setOrderDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter repair order description"
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
            
            <div className="flex justify-end space-x-2 pt-2">
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
      ) : (
        <div className="p-6">
          {/* Content for each tab will go here */}
          {activeTab === 'pending' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Orders</h3>
              <p className="text-gray-500 max-w-md mb-6">
                There are currently no pending repair orders. Click the "Add Order" button to create a new one.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Orderawddddddddddddddddddd
              </button>
            </div>
          )}
          
          {activeTab === 'inProgress' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Orders In Progress</h3>
              <p className="text-gray-500 max-w-md">
                There are currently no repair orders in progress. Orders will appear here once technicians start working on them.
              </p>
            </div>
          )}
          
          {activeTab === 'completed' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Completed Orders</h3>
              <p className="text-gray-500 max-w-md">
                There are currently no completed repair orders. Finished repairs will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddOrderForm;