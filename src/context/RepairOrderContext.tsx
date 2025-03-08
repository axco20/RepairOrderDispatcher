"use client";

// context/RepairOrderContext.tsx - adjusting for database column names
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Use your existing Supabase client
import { RepairOrder } from '@/types/repairOrder';
import { RepairOrderAssignment } from '@/types/repairAssignment';

// Define the context type
type RepairOrderContextType = {
  repairOrders: RepairOrder[];
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

  // Context value
  const value = {
    repairOrders,
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