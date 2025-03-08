"use client";

// context/RepairOrderContext.tsx - enhanced with queue functionality
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Use your existing Supabase client
import { RepairOrder } from '@/types/repairOrder';
import { RepairOrderAssignment } from '@/types/repairAssignment';

// Define the context type with queue management properties
type RepairOrderContextType = {
  repairOrders: RepairOrder[];
  pendingOrders: RepairOrder[]; // For QueueManagement
  inProgressOrders: RepairOrder[]; // For QueueManagement
  completedOrders: RepairOrder[]; // For QueueManagement
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  getRepairOrder: (id: string) => Promise<RepairOrder | null>;
  createRepairOrder: (data: Omit<RepairOrder, 'id' | 'createdAt'>) => Promise<RepairOrder | null>;
  updateRepairOrder: (id: string, updates: Partial<RepairOrder>) => Promise<RepairOrder | null>;
  deleteRepairOrder: (id: string) => Promise<boolean>;
  assignRepairOrder: (repairOrderId: string, technicianId: string) => Promise<RepairOrderAssignment | null>;
  completeRepairOrder: (repairOrderId: string) => Promise<boolean>;
  getRepairOrdersByStatus: (status: RepairOrder['status']) => Promise<RepairOrder[]>;
  getRepairOrdersByTechnician: (technicianId: string) => Promise<RepairOrder[]>;
  updatePriority: (orderId: string, newPriority: number) => Promise<boolean>; // For QueueManagement
  updateOrderPosition: (sourceOrderId: string, targetOrderId: string) => Promise<boolean>; // For QueueManagement
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  const snakeObj: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      snakeObj[snakeKey] = obj[key];
    }
  }
  
  return snakeObj;
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  const camelObj: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = obj[key];
    }
  }
  
  return camelObj;
};

// Create the context
const RepairOrderContext = createContext<RepairOrderContextType | undefined>(undefined);

// Provider component
export const RepairOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derive filtered order lists for QueueManagement
  const pendingOrders = useMemo(() => 
    repairOrders.filter(order => order.status === 'pending'), 
    [repairOrders]
  );
  
  const inProgressOrders = useMemo(() => 
    repairOrders.filter(order => order.status === 'in_progress'), 
    [repairOrders]
  );
  
  const completedOrders = useMemo(() => 
    repairOrders.filter(order => order.status === 'completed'), 
    [repairOrders]
  );

  // Load initial data
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Convert snake_case from DB to camelCase for our interface
      const camelCaseData = data ? data.map(toCamelCase) : [];
      setRepairOrders(camelCaseData);
      setError(null);
    } catch (err) {
      console.error('Error loading repair orders:', err);
      setError('Failed to load repair orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  // Get a single repair order
  const getRepairOrder = async (id: string): Promise<RepairOrder | null> => {
    try {
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data ? toCamelCase(data) : null;
    } catch (err) {
      console.error(`Error fetching repair order ${id}:`, err);
      setError(`Failed to fetch repair order ${id}`);
      return null;
    }
  };

  // Create a new repair order
  const createRepairOrder = async (data: Omit<RepairOrder, 'id' | 'createdAt'>): Promise<RepairOrder | null> => {
    try {
      // Convert our camelCase data to snake_case for the database
      const dbData = {
        description: data.description,
        order_description: data.orderDescription,  // Use snake_case
        priority: data.priority || 1,
        priority_type: data.priorityType,         // Use snake_case
        status: data.status || 'pending',
        // Add other fields as needed
      };
      
      console.log("Sending to database:", dbData);
      
      const { data: newOrder, error } = await supabase
        .from('repair_orders')
        .insert(dbData)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }
      
      if (newOrder) {
        // Convert snake_case back to camelCase
        const camelCaseOrder = toCamelCase(newOrder);
        setRepairOrders(prev => [camelCaseOrder, ...prev]);
        return camelCaseOrder;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating repair order:', err);
      setError('Failed to create repair order');
      throw err;
    }
  };

  // Update an existing repair order
  const updateRepairOrder = async (id: string, updates: Partial<RepairOrder>): Promise<RepairOrder | null> => {
    try {
      // Convert camelCase to snake_case for the database
      const snakeCaseUpdates = toSnakeCase(updates);
      
      const { data: updatedOrder, error } = await supabase
        .from('repair_orders')
        .update({
          ...snakeCaseUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (updatedOrder) {
        // Convert snake_case back to camelCase
        const camelCaseOrder = toCamelCase(updatedOrder);
        setRepairOrders(prev => 
          prev.map(order => order.id === id ? camelCaseOrder : order)
        );
        return camelCaseOrder;
      }
      
      return null;
    } catch (err) {
      console.error(`Error updating repair order ${id}:`, err);
      setError(`Failed to update repair order ${id}`);
      return null;
    }
  };

  // Delete a repair order
  const deleteRepairOrder = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('repair_orders')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setRepairOrders(prev => prev.filter(order => order.id !== id));
      return true;
    } catch (err) {
      console.error(`Error deleting repair order ${id}:`, err);
      setError(`Failed to delete repair order ${id}`);
      return false;
    }
  };

  // Assign a repair order to a technician
  const assignRepairOrder = async (repairOrderId: string, technicianId: string): Promise<RepairOrderAssignment | null> => {
    try {
      const now = new Date().toISOString();
      
      // First, update the repair order
      const { error: updateError } = await supabase
        .from('repair_orders')
        .update({
          status: 'in_progress',
          assigned_to: technicianId,   // snake_case
          assigned_at: now,            // snake_case
          updated_at: now
        })
        .eq('id', repairOrderId);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Then, create the assignment
      const newAssignment = {
        repair_order_id: repairOrderId,   // snake_case
        technician_id: technicianId,      // snake_case
        assigned_at: now,                // snake_case
        status: 'in_progress'
      };
      
      const { data: assignment, error: assignError } = await supabase
        .from('repair_assignments')
        .insert(newAssignment)
        .select()
        .single();
      
      if (assignError) {
        throw new Error(assignError.message);
      }
      
      // Refresh orders to get the updated state
      await refreshOrders();
      
      return assignment ? toCamelCase(assignment) : null;
    } catch (err) {
      console.error(`Error assigning repair order ${repairOrderId}:`, err);
      setError(`Failed to assign repair order ${repairOrderId}`);
      return null;
    }
  };

  // Complete a repair order
  const completeRepairOrder = async (repairOrderId: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      
      // Update the repair order
      const { error: updateError } = await supabase
        .from('repair_orders')
        .update({
          status: 'completed',
          completed_at: now,           // snake_case
          updated_at: now
        })
        .eq('id', repairOrderId);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Update assignment if it exists
      const { data: assignments } = await supabase
        .from('repair_assignments')
        .select('*')
        .eq('repair_order_id', repairOrderId);  // snake_case
      
      if (assignments && assignments.length > 0) {
        const { error: assignError } = await supabase
          .from('repair_assignments')
          .update({
            status: 'completed',
            completed_at: now         // snake_case
          })
          .eq('repair_order_id', repairOrderId);  // snake_case
        
        if (assignError) {
          throw new Error(assignError.message);
        }
      }
      
      await refreshOrders();
      return true;
    } catch (err) {
      console.error(`Error completing repair order ${repairOrderId}:`, err);
      setError(`Failed to complete repair order ${repairOrderId}`);
      return false;
    }
  };

  // Get repair orders by status
  const getRepairOrdersByStatus = async (status: RepairOrder['status']): Promise<RepairOrder[]> => {
    try {
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('status', status);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Convert snake_case from DB to camelCase for our interface
      return data ? data.map(toCamelCase) : [];
    } catch (err) {
      console.error(`Error fetching repair orders with status ${status}:`, err);
      setError(`Failed to fetch repair orders with status ${status}`);
      return [];
    }
  };

  // Get repair orders by technician
  const getRepairOrdersByTechnician = async (technicianId: string): Promise<RepairOrder[]> => {
    try {
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('assigned_to', technicianId);  // snake_case
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Convert snake_case from DB to camelCase for our interface
      return data ? data.map(toCamelCase) : [];
    } catch (err) {
      console.error(`Error fetching repair orders for technician ${technicianId}:`, err);
      setError(`Failed to fetch repair orders for technician ${technicianId}`);
      return [];
    }
  };

  // Update priority - for QueueManagement
  const updatePriority = async (orderId: string, newPriority: number): Promise<boolean> => {
    try {
      // Convert camelCase to snake_case for the database
      const snakeCaseUpdates = {
        priority: newPriority,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('repair_orders')
        .update(snakeCaseUpdates)
        .eq('id', orderId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setRepairOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, priority: newPriority } 
            : order
        )
      );
      
      return true;
    } catch (err) {
      console.error(`Error updating priority for order ${orderId}:`, err);
      setError(`Failed to update priority for order ${orderId}`);
      return false;
    }
  };

// Simplified version that doesn't rely on the position column
const updateOrderPosition = async (sourceOrderId: string, targetOrderId: string): Promise<boolean> => {
  try {
    // Find source and target orders in our current state
    const sourceOrder = repairOrders.find(order => order.id === sourceOrderId);
    const targetOrder = repairOrders.find(order => order.id === targetOrderId);
    
    if (!sourceOrder || !targetOrder) {
      console.error('Source or target order not found', { sourceOrderId, targetOrderId });
      throw new Error('Source or target order not found');
    }
    
    // Check if we need to update priority first
    if (sourceOrder.priority !== targetOrder.priority) {
      // If moving to a different priority group, simply update the priority
      const { error } = await supabase
        .from('repair_orders')
        .update({ 
          priority: targetOrder.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceOrderId);
      
      if (error) {
        console.error(`Failed to update priority for order ${sourceOrderId}:`, error);
        throw new Error(`Failed to update priority for order ${sourceOrderId}: ${error.message}`);
      }
      
      // Update local state
      setRepairOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === sourceOrderId) {
            return {
              ...order,
              priority: targetOrder.priority
            };
          }
          return order;
        });
      });
      
      return true;
    }
    
    // If same priority (just reordering), we can simply change the createdAt timestamp
    // to be just before or after the target item
    const targetTime = new Date(targetOrder.createdAt).getTime();
    
    // Place it one millisecond before the target
    const newTime = new Date(targetTime - 1).toISOString();
    
    const { error } = await supabase
      .from('repair_orders')
      .update({ 
        created_at: newTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', sourceOrderId);
    
    if (error) {
      console.error(`Failed to update order ${sourceOrderId}:`, error);
      throw new Error(`Failed to update order ${sourceOrderId}: ${error.message}`);
    }
    
    // Update local state
    setRepairOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id === sourceOrderId) {
          return {
            ...order,
            createdAt: newTime
          };
        }
        return order;
      });
    });
    
    return true;
  } catch (err) {
    console.error('Error updating order positions:', err);
    setError('Failed to update order positions');
    return false;
  }
};

  // Context value
  const value = {
    repairOrders,
    pendingOrders,    // Added for QueueManagement
    inProgressOrders, // Added for QueueManagement
    completedOrders,  // Added for QueueManagement
    loading,
    error,
    refreshOrders,
    getRepairOrder,
    createRepairOrder,
    updateRepairOrder,
    deleteRepairOrder,
    assignRepairOrder,
    completeRepairOrder,
    getRepairOrdersByStatus,
    getRepairOrdersByTechnician,
    updatePriority,      // Added for QueueManagement
    updateOrderPosition, // Added for QueueManagement
  };

  return (
    <RepairOrderContext.Provider value={value}>
      {children}
    </RepairOrderContext.Provider>
  );
};

// Custom hook for using the context
export const useRepairOrders = (): RepairOrderContextType => {
  const context = useContext(RepairOrderContext);
  if (context === undefined) {
    throw new Error('useRepairOrders must be used within a RepairOrderProvider');
  }
  return context;
};