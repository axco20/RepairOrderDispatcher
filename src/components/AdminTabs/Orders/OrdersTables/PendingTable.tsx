"use client";

import React from 'react';
import { FileText, User } from 'lucide-react';
import { getPriorityLabel, getPriorityClass } from '../utils';

interface Order {
  id: string;
  description: string;
  orderDescription: string;
  priority: number;
}

interface PendingTableProps {
  pendingOrders: Order[];
  setSelectedOrder: (orderId: string) => void;
}

const PendingTable: React.FC<PendingTableProps> = ({ pendingOrders, setSelectedOrder }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{order.description}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{order.orderDescription}</div>
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
  );
};

export default PendingTable;