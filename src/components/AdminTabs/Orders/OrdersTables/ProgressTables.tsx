"use client";

import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { getPriorityLabel, getPriorityClass } from '../utils';

interface Order {
  id: string;
  description: string;
  orderDescription: string;
  priority: number;
  assignedTo?: string;
}


interface ProgressTableProps {
  inProgressOrders: Order[];
  setSelectedOrder: (orderId: string) => void;
  handleReturnToQueue: (orderId: string) => void;
  getTechnicianName: (auth_id?: string) => string;
}

const ProgressTable: React.FC<ProgressTableProps> = ({ 
  inProgressOrders, 
  setSelectedOrder, 
  handleReturnToQueue,
  getTechnicianName
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{order.description}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{order.orderDescription}</div>
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
  );
};

export default ProgressTable;