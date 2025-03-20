"use client";

// context/RepairOrderContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RepairOrder } from '@/types/repairOrder';

// Define a simple RepairOrderAssignment type (even if you don't have the actual file)
interface RepairOrderAssignment {
  id?: string;
  repairOrderId: string;
  technicianId: string;
  assignedAt: string;
  status: "in_progress" | "completed";
  completedAt?: string;
}

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  const snakeObj: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Special case for difficulty_level - keep as is
      if (key === 'difficulty_level') {
        snakeObj.difficulty_level = obj[key];
        continue;
      }
      
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
      // Special case for difficulty_level - keep as is
      if (key === 'difficulty_level') {
        camelObj.difficulty_level = obj[key];
        continue;
      }
      
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = obj[key];
    }
  }
  
  return camelObj;
};

// Define the context type with queue management properties
type RepairOrderContextType = {
  repairOrders: RepairOrder[];
  pendingOrders: RepairOrder[]; // For QueueManagement
  inProgressOrders: RepairOrder[]; // For QueueManagement
  completedOrders: RepairOrder[]; // For QueueManagement
  assignments: RepairOrderAssignment[]; // For Performance component
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  getRepairOrder: (id: string) => Promise<RepairOrder | null>;
  createRepairOrder: (data: Omit<RepairOrder, 'id' | 'createdAt'>) => Promise<RepairOrder | null>;
  updateRepairOrder: (id: string, updates: Partial<RepairOrder>) => Promise<RepairOrder | null>;
  deleteRepairOrder: (id: string) => Promise<boolean>;
  assignRepairOrder: (repairOrderId: string, technicianId: string) => Promise<boolean>;
  completeRepairOrder: (repairOrderId: string) => Promise<boolean>;
  getRepairOrdersByStatus: (status: RepairOrder['status']) => Promise<RepairOrder[]>;
  getRepairOrdersByTechnician: (technicianId: string) => Promise<RepairOrder[]>;
  updatePriority: (orderId: string, newPriority: number) => Promise<boolean>; // For QueueManagement
  updateOrderPosition: (sourceOrderId: string, targetOrderId: string) => Promise<boolean>; // For QueueManagement
  // Technician dashboard functions
  technicianOrders: (technicianId: string) => RepairOrder[];
  getNextRepairOrder: (technicianId: string) => Promise<boolean>;
  technicianActiveOrderCount: (technicianId: string) => number;
  canRequestNewOrder: (technicianId: string) => boolean;
};

// Create the context
const RepairOrderContext = createContext<RepairOrderContextType | undefined>(undefined);

// Provider component
export const RepairOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [assignments, setAssignments] = useState<RepairOrderAssignment[]>([]);
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
      
      // Print first record for debugging
      if (data && data.length > 0) {
        console.log("First record from database:", data[0]);
      }
      
      // Convert snake_case from DB to camelCase for our interface
      const camelCaseData = data ? data.map(item => {
        const camelItem = toCamelCase(item);
        
        // Explicitly preserve difficulty_level
        camelItem.difficulty_level = item.difficulty_level !== null ? item.difficulty_level : 1;
        
        // Ensure technician_id is properly mapped to assignedTo
        if (item.assigned_to) {
          camelItem.assignedTo = item.assigned_to;
        }
        
        return camelItem;
      }) : [];
      
      setRepairOrders(camelCaseData);
      setError(null);
    } catch (err) {
      console.error('Error loading repair orders:', err);
      setError('Failed to load repair orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      console.log("Fetching repair assignments...");
      
      const { data, error } = await supabase
        .from('repair_assignments')
        .select('*');
      
      if (error) {
        console.error('Error fetching repair assignments:', {
          message: error.message,
          details: error.details,
          code: error.code,
          hint: error.hint
        });
        return [];
      }
      
      console.log(`Successfully fetched ${data?.length || 0} assignments`);
      
      // Convert snake_case from DB to camelCase for our interface
      const camelCaseData = data ? data.map(toCamelCase) : [];
      setAssignments(camelCaseData);
      return camelCaseData;
    } catch (err) {
      console.error('Exception in fetchAssignments:', err);
      return [];
    }
  };

  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      await refreshOrders();
      await fetchAssignments();
    };
    
    loadData();
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
      
      const camelCaseOrder = data ? toCamelCase(data) : null;
      
      // Explicitly preserve difficulty_level
      if (camelCaseOrder && data) {
        camelCaseOrder.difficulty_level = data.difficulty_level !== null ? data.difficulty_level : 1;
      }
      
      return camelCaseOrder;
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
        order_description: data.orderDescription,
        priority: data.priority || 1,
        priority_type: data.priorityType,
        status: data.status || 'pending',
        difficulty_level: data.difficulty_level || 1, // Explicitly include difficulty_level
        dealership_id: data.dealership_id,

        // Add other fields as needed
      };
      
      console.log("Creating repair order with data:", dbData);
      
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
        
        // Ensure difficulty_level is preserved
        camelCaseOrder.difficulty_level = newOrder.difficulty_level;
        
        console.log("Created order with difficulty:", camelCaseOrder.difficulty_level);
        
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
      
      // Explicitly preserve difficulty_level if it exists in updates
      if (updates.difficulty_level !== undefined) {
        snakeCaseUpdates.difficulty_level = updates.difficulty_level;
      }
      
      console.log("Updating order with data:", snakeCaseUpdates);
      
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
        
        // Explicitly preserve difficulty_level
        camelCaseOrder.difficulty_level = updatedOrder.difficulty_level;
        
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
  // CRITICAL FUNCTION: assignRepairOrder - directly updates the assigned_to field
  const assignRepairOrder = async (repairOrderId: string, technicianId: string): Promise<boolean> => {
    try {
      console.log(`🔄 Attempting to assign order ${repairOrderId} to technician ${technicianId}`);
      const now = new Date().toISOString();
  
      // ✅ Only update the `assigned_to` column
      const { data, error } = await supabase
        .from("repair_orders")
        .update({ assigned_to: technicianId, status: "in_progress", assigned_at: now }) 
        .eq("id", repairOrderId)
        .select();
  
      if (error) {
        console.error("❌ Error updating assigned_to field:", error);
        return false;
      }
  
      console.log("✅ Successfully updated assigned_to:", data);
  
      // ✅ Fetch the updated row for verification
      const { data: updatedOrder, error: verifyError } = await supabase
        .from("repair_orders")
        .select("id, assigned_to") // ✅ Only fetching relevant fields
        .eq("id", repairOrderId)
        .single();
  
      if (verifyError) {
        console.error("❌ Error verifying update:", verifyError);
      } else {
        console.log("🔍 Verification successful:", updatedOrder);
      }
  
      await refreshOrders(); // ✅ Refresh UI
      return true;
    } catch (err) {
      console.error("❌ Exception in assignRepairOrder:", err);
      return false;
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
      const camelCaseData = data ? data.map(item => {
        const camelItem = toCamelCase(item);
        // Preserve difficulty_level
        camelItem.difficulty_level = item.difficulty_level !== null ? item.difficulty_level : 1;
        return camelItem;
      }) : [];
      
      return camelCaseData;
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
        .from("repair_orders")
        .select("*")
        .eq("assigned_to", technicianId); // Ensure it's filtering correctly
  
      if (error) {
        throw new Error(error.message);
      }
  
      // Convert snake_case from DB to camelCase for our interface
      const camelCaseData = data ? data.map(item => {
        const camelItem = toCamelCase(item);
        // Preserve difficulty_level
        camelItem.difficulty_level = item.difficulty_level !== null ? item.difficulty_level : 1;
        return camelItem;
      }) : [];
      
      return camelCaseData;
    } catch (err) {
      console.error(`Error fetching repair orders for technician ${technicianId}:`, err);
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

  // Update order position - for QueueManagement
  const updateOrderPosition = async (sourceOrderId: string, targetOrderId: string): Promise<boolean> => {
    try {
      // Find source and target orders in our current state
      const sourceOrder = repairOrders.find(order => order.id === sourceOrderId);
      const targetOrder = repairOrders.find(order => order.id === targetOrderId);
      
      if (!sourceOrder || !targetOrder) {
        console.error('Source or target order not found', { sourceOrderId, targetOrderId });
        throw new Error('Source or target order not found');
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

  // Get orders assigned to a technician
  const technicianOrders = (technicianId: string): RepairOrder[] => {
    console.log(`Finding orders for technician: ${technicianId}`);
    console.log(`Total orders in state: ${repairOrders.length}`);
    
    // Log the first repair order to see its structure
    if (repairOrders.length > 0) {
      console.log("First repair order keys:", Object.keys(repairOrders[0]));
      console.log("First repair order:", repairOrders[0]);
    }
    
    // First look for direct assignments in the orders
    const directOrders = repairOrders.filter(order => {
      // Check both camelCase and snake_case property names
      return (order.assignedTo === technicianId) || 
             (order.assigned_to === technicianId);
    });
    
    if (directOrders.length > 0) {
      console.log(`Found ${directOrders.length} directly assigned orders`);
      return directOrders;
    }
    
    // If no direct assignments found, check repair_assignments table
    console.log("Checking assignments table...");
    console.log(`Total assignments: ${assignments.length}`);
    
    const assignedOrders = [];
    
    // Match orders to assignments
    for (const order of repairOrders) {
      // Find matching assignment
      const matchingAssignment = assignments.find(a => 
        a.repairOrderId === order.id && 
        a.technicianId === technicianId &&
        a.status === "in_progress"
      );
      
      if (matchingAssignment) {
        console.log(`Found order ${order.id} matched via assignment`);
        // Add assignedTo property
        assignedOrders.push({
          ...order,
          assignedTo: technicianId
        });
      }
    }
    
    console.log(`Found ${assignedOrders.length} orders via assignments table`);
    return assignedOrders;
  };

  // Get the number of active orders for a technician
  const technicianActiveOrderCount = (technicianId: string): number => {
    return technicianOrders(technicianId).filter(order => 
      order.status === 'in_progress'
    ).length;
  };

  // Check if a technician can request a new order
  const canRequestNewOrder = (technicianId: string): boolean => {
    // You can customize this logic based on your requirements
    const activeOrderCount = technicianActiveOrderCount(technicianId);
    const maxAllowedOrders = 5; // Example: set a maximum number of concurrent orders
    return activeOrderCount < maxAllowedOrders && pendingOrders.length > 0;
  };

// Updated getNextRepairOrder function that respects skill levels
const getNextRepairOrder = async (technicianId: string): Promise<boolean> => {
  try {
    console.log(`🔍 Checking for next repair order for technician: ${technicianId}`);

    // Check if technician can receive a new order
    if (!canRequestNewOrder(technicianId)) {
      console.warn(`⚠️ Technician ${technicianId} cannot request a new order (max orders or no pending orders).`);
      return false;
    }

    // Get the technician's skill level
    const { data: techData, error: techError } = await supabase
      .from("users")
      .select("skill_level")
      .eq("auth_id", technicianId)
      .single();

    if (techError) {
      console.error("❌ Error fetching technician skill level:", techError);
      return false;
    }

    const techSkillLevel = techData?.skill_level || 1; // Default to level 1 if not set
    console.log(`🧠 Technician skill level: ${techSkillLevel}`);

    // Fetch pending orders that match the technician's skill level or lower
    // Order by priority first (lowest priority value = highest priority), then by creation date (oldest first)
    const { data: matchingOrders, error } = await supabase
      .from("repair_orders")
      .select("*")
      .eq("status", "pending")
      .lte("difficulty_level", techSkillLevel) // Only orders with difficulty <= tech skill
      .order("priority", { ascending: true }) // Highest priority first (WAIT=1, VALET=2, LOANER=3)
      .order("created_at", { ascending: true }); // Oldest first

    if (error) {
      console.error("❌ Error fetching matching orders:", error);
      return false;
    }

    if (!matchingOrders || matchingOrders.length === 0) {
      console.warn(`⚠️ No pending repair orders found matching technician skill level ${techSkillLevel}.`);
      return false;
    }

    // Get the first order that matches (highest priority, oldest)
    const nextOrder = matchingOrders[0];
    console.log(`✅ Found order to assign: ${nextOrder.id} (Priority: ${nextOrder.priority}, Difficulty: ${nextOrder.difficulty_level})`);

    // Attempt to assign the order to the technician
    const result = await assignRepairOrder(nextOrder.id, technicianId);

    if (result) {
      console.log("🎉 Successfully assigned order!");
      await refreshOrders(); // Refresh UI
      return true;
    } else {
      console.error("❌ Failed to assign order!");
      return false;
    }
  } catch (err) {
    console.error("❌ Error in getNextRepairOrder:", err);
    return false;
  }
};
  // Context value
  const value = {
    repairOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    assignments,
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
    updatePriority,
    updateOrderPosition,
    // Technician functions
    technicianOrders,
    getNextRepairOrder,
    technicianActiveOrderCount,
    canRequestNewOrder
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