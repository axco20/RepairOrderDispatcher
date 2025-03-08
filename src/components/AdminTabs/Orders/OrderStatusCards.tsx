"use client";

import React from 'react';
import { FileText, Clock, Check } from 'lucide-react';
import { useRepairOrders } from '@/context/RepairOrderContext';

interface OrdersStatusCardsProps {
  activeTab: 'pending' | 'inProgress' | 'completed';
  setActiveTab: (tab: 'pending' | 'inProgress' | 'completed') => void;
}

const OrdersStatusCards: React.FC<OrdersStatusCardsProps> = ({ activeTab, setActiveTab }) => {
  const { pendingOrders, inProgressOrders, completedOrders } = useRepairOrders();

  return (
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
  );
};

export default OrdersStatusCards;