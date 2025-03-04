"use client";

import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '@/context/RepairOrderContext';
import { 
  Menu,
  AlertCircle,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Tag,
  Clock,
  Zap,
  GripVertical
} from 'lucide-react';
import { RepairOrder } from '@/schemas';


// Define the interface for a priority config item
interface PriorityConfigItem {
  label: string;
  color: string;
  icon: React.ReactNode;
}

// Define the type for the priority config object with an index signature
type PriorityConfigType = {
  [key: number]: PriorityConfigItem;
  1: PriorityConfigItem;
  2: PriorityConfigItem;
  3: PriorityConfigItem;
};

// Priority labels and colors with proper typing
const PRIORITY_CONFIG: PriorityConfigType = {
  1: { label: 'WAIT', color: 'bg-red-100 text-red-800', icon: <Zap className="h-3 w-3 text-red-800" /> },
  2: { label: 'VALET', color: 'bg-yellow-100 text-yellow-800', icon: <Tag className="h-3 w-3 text-yellow-800" /> },
  3: { label: 'LOANER', color: 'bg-green-100 text-green-800', icon: <Clock className="h-3 w-3 text-green-800" /> }
};


const QueueManagement: React.FC = () => {
  const { 
    pendingOrders, 
    updatePriority, 
    inProgressOrders, 
    completedOrders,
    addRepairOrder 
  } = useRepairOrders();
  
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [dragOverOrder, setDragOverOrder] = useState<string | null>(null);
  const [ordersByPriority, setOrdersByPriority] = useState<Record<number, RepairOrder[]>>({});
  const [expandedPriorities, setExpandedPriorities] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true
  });
  
  // Group orders by priority
  useEffect(() => {
    const grouped: Record<number, RepairOrder[]> = {};
    
    // Initialize empty arrays for all priority levels
    [1, 2, 3].forEach(priority => {
      grouped[priority] = [];
    });
    
    // Group orders by priority
    pendingOrders.forEach(order => {
      if (grouped[order.priority]) {
        grouped[order.priority].push(order);
      } else {
        grouped[order.priority] = [order];
      }
    });
    
    // Sort orders within each priority group by creation date
    Object.keys(grouped).forEach(priority => {
      grouped[Number(priority)].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
    
    setOrdersByPriority(grouped);
  }, [pendingOrders]);
  
  // Toggle section expansion
  const toggleSection = (priority: number) => {
    setExpandedPriorities(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
    setDraggedOrder(orderId);
    // For better drag visual effect
    if (e.currentTarget.classList) {
      setTimeout(() => {
        e.currentTarget.classList.add('opacity-50');
      }, 0);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedOrder(null);
    setDragOverOrder(null);
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('opacity-50');
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, orderId: string) => {
    e.preventDefault();
    if (draggedOrder !== orderId) {
      setDragOverOrder(orderId);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent, targetOrderId: string, targetPriority: number) => {
    e.preventDefault();
    const sourceOrderId = e.dataTransfer.getData('text/plain');
    
    if (sourceOrderId === targetOrderId) return;
    
    // Find the source order
    const sourceOrder = pendingOrders.find(order => order.id === sourceOrderId);
    if (!sourceOrder) return;
    
    // Find the target order
    const targetOrder = pendingOrders.find(order => order.id === targetOrderId);
    if (!targetOrder) return;
    
    // If dropping to a different priority group, change the priority
    if (sourceOrder.priority !== targetPriority) {
      updatePriority(sourceOrderId, targetPriority);
      return;
    }
    
    // If dropping within the same priority group, reorder by adjusting priorities
    const ordersInSamePriority = ordersByPriority[targetPriority];
    const sourceIndex = ordersInSamePriority.findIndex(o => o.id === sourceOrderId);
    const targetIndex = ordersInSamePriority.findIndex(o => o.id === targetOrderId);
    
    // Remove source from array
    const newOrder = [...ordersInSamePriority];
    const [movedItem] = newOrder.splice(sourceIndex, 1);
    
    // Insert at new position
    newOrder.splice(targetIndex, 0, movedItem);
    
    // Update all orders with new priority values
    // This would require a more sophisticated implementation in a real app
    // For now, just update the source priority to match target
    updatePriority(sourceOrderId, targetPriority);
  };
  
  // Handle dropping onto a priority section
  const handleDropOnSection = (e: React.DragEvent, targetPriority: number) => {
    e.preventDefault();
    const sourceOrderId = e.dataTransfer.getData('text/plain');
    
    // Find the source order
    const sourceOrder = pendingOrders.find(order => order.id === sourceOrderId);
    if (!sourceOrder) return;
    
    // If dropping to a different priority group, change the priority
    if (sourceOrder.priority !== targetPriority) {
      updatePriority(sourceOrderId, targetPriority);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Queue Management</h1>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <Menu className="mr-2 h-5 w-5 text-indigo-600" />
            Queue Overview
          </h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">Pending</p>
              <p className="text-xl font-bold text-indigo-600">{pendingOrders.length}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">In Progress</p>
              <p className="text-xl font-bold text-yellow-500">{inProgressOrders.length}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">Completed</p>
              <p className="text-xl font-bold text-green-600">{completedOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Organize repair orders in the queue by dragging and dropping them. Higher priority orders will be assigned to technicians first.
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Priority Sections */}
        {Object.entries(ordersByPriority).sort((a, b) => Number(a[0]) - Number(b[0])).map(([priority, orders]) => {
          const priorityNum = Number(priority);
          const config = PRIORITY_CONFIG[priorityNum] || {
            label: 'Unknown', 
            color: 'bg-gray-100 text-gray-800',
            icon: null
          };
          
          return (
            <div 
              key={priority}
              className="bg-white rounded-lg shadow overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnSection(e, priorityNum)}
            >
              <div 
                className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center ${config.color} bg-opacity-20`}
              >
                <button
                  onClick={() => toggleSection(priorityNum)}
                  className="flex items-center font-semibold focus:outline-none w-full text-left"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${config.color}`}>
                    {config.icon}
                  </div>
                  {config.label} Priority
                  <span className="ml-2 bg-white bg-opacity-70 rounded-full px-2 py-0.5 text-xs">
                    {orders.length}
                  </span>
                  <span className="ml-auto">
                    {expandedPriorities[priorityNum] ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </span>
                </button>
              </div>
              
              {expandedPriorities[priorityNum] && (
                <div className="p-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No orders with {config.label} priority</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.map((order, index) => (
                        <div
                          key={order.id}
                          className={`border rounded-md p-3 ${
                            dragOverOrder === order.id 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 bg-white'
                          } ${
                            draggedOrder === order.id ? 'opacity-50' : ''
                          } transition-all duration-200 cursor-move`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, order.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, order.id)}
                          onDrop={(e) => handleDrop(e, order.id, priorityNum)}
                        >
                          <div className="flex items-center">
                            <GripVertical className="h-5 w-5 text-gray-400 cursor-move mr-2" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {order.description}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {order.id.substring(0, 8)}...
                              </div>
                            </div>
                            <div className="flex space-x-2 items-center">
                              <span className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              <div className="relative">
                                <button 
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="bg-white rounded-lg shadow mt-6 p-4">
        <p className="text-sm text-gray-500">
          <strong>Note:</strong> Orders are dispatched to technicians based on their priority level (WAIT → VALET → LOANER) and then by the time they were added to the queue.
        </p>
      </div>
    </div>
  );
};

export default QueueManagement;