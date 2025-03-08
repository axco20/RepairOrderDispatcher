"use client";

import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { useRepairOrders } from '@/context/RepairOrderContext';
import { PriorityType, getPriorityValue } from './utils';

interface AddOrderFormProps {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ showAddForm, setShowAddForm }) => {
  const { pendingOrders, addRepairOrder } = useRepairOrders();

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

  if (!showAddForm) return null;

  return (
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
  );
};

export default AddOrderForm;