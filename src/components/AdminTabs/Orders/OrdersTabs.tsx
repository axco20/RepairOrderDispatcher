"use client";

import React from 'react';

type TabType = 'pending' | 'inProgress' | 'completed';

interface OrdersTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const OrdersTabs: React.FC<OrdersTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default OrdersTabs;