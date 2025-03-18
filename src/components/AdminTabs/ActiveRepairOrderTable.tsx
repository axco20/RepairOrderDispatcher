// Add this component to your AdminHome.jsx file

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle, ArrowRightCircle } from "lucide-react";

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Helper function to calculate time elapsed in minutes
const getMinutesElapsed = (dateString) => {
  const created = new Date(dateString);
  const now = new Date();
  return Math.floor((now - created) / (1000 * 60));
};

const ActiveRepairOrdersTable = ({ repairOrders }) => {
  const [orders, setOrders] = useState([]);
  
  // Update orders every minute to refresh the urgency indicators
  useEffect(() => {
    // Process orders and add urgency flag
    const processOrders = () => {
      const processedOrders = repairOrders
        .filter(order => order.status !== 'completed') // Only show non-completed orders
        .map(order => {
          const minutesElapsed = getMinutesElapsed(order.createdAt);
          // Add urgency flag if order hasn't been picked up in 10 minutes
          const isUrgent = order.status === 'pending' && minutesElapsed >= 10;
          return { ...order, minutesElapsed, isUrgent };
        })
        // Sort by urgency first, then by status (pending first), then by creation date
        .sort((a, b) => {
          if (a.isUrgent !== b.isUrgent) return b.isUrgent ? 1 : -1;
          if (a.status !== b.status) {
            if (a.status === 'pending') return -1;
            if (b.status === 'pending') return 1;
          }
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
      
      setOrders(processedOrders);
    };
    
    // Process initially
    processOrders();
    
    // Set up interval to update every minute
    const interval = setInterval(processOrders, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [repairOrders]);
  
  // CSS for blinking effect
  const blinkingStyle = `
    @keyframes blink {
      0% { background-color: rgba(239, 68, 68, 0.2); }
      50% { background-color: rgba(239, 68, 68, 0.5); }
      100% { background-color: rgba(239, 68, 68, 0.2); }
    }
    .urgent-row {
      animation: blink 1.5s infinite;
    }
  `;
  
  // Status badges
  const StatusBadge = ({ status }) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </span>
      );
    } else if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <ArrowRightCircle className="w-3 h-3 mr-1" /> In Progress
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Completed
        </span>
      );
    }
  };
  
  // Urgency indicator component
  const UrgencyIndicator = ({ minutes }) => {
    if (minutes >= 30) {
      return (
        <span className="inline-flex items-center text-red-600 font-bold">
          <AlertTriangle className="w-4 h-4 mr-1" /> {minutes}m
        </span>
      );
    } else if (minutes >= 10) {
      return (
        <span className="inline-flex items-center text-orange-500 font-medium">
          <Clock className="w-4 h-4 mr-1" /> {minutes}m
        </span>
      );
    } else {
      return <span className="text-gray-500">{minutes}m</span>;
    }
  };
  
  // EmptyState component when there are no orders
  const EmptyState = () => (
    <div className="text-center py-10">
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Clock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No active repair orders</h3>
      <p className="mt-1 text-sm text-gray-500">
        All pending repair orders will appear here.
      </p>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <style>{blinkingStyle}</style>
      
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Active Repair Orders
          </h2>
          <span className="text-sm text-gray-500">
            {orders.filter(o => o.status === 'pending').length} pending &bull; {orders.filter(o => o.status === 'in_progress').length} in progress
          </span>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wait Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`hover:bg-gray-50 ${order.isUrgent ? 'urgent-row' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.description || (order.id ? `#${order.id.slice(-6)}` : 'N/A')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UrgencyIndicator minutes={order.minutesElapsed} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveRepairOrdersTable;