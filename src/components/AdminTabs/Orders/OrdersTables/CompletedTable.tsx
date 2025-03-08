"use client";

import React from 'react';
import { Check, Clock } from 'lucide-react';
import { getPriorityLabel, getPriorityClass } from '../utils';

interface Order {
  id: string;
  description: string;
  orderDescription: string;
  priority: number;
  assignedTo?: string;
  completedAt?: string;
}

interface CompletedTableProps {
  completedOrders: Order[];
  getTechnicianName: (auth_id?: string) => string;
}

const CompletedTable: React.FC<CompletedTableProps> = ({ completedOrders, getTechnicianName }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
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
  );
};

export default CompletedTable;