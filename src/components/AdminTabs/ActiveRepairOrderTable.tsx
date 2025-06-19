"use client"; // Needed for hooks in Next.js

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, Zap, Tag } from "lucide-react";

// Define interfaces for type safety
interface RepairOrder {
  id: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  difficulty_level?: number;
  // Modified priority to accept more formats
  priority?: 'wait' | 'valet' | 'loaner' | number | string;
  createdAt: string;
  minutesElapsed?: number;
  isUrgent?: boolean;
  numericPriority?: number; // Added for sorting
}

interface User {
  id: string;
  role?: string;
  skill_level?: number;
}

interface ActiveRepairOrdersTableProps {
  repairOrders: RepairOrder[];
  currentUser?: User;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Helper function to calculate time elapsed in minutes
const getMinutesElapsed = (dateString: string): number => {
  const created = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
};

const PendingRepairOrdersTable: React.FC<ActiveRepairOrdersTableProps> = ({ repairOrders, currentUser }) => {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  
  // Update orders every minute to refresh the urgency indicators
  useEffect(() => {
    // Process orders and add urgency flag
    const processOrders = () => {
      // Filter based on current user's skill level if they are a technician
      let filteredOrders = [...repairOrders];
      
      if (currentUser && currentUser.role === 'technician') {
        const userSkillLevel = currentUser.skill_level || 1;
        // Technicians can only see orders with difficulty level <= their skill level
        filteredOrders = repairOrders.filter(order => 
          (order.difficulty_level || 1) <= userSkillLevel
        );
      }
      
      const processedOrders = filteredOrders
        .filter(order => order.status === 'pending') // Only show pending orders
        .map(order => {
          const minutesElapsed = getMinutesElapsed(order.createdAt);
          // Add urgency flag if order hasn't been picked up in 10 minutes
          const isUrgent = minutesElapsed >= 10;
          
          // Convert priority to numeric for consistent sorting
          let numericPriority = 1; // Default to highest priority (WAIT)
          
          if (typeof order.priority === 'number') {
            numericPriority = order.priority;
          } else if (typeof order.priority === 'string') {
            const priorityStr = order.priority.toLowerCase();
            if (priorityStr === 'wait' || priorityStr === '1') {
              numericPriority = 1;
            } else if (priorityStr === 'valet' || priorityStr === '2') {
              numericPriority = 2;
            } else if (priorityStr === 'loaner' || priorityStr === '3') {
              numericPriority = 3;
            }
          }
          
          return { ...order, minutesElapsed, isUrgent, numericPriority };
        })
        // Sort by priority first (1=WAIT → 2=VALET → 3=LOANER)
        // Then by urgency (urgent first)
        // Then by creation date (oldest first)
        .sort((a, b) => {
          // First sort by priority (1=WAIT, 2=VALET, 3=LOANER)
          if (a.numericPriority !== b.numericPriority) {
            return a.numericPriority - b.numericPriority;
          }
          
          // If same priority, sort by urgency
          if (a.isUrgent !== b.isUrgent) {
            return a.isUrgent ? -1 : 1; // Urgent orders first
          }
          
          // If same urgency, sort by creation date (oldest first)
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      
      setOrders(processedOrders);
    };
    
    // Process initially
    processOrders();
    
    // Set up interval to update every minute
    const interval = setInterval(processOrders, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [repairOrders, currentUser]);
  
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
  
  
  // Priority Badge component - Updated to match QueueManagement style
  const PriorityBadge: React.FC<{ priority?: string | number }> = ({ priority }) => {
    
    // Handle numeric priorities (similar to QueueManagement.tsx)
    if (typeof priority === 'number') {
      if (priority === 1) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Zap className="h-3 w-3 text-red-800 mr-1" />
            WAIT
          </span>
        );
      } else if (priority === 2) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Tag className="h-3 w-3 text-yellow-800 mr-1" />
            VALET
          </span>
        );
      } else if (priority === 3) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Clock className="h-3 w-3 text-green-800 mr-1" />
            LOANER
          </span>
        );
      }
    }
    
    // Handle string priorities (lowercase/uppercase handling)
    const priorityStr = typeof priority === 'string' ? priority.toLowerCase() : '';
    
    if (!priority) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Standard
        </span>
      );
    }
    
    if (priorityStr === 'wait' || priorityStr === '1') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Zap className="h-3 w-3 text-red-800 mr-1" />
          WAIT
        </span>
      );
    } else if (priorityStr === 'valet' || priorityStr === '2') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Tag className="h-3 w-3 text-yellow-800 mr-1" />
          VALET
        </span>
      );
    } else if (priorityStr === 'loaner' || priorityStr === '3') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Clock className="h-3 w-3 text-green-800 mr-1" />
          LOANER
        </span>
      );
    }
    
    // Display the raw priority value if it doesn't match expected values
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Standard
      </span>
    );
  };

  // Updated Urgency Indicator component
  const UrgencyIndicator: React.FC<{ minutes: number }> = ({ minutes }) => {
    // Format for hours and minutes when over 60 minutes
    const formatTime = (totalMinutes: number) => {
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    };

    if (minutes >= 60) {
      return (
        <span className="inline-flex items-center text-red-600 font-bold">
          <AlertTriangle className="w-4 h-4 mr-1" /> {formatTime(minutes)}
        </span>
      );
    } else if (minutes >= 30) {
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
  const EmptyState: React.FC = () => (
    <div className="text-center py-10">
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Clock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No orders awaiting dispatch</h3>
      <p className="mt-1 text-sm text-gray-500">
        {currentUser && currentUser.role === 'technician'
          ? `Orders awaiting dispatch matching your skill level (Level ${currentUser.skill_level || 1}) will appear here.`
          : 'Orders awaiting dispatch will appear here.'}
      </p>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <style>{blinkingStyle}</style>
      
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center">
            <Clock className="h-5 w-5 mr-2 text-amber-500" />
            Awaiting Dispatch
            {currentUser && currentUser.role === 'technician' && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Your skill level: Level {currentUser.skill_level || 1})
              </span>
            )}
          </h2>
          <span className="text-sm text-gray-500">
            {orders.length} orders awaiting dispatch
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
                  Priority
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
                    <PriorityBadge priority={order.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UrgencyIndicator minutes={order.minutesElapsed || 0} />
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

export default PendingRepairOrdersTable;