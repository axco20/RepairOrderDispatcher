"use client";

import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '@/context/RepairOrderContext';
import { supabase } from '@/lib/supabaseClient';
import { Plus } from 'lucide-react';

// Import components
import AddOrderForm from './Orders/AddOrderForm';
import OrdersStatusCards from './Orders/OrderStatusCards';
import OrdersTabs from './Orders/OrdersTabs';
import PendingTable from './Orders/OrdersTables/PendingTable';
import ProgressTable from './Orders/OrdersTables/ProgressTables';
import CompletedTable from './Orders/OrdersTables/CompletedTable';
import AssignModal from './Orders/AssignModal';

// Interface for technician data
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

export default function Orders() {
  // Bring in the repair order methods and data from context
  const {
    pendingOrders,
    inProgressOrders,
    completedOrders,
    reassignRepairOrder,
    returnToQueue,
    technicianActiveOrderCount,
  } = useRepairOrders();

  // State for storing technicians
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<TechnicianOption[]>([]);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'inProgress' | 'completed'>('pending');
  
  // State for reassigning
  const [selectedTechnicianOption, setSelectedTechnicianOption] = useState<TechnicianOption | null>(null);
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

  return (
    <div className="p-6">
      {/* Header section with title and add button */}
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
      <AddOrderForm showAddForm={showAddForm} setShowAddForm={setShowAddForm} />

      {/* Status Cards */}
      <OrdersStatusCards activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tables */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Tab Navigation */}
        <OrdersTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
        <div className="overflow-x-auto">
          {/* Render the appropriate table based on active tab */}
          {activeTab === 'pending' && (
            <PendingTable 
              pendingOrders={pendingOrders} 
              setSelectedOrder={setSelectedOrder}
            />
          )}

          {activeTab === 'inProgress' && (
            <ProgressTable 
              inProgressOrders={inProgressOrders}
              setSelectedOrder={setSelectedOrder}
              handleReturnToQueue={handleReturnToQueue}
              getTechnicianName={getTechnicianName}
            />
          )}
          
          {activeTab === 'completed' && (
            <CompletedTable 
              completedOrders={completedOrders}
              getTechnicianName={getTechnicianName}
            />
          )}
        </div>
      </div>
      
      {/* Assignment Modal */}
      <AssignModal 
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        selectedTechnicianOption={selectedTechnicianOption}
        setSelectedTechnicianOption={setSelectedTechnicianOption}
        technicianOptions={technicianOptions}
        handleReassign={handleReassign}
      />
    </div>
  );
}