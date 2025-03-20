"use client";

import React, { useState, useEffect } from 'react';
import { useRepairOrders } from '@/context/RepairOrderContext';
import { 
  Menu,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Tag,
  Clock,
  Zap,
  GripVertical,
  MoveVertical,
  BarChart2
} from 'lucide-react';
import { RepairOrder } from '@/types/repairOrder';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabaseClient';

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

// Difficulty level config
const DIFFICULTY_CONFIG: {
  [key: number]: { label: string; color: string; }
} = {
  1: { label: 'Basic', color: 'bg-green-100 text-green-800' },
  2: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  3: { label: 'Advanced', color: 'bg-red-100 text-red-800' }
};

const QueueManagement: React.FC = () => {
  const { 
    repairOrders,
    pendingOrders, 
    updatePriority, 
    updateOrderPosition,
    updateRepairOrder,
    inProgressOrders, 
    completedOrders,
    refreshOrders
  } = useRepairOrders();
  
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [dragOverOrder, setDragOverOrder] = useState<string | null>(null);
  const [ordersByPriority, setOrdersByPriority] = useState<Record<number, RepairOrder[]>>({
    1: [], 2: [], 3: []
  });
  const [expandedPriorities, setExpandedPriorities] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true
  });
  const [isEditingDifficulty, setIsEditingDifficulty] = useState<string | null>(null);
  const [newDifficultyLevel, setNewDifficultyLevel] = useState<number>(1);
  const [isEditingPriority, setIsEditingPriority] = useState<string | null>(null);
  const [newPriorityLevel, setNewPriorityLevel] = useState<number>(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  
  // For auto-scrolling during drag
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Ref for detecting clicks outside the menu
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  // Load data on component mount
  useEffect(() => {
    refreshOrders();
  }, []);
  
  // Clean up auto-scroll interval on unmount
  useEffect(() => {
    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, [scrollInterval]);
  
  // Group orders by priority
  useEffect(() => {
    if (!pendingOrders) return; // Guard against undefined
    
    const grouped: Record<number, RepairOrder[]> = {};
    
    // Initialize empty arrays for all priority levels
    [1, 2, 3].forEach(priority => {
      grouped[priority] = [];
    });
    
    // Group orders by priority
    pendingOrders.forEach(order => {
      const priority = order.priority || 1;
      if (grouped[priority]) {
        grouped[priority].push(order);
      } else {
        grouped[priority] = [order];
      }
    });
    
    // Sort orders by creation date
    Object.keys(grouped).forEach(priority => {
      grouped[Number(priority)].sort((a, b) => {
        // Sort by creation date
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
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
    // Clear any auto-scrolling
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
    setAutoScrolling(false);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, orderId: string) => {
    e.preventDefault();
    if (draggedOrder !== orderId) {
      setDragOverOrder(orderId);
    }
    
    // Auto-scrolling logic
    const { clientY } = e;
    const scrollThreshold = 100; // Pixels from top/bottom edge to trigger scrolling
    const scrollSpeed = 10; // Pixels to scroll per interval
    const scrollStep = 5; // How many pixels to scroll in each step
    
    const viewportHeight = window.innerHeight;
    const isNearTop = clientY < scrollThreshold;
    const isNearBottom = clientY > viewportHeight - scrollThreshold;
    
    // Clear any existing interval
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
    
    // Set up new auto-scrolling if needed
    if (isNearTop || isNearBottom) {
      if (!autoScrolling) {
        const interval = setInterval(() => {
          if (isNearTop) {
            window.scrollBy(0, -scrollStep);
          } else if (isNearBottom) {
            window.scrollBy(0, scrollStep);
          }
        }, scrollSpeed);
        
        setScrollInterval(interval);
        setAutoScrolling(true);
      }
    } else {
      setAutoScrolling(false);
    }
  };
  
  // Handle drop event
  const handleDrop = async (e: React.DragEvent, targetOrderId: string, targetPriority: number) => {
    e.preventDefault();
    const sourceOrderId = e.dataTransfer.getData('text/plain');
    
    if (sourceOrderId === targetOrderId) return;
    
    try {
      // Find the source order
      const sourceOrder = pendingOrders.find(order => order.id === sourceOrderId);
      if (!sourceOrder) {
        console.error("Source order not found", sourceOrderId);
        return;
      }
      
      // Find the target order
      const targetOrder = pendingOrders.find(order => order.id === targetOrderId);
      if (!targetOrder) {
        console.error("Target order not found", targetOrderId);
        return;
      }
      
      // If dropping to a different priority group, change the priority
      if (sourceOrder.priority !== targetPriority) {
        console.log(`Moving order ${sourceOrderId} to priority ${targetPriority}`);
        const success = await updatePriority(sourceOrderId, targetPriority);
        if (success) {
          toast.success(`Moved order to ${PRIORITY_CONFIG[targetPriority].label} priority`);
        } else {
          toast.error("Failed to update priority");
        }
        return;
      }
      
      // If dropping within the same priority group, reorder
      if (sourceOrder.priority === targetOrder.priority) {
        console.log(`Reordering: moving ${sourceOrderId} before/after ${targetOrderId}`);
        const success = await updateOrderPosition(sourceOrderId, targetOrderId);
        if (success) {
          toast.success("Order position updated");
          // Refresh to get the updated order
          await refreshOrders();
        } else {
          toast.error("Failed to update order position");
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      toast.error("Error updating order");
    }
  };
  
  // Move order up in the list - will appear earlier in the queue
  const moveOrderUp = async (orderId: string, priorityLevel: number) => {
    try {
      const orders = ordersByPriority[priorityLevel];
      const index = orders.findIndex(order => order.id === orderId);
      
      if (index <= 0) return; // Already at the top
      
      const targetOrderId = orders[index - 1].id;
      console.log(`Moving order ${orderId} up before ${targetOrderId}`);
      
      const success = await updateOrderPosition(orderId, targetOrderId);
      
      if (success) {
        toast.success("Moved order up");
        await refreshOrders(); // Refresh to get updated order
      } else {
        toast.error("Failed to move order");
      }
    } catch (error) {
      console.error("Error moving order up:", error);
      toast.error("Error updating order");
    }
  };
  
  // Move order down in the list - will appear later in the queue
  const moveOrderDown = async (orderId: string, priorityLevel: number) => {
    try {
      const orders = ordersByPriority[priorityLevel];
      const index = orders.findIndex(order => order.id === orderId);
      
      if (index === -1 || index >= orders.length - 1) return; // Already at the bottom
      
      const targetOrderId = orders[index + 1].id;
      console.log(`Moving order ${orderId} down after ${targetOrderId}`);
      
      // Get the order after the target, if it exists
      const afterTargetId = index + 2 < orders.length ? orders[index + 2].id : null;
      
      if (afterTargetId) {
        // If there's an order after the target, move to before that one
        const success = await updateOrderPosition(orderId, afterTargetId);
        if (success) {
          toast.success("Moved order down");
          await refreshOrders();
        } else {
          toast.error("Failed to move order");
        }
      } else {
        // If it's the last order, we need to move it to be created at a later time
        const currentOrder = orders[index];
        const targetOrder = orders[index + 1];
        
        // Create a timestamp 1 minute after the last item
        const targetTime = new Date(targetOrder.createdAt).getTime();
        const newTime = new Date(targetTime + 60000).toISOString();
        
        const { error } = await supabase
          .from('repair_orders')
          .update({ 
            created_at: newTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentOrder.id);
        
        if (error) {
          console.error(`Failed to update created_at for order ${currentOrder.id}:`, error);
          toast.error("Failed to move order");
        } else {
          toast.success("Moved order down");
          await refreshOrders();
        }
      }
    } catch (error) {
      console.error("Error moving order down:", error);
      toast.error("Error updating order");
    }
  };
  
  // Handle dropping onto a priority section
  const handleDropOnSection = async (e: React.DragEvent, targetPriority: number) => {
    e.preventDefault();
    const sourceOrderId = e.dataTransfer.getData('text/plain');
    
    try {
      // Find the source order
      const sourceOrder = pendingOrders.find(order => order.id === sourceOrderId);
      if (!sourceOrder) return;
      
      // If dropping to a different priority group, change the priority
      if (sourceOrder.priority !== targetPriority) {
        const success = await updatePriority(sourceOrderId, targetPriority);
        if (success) {
          toast.success(`Moved order to ${PRIORITY_CONFIG[targetPriority].label} priority`);
        } else {
          toast.error("Failed to update priority");
        }
      }
    } catch (error) {
      console.error("Error handling drop on section:", error);
      toast.error("Error updating order");
    }
  };

  // Start editing difficulty level
  const handleEditDifficulty = (orderId: string, currentLevel: number = 1) => {
    setIsEditingDifficulty(orderId);
    setNewDifficultyLevel(currentLevel);
    // Close any other edit mode
    setIsEditingPriority(null);
  };

  // Save difficulty level changes
  const handleSaveDifficulty = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('repair_orders')
        .update({ 
          difficulty_level: newDifficultyLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error("Error updating difficulty level:", error);
        toast.error("Failed to update difficulty level");
      } else {
        toast.success(`Updated difficulty level to ${DIFFICULTY_CONFIG[newDifficultyLevel].label}`);
        await refreshOrders();
      }
    } catch (err) {
      console.error("Error saving difficulty:", err);
      toast.error("Error updating difficulty level");
    } finally {
      setIsEditingDifficulty(null);
    }
  };

  // Start editing priority level
  const handleEditPriority = (orderId: string, currentPriority: number = 1) => {
    setIsEditingPriority(orderId);
    setNewPriorityLevel(currentPriority);
    // Close any other edit mode
    setIsEditingDifficulty(null);
  };

  // Save priority level changes
  const handleSavePriority = async (orderId: string) => {
    try {
      const success = await updatePriority(orderId, newPriorityLevel);
      if (success) {
        toast.success(`Updated priority to ${PRIORITY_CONFIG[newPriorityLevel].label}`);
        await refreshOrders();
      } else {
        toast.error("Failed to update priority");
      }
    } catch (err) {
      console.error("Error saving priority:", err);
      toast.error("Error updating priority");
    } finally {
      setIsEditingPriority(null);
    }
  };

  // Close all edit modes when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuId(null);
      }
      
      // Close edit modes if clicked outside of their components
      // This is simplified logic - for more complex scenarios, you might need more refs
      const target = event.target as HTMLElement;
      if (!target.closest('select') && !target.closest('button')) {
        setIsEditingDifficulty(null);
        setIsEditingPriority(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle action menu
  const toggleActionMenu = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    setActionMenuId(current => current === orderId ? null : orderId);
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this repair order?");
      
      if (!confirmed) return;
      
      const { error } = await supabase
        .from('repair_orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete repair order");
      } else {
        toast.success("Repair order deleted successfully");
        await refreshOrders();
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Error deleting repair order");
    } finally {
      setActionMenuId(null);
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
          <div className="mt-4 text-center">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">Pending</p>
              <p className="text-3xl font-bold text-indigo-600">{pendingOrders?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Organize repair orders in the queue by dragging and dropping them. Higher priority orders will be assigned to technicians first.
          </p>
        </div>
      </div>
      
      {/* Combined Repair Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">All Repair Orders</h3>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-red-100 mr-1"></div>
              WAIT: {ordersByPriority[1]?.length || 0}
            </span>
            <span className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-yellow-100 mr-1"></div>
              VALET: {ordersByPriority[2]?.length || 0}
            </span>
            <span className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-green-100 mr-1"></div>
              LOANER: {ordersByPriority[3]?.length || 0}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          {pendingOrders?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending repair orders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Combine all orders while preserving priority */}
              {Object.entries(ordersByPriority)
                .sort((a, b) => Number(a[0]) - Number(b[0])) // Sort by priority (1, 2, 3)
                .flatMap(([priority, orders]) => {
                  const priorityNum = Number(priority);
                  return orders.map((order, index) => {
                    const config = PRIORITY_CONFIG[priorityNum];
                    return {
                      ...order,
                      priorityConfig: config,
                      priorityNum,
                      indexInPriority: index,
                      ordersInSamePriority: orders.length
                    };
                  });
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className={`border rounded-md p-3 ${
                      dragOverOrder === order.id 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 bg-white'
                    } ${
                      draggedOrder === order.id ? 'opacity-50' : ''
                    } transition-all duration-200`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, order.id)}
                    onDrop={(e) => handleDrop(e, order.id, order.priorityNum)}
                    data-order-id={order.id}
                    data-order-index={order.indexInPriority}
                  >
                    <div className="flex items-center">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move mr-3" />
                      
                      <div className="flex flex-col mr-4">
                        {/* Priority Badge */}
                        {isEditingPriority === order.id ? (
                          <div className="mb-1">
                            <select
                              value={newPriorityLevel}
                              onChange={(e) => setNewPriorityLevel(parseInt(e.target.value))}
                              className="text-xs border rounded p-1 mr-2"
                            >
                              <option value={1}>WAIT</option>
                              <option value={2}>VALET</option>
                              <option value={3}>LOANER</option>
                            </select>
                            <button
                              onClick={() => handleSavePriority(order.id)}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`flex items-center px-2 py-1 text-xs font-medium rounded-full mb-1 ${order.priorityConfig.color} cursor-pointer`}
                            onClick={() => handleEditPriority(order.id, order.priorityNum)}
                          >
                            {order.priorityConfig.icon}
                            <span className="ml-1">{order.priorityConfig.label}</span>
                          </div>
                        )}
                        
                        {/* Difficulty Level - Now under the priority badge */}
                        {isEditingDifficulty === order.id ? (
                          <div>
                            <select
                              value={newDifficultyLevel}
                              onChange={(e) => setNewDifficultyLevel(parseInt(e.target.value))}
                              className="text-xs border rounded p-1 mr-2"
                            >
                              <option value={1}>Level 1 (Basic)</option>
                              <option value={2}>Level 2 (Intermediate)</option>
                              <option value={3}>Level 3 (Advanced)</option>
                            </select>
                            <button
                              onClick={() => handleSaveDifficulty(order.id)}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`flex items-center px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${
                              DIFFICULTY_CONFIG[order.difficulty_level || 1].color
                            }`}
                            onClick={() => handleEditDifficulty(order.id, order.difficulty_level || 1)}
                          >
                            <BarChart2 className="w-3 h-3 mr-1" />
                            Level {order.difficulty_level || 1}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {order.description}
                        </div>
                      </div>
                      <div className="flex space-x-2 items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="relative" ref={actionMenuId === order.id ? menuRef : null}>
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                            onClick={(e) => toggleActionMenu(e, order.id)}
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-5 w-5 text-gray-500" />
                          </button>
                          
                          {actionMenuId === order.id && (
                            <div 
                              className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                              style={{ minWidth: '120px' }}
                            >
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  className="text-red-600 hover:bg-gray-100 hover:text-red-700 w-full text-left px-4 py-2 text-sm"
                                  onClick={() => deleteOrder(order.id)}
                                  role="menuitem"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow mt-4 p-4">
        <p className="text-sm text-gray-500">
          <strong>Note:</strong> Orders are dispatched based on priority level (WAIT → VALET → LOANER), then by order position in the queue.
        </p>
      </div>
    </div>
  );
};

export default QueueManagement;